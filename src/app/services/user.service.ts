import { Injectable, Inject } from "@angular/core";

import { GlobalState } from '../global.state'

import {
  CognitoCallback,
  LoggedInCallback,
  UserLoginService,
  WithCredentials
} from './cognito.service'

const USER_STORAGE_KEY: string = "currentUser";
const ONE_HOUR_MILLIS: number = 3600000;

/**
* So you want to hear about the user being logged in, eh? Implement this.
*/
export interface LoggedIn {
  loggedIn(): void;

  loginFailed(reason: string): void;

  /**
  * User needs to reset their password and, possibly, provide some additional atttributes
  *  - attributesToUpdate: update this with the new attributes
  *  - requiredAttributes: the attributes that need to be updated
  *  - callback: call this function with the new password (after getting the required attributes from the user).
  * 
  * The callback will later invoke another of the LoggedIn methods on success/failure
  */
  resetPasswordRequired(attributesToUpdate: Object, requiredAttributes, callback: (password: string) => void): void;

  resetPasswordFailed(message): void;
}

export interface ConfirmPasswordCallback {
  confirm(verificationCode: string, password: string): Promise<any>;
}

/**
 * Implement this to be notified about resets
 */
export interface PasswordResetCallback {

  verificationCodeSent(location, confirm: ConfirmPasswordCallback): void;

  resetFailed(reason: string): void;
}

export class Attribute {

  constructor(private name: string, private value: any) { }

  public getName(): string {
    return this.name;
  }

  public getValue(): any {
    return this.value;
  }
}

/**
* A central place to manage user state. Encapsulates logging a user in/out, as well as metadata information about the user, like what their API Key is.
*/
@Injectable()
export class UserService {

  public static API_KEY_STATE: string = "fineo.schema.apikey";
  public apikey: string;
  private username: string;

  constructor( @Inject(UserLoginService) public loginService: UserLoginService,
    @Inject(GlobalState) private state: GlobalState) {
  }

  public login(email: string, password: string, onlogin: LoggedIn): void {
    this.username = email;
    let mgmt = this;
    let setUser = new SetUserOnLogin(onlogin, password, email);
    let startPasswordReset = function(resetCallback: StartPasswordResetCallback) {
      let cc = new SuccessFailureCallback(
        (message, result) => { resetCallback.onSuccess(); },
        (message, result) => {
          console.log(message);
          resetCallback.onFailure(message);
        });
      mgmt.loginService.forgotPassword(mgmt.username, cc);
    };

    let finishPasswordReset = function(code, passsword) {
      mgmt.loginService.confirmNewPassword(email, code, passsword,
        new SuccessFailureCallback(null, (message, result) => {
          console.log(message);
          onlogin.resetPasswordFailed(message);
        })
      );
    };

    // do the login process
    this.loginService.authenticate(email, password, new LoginCallback(startPasswordReset, finishPasswordReset, setUser));
  }

  public resetPassword(username: string, callback: PasswordResetCallback) {
    let self = this;
    this.loginService.forgotPassword(username, new SuccessFailureCallback(
      // success
      (message, result) => {
        callback.verificationCodeSent(message, {
          confirm: function(verificationCode: string, password: string) {
            return new Promise((resolve, reject) => {
              // basic mapping of resolve/success - reject/failure, based on message != null
              let cognitoCallback = new SuccessFailureCallback(
                (message, result) => { resolve(result); },
                (message, result) => { reject(message); });

              self.loginService.confirmNewPassword(username, verificationCode, password, cognitoCallback);
            });
          }
        });
      },
      // failure
      (message, result) => {
        callback.resetFailed(message);
      })
    );
  }

  public changePassword(oldPassword: string, newPassword: string): Promise<any> {
    return new Promise((accept, reject) => {
      this.getUser().then((us: UserWithSession) => {
        let user = us.user;
        let session = us.session;
        return new Promise((accept, reject) => {
          user.changePassword(oldPassword, newPassword, function(err, result) {
            if (err) {
              reject(err);
              return;
            }
            accept(result);
          })
        });
      });
    });
  }

  public userAttributes(): Promise<Attribute[]> {
    return this.getUser().then((us: UserWithSession) => {
      let user = us.user;
      let session = us.session;
      return new Promise((accept, reject) => {
        user.getUserAttributes((err, result) => {
          if (err) {
            reject(err);
            return;
          }
          accept(result);
        })
      });
    });
  }

  public updateAttributes(attributes: Attribute[]): Promise<any> {
    // convert the attributes over
    let list = [];
    attributes.forEach(attrib => {
      var attribute = {
        Name: attrib.getName(),
        Value: attrib.getValue()
      };
      var att = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(attribute);
      list.push(att);
    });

    return this.getUser().then((us: UserWithSession) => {
      let user = us.user;
      let session = us.session;
      user.updateAttributes(list, function(err, result) { });
    });
  }

  private getUser(): Promise<UserWithSession> {
    console.log("getting user...");
    let promise = Promise.resolve(this.loginService.cognitoUtil.getCurrentUser());
    // make sure we have a non-null user
    return promise.then(maybeUser => {
      if (maybeUser == null) {
        console.log("UserLoginService: can't retrieve the current user. Trying relogin");
        return this.relogin();
      }
      return maybeUser;
    }).then(user => {
      return new Promise((resolve, reject) => {
        user.getSession((err, session) => {
          if (err) {
            console.log("UserLoginService: Couldn't get the session: " + err, err.stack);
            reject(err);
            return;
          }
          resolve(new UserWithSession(user, session));
        })

      });
    });
  }

  public logout(): void {
    // reset the internal user information and then logout the user (so credentials are invalidated)
    this.loginService.logout();
    localStorage.removeItem(USER_STORAGE_KEY);
    // unset the api key
    this.state.notifyDataChanged(UserService.API_KEY_STATE, null);
    this.apikey = null;
  }

  public alertFineo(msg: string): void {
    alert(msg + " Please contact help@fineo.io with the output of the web console.");
  }

  public static transform(value: Object): string {
    var seen = [];

    return JSON.stringify(value, function(key, val) {
      if (val != null && typeof val == "object") {
        if (seen.indexOf(val) >= 0) {
          return;
        }
        seen.push(val);
      }
      return val;
    });
  }

  /**
   * Attempt to relogin the user from local storage
   */
  private relogin(): Promise<any> {
    console.log("Attempting relogin");
    var currentUser = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
    if (currentUser == null) {
      console.log(" -> no user found in local storage - done relogin()");
      return Promise.reject("No user found in local storage.");
    }

    let now = Date.now();
    if (now > currentUser.timeout) {
      // remove the user key so we don't try again
      localStorage.removeItem(USER_STORAGE_KEY)
      console.log(" -> user info expired in local storage. Done relogin()");
      return Promise.reject("User data expired");
    }

    return new Promise((resolve, reject) => {
      let self = this;
      this.login(currentUser.name, currentUser.password, {
        loggedIn: function() {
          resolve(self.loginService.cognitoUtil.getCurrentUser());
        },

        loginFailed: function(reason: string) {
          console.log(" -> relogin failed! Logging out");
          self.logout()
          console.log("-> Rejecting login attempt. Done relogin()")
          reject(reason);
        },
        resetPasswordRequired: function(attributesToUpdate, requiredAttributes, callback) {
          reject("Reset password required");
        },
        resetPasswordFailed: function(message) {
          reject("Attempted to reset password on relogin. Failed: " + message);
        }
      })
    });
  }

  public withCredentials(func: WithCredentials) {
    let self = this;
    let wrapper = {
      with: func.with,
      noCredentials: function() {
        // attempt to relogin
        self.relogin().then(user => {
          self.loginService.withCredentials(func);
        }).catch(err => {
          func.noCredentials();
        })
      }
    };
    this.loginService.withCredentials(wrapper);
  }

  public getUserName(): string {
    return this.loginService.cognitoUtil.getCurrentUser().getUsername()
  }

  public setApiKey(key: string): void {
    console.log("Setting api key in user: ", key);
    this.apikey = key;
    this.state.notifyDataChanged(UserService.API_KEY_STATE, key);
  }
}

class UserWithSession {
  constructor(public user, public session) { }
}

interface WithUser {
  withUser(user: any, session: any): void;
  loadUserFailure(err);
}

interface StartPasswordResetCallback {
  onSuccess(): void;

  onFailure(message: string): void;
}

class DelegatingLoggedIn implements LoggedIn {
  constructor(public delegate: LoggedIn) { }

  loggedIn(): void {
    this.delegate.loggedIn();
  }

  loginFailed(reason: string) {
    this.delegate.loginFailed(reason);
  }

  resetPasswordRequired(attributesToUpdate: Object, requiredAttributes, callback: (password: string) => void): void {
    this.delegate.resetPasswordRequired(attributesToUpdate, requiredAttributes, callback);
  }

  resetPasswordFailed(message): void {
    this.delegate.resetPasswordFailed(message);
  }
}

class SetUserOnLogin extends DelegatingLoggedIn {
  constructor(delegate: LoggedIn, private password: string, private name: string) {
    super(delegate);
  }

  loggedIn() {
    let now = Date.now()
    let valid_until = now + ONE_HOUR_MILLIS;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ name: this.name, password: this.password, timeout: valid_until }));
    super.loggedIn();
    // this.delegate.loggedIn();
  }
}

/**
* Does the hard work of translating from the CognitoService (ripped from aws examples) into something that we can more easily understand.
* The details of the translation are intimiately times to the implemention in CognitoService.
* It probably would have been better to re-implement cognito service correctly, but this was faster :-(
*/
class LoginCallback implements CognitoCallback {

  /**
  * Handler to translate the simple cognito callbacks into the LoggedIn listener.
  * @param {simpleResetCallback} method to call from the LoggedIn when it acquires a new user password and wants to finish the login
  * @param {onlogins} callbacks to update when the logins completes, fails, or needs a password reset.
  */
  constructor(private startResetPassword, private finishPasswordReset: (code: string, password: string) => void, private login: LoggedIn) { }

  cognitoCallback(message: string, result: any) {
    // error... of some sort
    if (message != null) {
      if (message == "Password reset required for the user") {
        console.log("Need to reset password for user");
        let callback = this;
        // start the user forgot password flow
        this.startResetPassword({
          onSuccess() {
            let attributes = {}
            callback.login.resetPasswordRequired(attributes, ["verificationCode"], function(password: string): void {
              callback.finishPasswordReset(attributes["verificationCode"], password);
            });
          },
          onFailure(message: string) {
            // for each of the "logins" attempt trigger the reset password flow
            callback.login.resetPasswordFailed("Password needed to be reset, but it failed!\n" + message);
          }
        });


      } else {
        this.login.loginFailed(message);
      }
    }
    // success
    else {
      this.login.loggedIn();
    }
  }

  resetPassword(attributesToUpdate, requiredAttributes, callback: (password: string) => any): void {
    this.login.resetPasswordRequired(attributesToUpdate, requiredAttributes, callback);
  }


  handleMFA(codeDeliveryDetails, callbackWithCode: (mfa: string) => any): void {
    // noop - we don't support MFA right now because we don't have a secondary input mechanism for users
    // when they use their username/password on a third party tool (e.g. BI tool)
  }
}

class SuccessFailureCallback implements CognitoCallback {

  constructor(private success: (message: any, result: any) => void,
    private failure: (message: any, result: any) => void,
    private decider?: (message: any, result: any) => boolean) {
    if (this.decider == null) {
      this.decider = function(message, result) {
        return result != null;
      };
    }
  }

  cognitoCallback(message, result) {
    if (this.decider(message, result)) {
      if (this.success != null) {
        this.success(message, result);
      }
    } else {
      if (this.failure != null) {
        this.failure(message, result);
      }
    }
  }

  resetPassword(attributesToUpdate, requiredAttributes, callback: (password: string) => any): void {
    // noop
  }


  handleMFA(codeDeliveryDetails, callbackWithCode: (mfa: string) => any): void {
    // noop
  }
}
