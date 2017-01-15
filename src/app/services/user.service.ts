import {Injectable, Inject} from "@angular/core";
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

/**
* A central place to manage user state. Encapsulates logging a user in/out, as well as metadata information about the user, like what their API Key is.
*/
@Injectable()
export class UserService {

  public apikey:string;
  private username:string;
  public userService:Metadata;

  constructor(@Inject(UserLoginService) public loginService:UserLoginService,
              @Inject(FineoApi) fineo:FineoApi){
    this.userService = fineo.meta;
  }

  public login(email:string, password:string, onlogin:LoggedIn):void {
    this.username = email;
    let mgmt = this;

    // when the user is logged in, look up the api key
    // after the user is "setup", then allow the login to acknowledge the success
    let apiKeyLookup = new ApiKeyLookupOnLogin(onlogin, mgmt);

    let startPasswordReset = function(resetCallback:StartPasswordResetCallback){
      mgmt.loginService.forgotPassword(mgmt.username, {
          cognitoCallback: function(message, result){
            console.log("Starting forgot password - message: "+message+", result: "+JSON.stringify(result));
            if(!result){
              console.log(message);
              resetCallback.onFailure(message);
            }else{
              resetCallback.onSuccess();
            }
          },
          resetPassword(){},
          handleMFA(){}
      });
    };

    let finishPasswordReset = function(code, passsword){
      mgmt.loginService.confirmNewPassword(email, code, passsword, {
          cognitoCallback: function(message, result){
            console.log("Finishing password reset - message: "+message+", result: "+JSON.stringify(result));
            if(!result){
              onlogin.resetPasswordFailed(message);
            }
          },
          resetPassword(){},
          handleMFA(){}
      });
    };

    // do the login process
    this.loginService.authenticate(email, password, new LoginCallback(startPasswordReset, finishPasswordReset, apiKeyLookup));
  }

  public logout():void{
    // reset the internal user information and then logout the user (so credentials are invalidated)
    this.apikey = null;
    this.loginService.logout();
  }

  public alertFineo(msg:string):void{
     alert(msg+" Please contact help@fineo.io with the output of the web console.");
  }

  transform(value: Object): string {
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
  }

  loggedIn(){
    let lookup = this;
    this.mgmt.userService.getApiKey()
      .then(function(success){
        lookup.mgmt.apikey = success.data;
        console.log("got api key response: "+ JSON.stringify(success));
        // login fully complete
        lookup.delegate.loggedIn();
      })
      .catch(function(err){
        console.log("Failed to get api key because: "+ lookup.mgmt.transform(err));
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