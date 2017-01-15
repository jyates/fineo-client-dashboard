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

  private apikey:string;
  private username:string;
  private userService:Metadata;

  constructor(@Inject(UserLoginService) private loginService:UserLoginService,
              @Inject(FineoApi) fineo:FineoApi){
    this.userService = fineo.meta;
  }

  public login(email:string, password:string, onlogin:LoggedIn):void {
    this.username = email;
    let mgmt = this;

    // when the user is logged in, look up the api key
    let apiKeyLookup = {
      loggedIn: function(){
        mgmt.userService.getApiKey()
          .then(function(success){
            mgmt.apikey = success.data;
            console.log("got api key response: "+ JSON.stringify(success));
        })
          .catch(function(err){
            console.log("Failed to get api key because: "+err);
            mgmt.alertFineo("Failed to download api key!");
          });
      },
      loginFailed(reason){},
      resetPasswordRequired(att, req, call){},
      resetPasswordFailed(msg){}
    };

    let startPasswordReset = function(){
      mgmt.loginService.forgotPassword(mgmt.username, {
          cognitoCallback: function(message, result){
            if(!result){
              mgmt.alertFineo("Failed to trigger password reset!");
            }
          },
          resetPassword(){},
          handleMFA(){}
      });
    };

    let finishPasswordReset = function(code, passsword){
      mgmt.loginService.confirmNewPassword(email, code, passsword, {
          cognitoCallback: function(message, result){
            if(!result){
              onlogin.resetPasswordFailed(message);
            }
          },
          resetPassword(){},
          handleMFA(){}
      });
    };

    // do the login process
    this.loginService.authenticate(email, password, new LoginCallback(startPasswordReset, finishPasswordReset, [onlogin, apiKeyLookup]));
  }

  public logout():void{
    // reset the internal user information and then logout the user (so credentials are invalidated)
    this.apikey = null;
    this.loginService.logout();
  }

  private alertFineo(msg:string):void{
     alert(msg+" Please contact help@fineo.io with the output of the web console.");
  }
}

class LoginCallback implements CognitoCallback {

  /**
  * Handler to translate the simple cognito callbacks into the LoggedIn listener.
  * @param {simpleResetCallback} method to call from the LoggedIn when it acquires a new user password and wants to finish the login
  * @param {onlogins} callbacks to update when the logins completes, fails, or needs a password reset.
  */
  constructor(private startResetPassword, private finishPasswordReset:(code:string, password:string) =>void, private onlogins:LoggedIn[]){}

  cognitoCallback(message:string, result:any) {
    // error... of some sort
    if (message != null) {
      if(message == "Password reset required for the user"){
        alert(message);
        // start the user forgot password flow
        this.startResetPassword();
        // for each of the "logins" attempt trigger the reset password flow
        for(let login of this.onlogins) {
          let attributes = {}
          login.resetPasswordRequired(attributes, ["verificationCode"], function(password:string):void {
              this.finishPasswordReset(attributes["verificationCode"], password);
          });
        }
      } else {
        // some other error we don't know how to handle!
        for(let login of this.onlogins){
          login.loginFailed(message);
        }
      }
    } 
    // success
    else { 
      for(let login of this.onlogins){
          login.loggedIn();
        }
    }
  }

  resetPassword(attributesToUpdate, requiredAttributes, callback:(password:string) => any):void{
    for(let login of this.onlogins){
      login.resetPasswordRequired(attributesToUpdate, requiredAttributes, callback);
    }
  }


  handleMFA(codeDeliveryDetails, callbackWithCode:(mfa:string) => any):void{
    // noop - we don't support MFA right now because we don't have a secondary input mechanism for users
    // when they use their username/password on a third party tool (e.g. BI tool)
  }

}