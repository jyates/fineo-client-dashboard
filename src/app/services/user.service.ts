import {Injectable, Inject} from "@angular/core";

import {GlobalState} from '../global.state'

import {
  CognitoCallback,
  LoggedInCallback,
  UserLoginService
} from './cognito.service'

import {
  FineoApi,
  Metadata
} from './fineo.service'

/**
* So you want to hear about the user being logged in, eh? Implement this.
*/
export interface LoggedIn {
  loggedIn():void;
  
  loginFailed(reason:string):void;

  /**
  * User needs to reset their password and, possibly, provide some additional atttributes
  *  - attributesToUpdate: update this with the new attributes
  *  - requiredAttributes: the attributes that need to be updated
  *  - callback: call this function with the new password (after getting the required attributes from the user).
  * 
  * The callback will later invoke another of the LoggedIn methods on success/failure
  */
  resetPasswordRequired(attributesToUpdate:Object, requiredAttributes, callback:(password:string) => void):void;

  resetPasswordFailed(message):void;
}

export interface ConfirmPasswordCallback{
  confirm(verificationCode: string, password:string):Promise<any>;
}

/**
 * Implement this to be notified about resets
 */
export interface PasswordResetCallback {

  verificationCodeSent(location, confirm:ConfirmPasswordCallback):void;

  resetFailed(reason:string):void;
}

/**
* A central place to manage user state. Encapsulates logging a user in/out, as well as metadata information about the user, like what their API Key is.
*/
@Injectable()
export class UserService {

  public static API_KEY_STATE:string = "fineo.schema.apikey";
  public apikey:string;
  private username:string;
  public userService:Metadata;

  constructor(@Inject(UserLoginService) public loginService:UserLoginService,
              @Inject(FineoApi) private fineo:FineoApi,
              @Inject(GlobalState) private state:GlobalState){
    this.userService = fineo.meta;
  }

  public login(email:string, password:string, onlogin:LoggedIn):void {
    this.username = email;
    let mgmt = this;

    // when the user is logged in, look up the api key
    // after the user is "setup", then allow the login to acknowledge the success
    let apiKeyLookup = new ApiKeyLookupOnLogin(onlogin, mgmt);

    let startPasswordReset = function(resetCallback:StartPasswordResetCallback){
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
    this.loginService.authenticate(email, password, new LoginCallback(startPasswordReset, finishPasswordReset, apiKeyLookup));
  }

  public resetPassword(username:string, callback:PasswordResetCallback) {
    let self = this;
    this.loginService.forgotPassword(username, new SuccessFailureCallback(
      // success
      (message, result) => {
        callback.verificationCodeSent(message, {
          confirm: function(verificationCode: string, password:string) {
            return new Promise((resolve, reject) => {
              // basic mapping of resolve/success - reject/failure, based on message != null
              let cognitoCallback = new SuccessFailureCallback(
                (message, result) => {resolve(result);},
                (message, result) => {reject(message);});

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

  public logout():void{
    // reset the internal user information and then logout the user (so credentials are invalidated)
    this.apikey = null;
    this.fineo.setApiKey(null);
    this.loginService.logout();
  }

  public setApiKey(key:string):void {
    this.apikey = key;
    this.fineo.setApiKey(key);
    this.state.notifyDataChanged(UserService.API_KEY_STATE, key);
  }

  public alertFineo(msg:string):void {
     alert(msg+" Please contact help@fineo.io with the output of the web console.");
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
}

interface StartPasswordResetCallback{
  onSuccess():void;

  onFailure(message:string):void;
}

class DelegatingLoggedIn implements LoggedIn {
  constructor(public delegate:LoggedIn){}

  loggedIn():void{
    this.delegate.loggedIn();
  }
  
  loginFailed(reason:string){
    this.delegate.loginFailed(reason);
  }

  resetPasswordRequired(attributesToUpdate:Object, requiredAttributes, callback:(password:string) => void):void{
    this.delegate.resetPasswordRequired(attributesToUpdate, requiredAttributes, callback);
  }

  resetPasswordFailed(message):void{
    this.delegate.resetPasswordFailed(message);
  }
}

class ApiKeyLookupOnLogin extends DelegatingLoggedIn{
  constructor(delegate:LoggedIn, private mgmt:UserService){
    super(delegate);
    console.log("Looking up API Key before continuing login through delegate")
  }

  loggedIn(){
    let lookup = this;
    console.log("Starting api key lookup");
    this.mgmt.userService.getApiKey()
      .then(function(success){
        console.log("got api key response: "+ JSON.stringify(success));
        lookup.mgmt.setApiKey(success.apiKey);
        // login fully complete
        lookup.delegate.loggedIn();
      })
      .catch(function(err){
        console.log("Failed to get api key because: "+ UserService.transform(err));
        // ensure that we can try logging in again
        lookup.mgmt.loginService.logout();
        lookup.mgmt.alertFineo("Failed to download api key!");
        lookup.delegate.loginFailed("Internal server error: could not locate api key");
      });
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
  constructor(private startResetPassword, private finishPasswordReset:(code:string, password:string) =>void, private login:LoggedIn){}

  cognitoCallback(message:string, result:any) {
    // error... of some sort
    if (message != null) {
      if(message == "Password reset required for the user"){
        console.log("Need to reset password for user");
        let callback = this;
        // start the user forgot password flow
        this.startResetPassword({
          onSuccess(){
              let attributes = {}
              callback.login.resetPasswordRequired(attributes, ["verificationCode"], function(password:string):void {
                  callback.finishPasswordReset(attributes["verificationCode"], password);
            });
          },
          onFailure(message:string){
            // for each of the "logins" attempt trigger the reset password flow
            callback.login.resetPasswordFailed("Password needed to be reset, but it failed!\n"+message);
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

  resetPassword(attributesToUpdate, requiredAttributes, callback:(password:string) => any):void{
    this.login.resetPasswordRequired(attributesToUpdate, requiredAttributes, callback);
  }


  handleMFA(codeDeliveryDetails, callbackWithCode:(mfa:string) => any):void{
    // noop - we don't support MFA right now because we don't have a secondary input mechanism for users
    // when they use their username/password on a third party tool (e.g. BI tool)
  }
}

class SuccessFailureCallback implements CognitoCallback {

  constructor(private success:(message:any, result:any) => void,
              private failure:(message:any, result:any) => void,
              private decider?:(message:any, result:any) => boolean) {
    if(this.decider == null) {
      this.decider = function(message, result){
          return result != null;
        };
    }
  }

  cognitoCallback(message, result){
    if(this.decider(message, result)) {
      if(this.success != null){
        this.success(message, result);
      }
    }else {
      if(this.failure != null){
        this.failure(message, result);
      }
    }
  }

  resetPassword(attributesToUpdate, requiredAttributes, callback:(password:string) => any):void{
    // noop
  }


  handleMFA(codeDeliveryDetails, callbackWithCode:(mfa:string) => any):void{
    // noop
  }
}
