import {Injectable, Inject} from "@angular/core";
import {environment} from '../environment';

declare var AWSCognito:any;
declare var AWS:any;

export class RegistrationUser {
    name:string;
    email:string;
    password:string;
    stripeToken:string;
    plan:string;
}

export interface Callback {
    callback():void;
    callbackWithParam(result:any):void;
    sessionExpired():void;
}

export interface CognitoCallback {
    cognitoCallback(message:string, result:any):void;

    resetPassword(attributesToUpdate, requiredAttributes, callback:(password:string) => any):void;

    handleMFA(codeDeliveryDetails, callback:(mfaCode:string)=>any): void;
}

export interface LoggedInCallback {
    isLoggedIn(message:string, loggedIn:boolean):void;
}

@Injectable()
export class CognitoUtil {
  
    public static _POOL_DATA = {
        UserPoolId: environment.userPoolId,
        ClientId: environment.clientId
    };
  
    public static getAwsCognito():any {
        return AWSCognito
    }

    private pool:any;
    constructor() {
        this.pool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(CognitoUtil._POOL_DATA);
        AWS.config.region = 'us-east-1'
    }

    getUserPool() {
        return this.pool;
    }

    getCurrentUser() {
        return this.getUserPool().getCurrentUser();
    }


    getCognitoIdentity():string {
        return AWS.config.credentials.identityId;
    }

    getAccessToken(callback:Callback):void {
        if (callback == null) {
            throw("CognitoUtil: callback in getAccessToken is null...returning");
        }
        if (this.getCurrentUser() != null)
            this.getCurrentUser().getSession(function (err, session) {
                if (err) {
                    console.log("CognitoUtil: Can't set the credentials:" + err);
                    callback.callbackWithParam(null);
                }

                else {
                    if (session.isValid()) {
                        callback.callbackWithParam(session.getAccessToken().getJwtToken());
                    }
                }
            });
        else
            callback.callbackWithParam(null);
    }

    getIdToken(callback:Callback):void {
        if (callback == null) {
            throw("CognitoUtil: callback in getIdToken is null...returning");
        }
        if (this.getCurrentUser() != null){
            this.getCurrentUser().getSession(function (err, session) {
                if (err) {
                    console.log("CognitoUtil: Can't set the credentials:" + err);
                    callback.callbackWithParam(null);
                }
                else {
                    if (session.isValid()) {
                        callback.callbackWithParam(session.getIdToken().getJwtToken());
                    } else {
                        console.log("CognitoUtil: Got the id token, but the session isn't valid");
                        callback.sessionExpired();
                    }
                }
            });
        }
        else {
            callback.callbackWithParam(null);
        }
    }

    getRefreshToken(callback:Callback):void {
        if (callback == null) {
            throw("CognitoUtil: callback in getRefreshToken is null...returning");
        }
        if (this.getCurrentUser() != null)
            this.getCurrentUser().getSession(function (err, session) {
                if (err) {
                    console.log("CognitoUtil: Can't set the credentials:" + err);
                    callback.callbackWithParam(null);
                }

                else {
                    if (session.isValid()) {
                        callback.callbackWithParam(session.getRefreshToken());
                    }
                }
            });
        else
            callback.callbackWithParam(null);
    }

    refresh():void {
        this.getCurrentUser().getSession(function (err, session) {
            if (err) {
                console.log("CognitoUtil: Can't set the credentials:" + err);
            }

            else {
                if (session.isValid()) {
                    console.log("CognitoUtil: refresshed successfully");
                } else {
                    console.log("CognitoUtil: refresshed but session is still not valid");
                }
            }
        });
    }
}

@Injectable()
export class UserRegistrationService {

    constructor(@Inject(CognitoUtil) public cognitoUtil:CognitoUtil) {

    }

    register(user:RegistrationUser, callback:CognitoCallback):void {
        console.log("UserRegistrationService: user is " + JSON.stringify(user));

        let attributes = [];
        this.addAttrib(attributes, {
            Name: 'email',
            Value: user.email
        });
       this.addAttrib(attributes, {
            Name: 'name',
            Value: user.name
        });
       this.addAttrib(attributes, {
            Name: 'custom:stripeToken',
            Value: user.stripeToken
        });
        this.addAttrib(attributes, {
            Name: 'custom:plan',
            Value: user.plan
        });

        this.cognitoUtil.getUserPool().signUp(user.email, user.password, attributes, null, function (err, result) {
            if (err) {
                callback.cognitoCallback(err.message, null);
            } else {
                console.log("UserRegistrationService: registered user is " + JSON.stringify(result));
                callback.cognitoCallback(null, result);
            }
        });
    }

    private addAttrib(attributes:any[], attribute:any){
        attributes.push(new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(attribute));
    }

    confirmRegistration(username:string, confirmationCode:string, callback:CognitoCallback):void {

        let userData = {
            Username: username,
            Pool: this.cognitoUtil.getUserPool()
        };

        let cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

        cognitoUser.confirmRegistration(confirmationCode, true, function (err, result) {
            if (err) {
                callback.cognitoCallback(err.message, null);
            } else {
                callback.cognitoCallback(null, result);
            }
        });
    }

    resendCode(username:string, callback:CognitoCallback):void {
        let userData = {
            Username: username,
            Pool: this.cognitoUtil.getUserPool()
        };

        let cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

        cognitoUser.resendConfirmationCode(function (err, result) {
            if (err) {
                callback.cognitoCallback(err.message, null);
            } else {
                callback.cognitoCallback(null, result);
            }
        });
    }

}

@Injectable()
export class UserLoginService {

    constructor(public cognitoUtil:CognitoUtil) {
    }

    authenticate(username:string, password:string, callback:CognitoCallback) {
        console.log("UserLoginService: starting the authentication")
        // Need to provide placeholder keys unless unauthorised user access is enabled for user pool
        AWSCognito.config.update({accessKeyId: 'anything', secretAccessKey: 'anything'})

        let authenticationData = {
            Username: username,
            Password: password,
        };
        let authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);

        let userData = {
            Username: username,
            Pool: this.cognitoUtil.getUserPool()
        };

        let cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
        let handler = {
            // result is a simple object with two fields: idToken and accessToken (both jwt tokens)
            onSuccess: function (result) {
                console.log("successful auth of user: ", username);
                
                var logins = {}
                logins['cognito-idp.us-east-1.amazonaws.com/' + environment.userPoolId] = result.getIdToken().getJwtToken();

                // Add the User's Id Token to the Cognito credentials login map.
                let credentialParams = {
                    IdentityPoolId: environment.identityPoolId,
                    Logins: logins
                };
                // https://github.com/aws/aws-sdk-js/issues/609
                var credentials = new AWS.CognitoIdentityCredentials(credentialParams);
                credentials.clearCachedId();
                credentials = new AWS.CognitoIdentityCredentials(credentialParams);
                AWS.config.credentials = credentials;

                console.log("Added logins for user: ",username);
                callback.cognitoCallback(null, result);
            },
            onFailure: function (err) {
                callback.cognitoCallback(err.message, null);
            },

            // MFA is required to complete user authentication.
            // Get the code from user and call
            mfaRequired: function(codeDeliveryDetails) {
                callback.handleMFA(codeDeliveryDetails, function(code){
                    cognitoUser.sendMFACode(code, handler);
                })
            },

            // User was signed up by an admin and must provide new 
            // password and required attributes, if any, to complete 
            // authentication.
            newPasswordRequired: function(attributes, requiredAttributes){
                 console.log("User requires a new password to be entered.")
                // the api doesn't accept this field back
                delete attributes.email_verified;

                // Get these details
                callback.resetPassword(attributes, requiredAttributes, function(password:string){
                     // and call back
                    cognitoUser.completeNewPasswordChallenge(password, attributes, handler);  
                });
            }
        };
        cognitoUser.authenticateUser(authenticationDetails, handler);
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

    withCredentials(func:WithCredentials){
        if (AWS.config.credentials == null) {
            func.noCredentials();
            return;
        }
        AWS.config.credentials.get(function(err) {
            if (err){
              console.log(err);
              func.noCredentials();
            }
            else {
                func.with(AWS.config.credentials.accessKeyId, AWS.config.credentials.secretAccessKey,AWS.config.credentials.sessionToken);
            }
        });
    }

    forgotPassword(username:string, callback:CognitoCallback) {
        let userData = {
            Username: username,
            Pool: this.cognitoUtil.getUserPool()
        };

        let cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

        cognitoUser.forgotPassword({
            onSuccess: function (result) {

            },
            onFailure: function (err) {
                callback.cognitoCallback(err.message, null);
            },
            inputVerificationCode: function(data) {
                callback.cognitoCallback(data, false);
            }
        });
    }

    confirmNewPassword(email:string, verificationCode:string, password:string, callback:CognitoCallback) {
        let userData = {
            Username: email,
            Pool: this.cognitoUtil.getUserPool()
        };

        let cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

        cognitoUser.confirmPassword(verificationCode, password, {
            onSuccess: function (result) {
                callback.cognitoCallback(null, result);
            },
            onFailure: function (err) {
                callback.cognitoCallback(err.message, null);
            }
        });
    }

    logout() {
        console.log("UserLoginService: Logging out");
        this.cognitoUtil.getCurrentUser().signOut();
        // reset any other parameters that got set
        AWSCognito.config.update({accessKeyId: 'anything', secretAccessKey: 'anything'});
        AWS.config.credentials = null;
    }

    isAuthenticated(callback:LoggedInCallback) {
        if (callback == null)
            throw("UserLoginService: Callback in isAuthenticated() cannot be null");

        let cognitoUser = this.cognitoUtil.getCurrentUser();

        if (cognitoUser != null) {
            cognitoUser.getSession(function (err, session) {
                if (err) {
                    console.log("UserLoginService: Couldn't get the session: " + err, err.stack);
                    callback.isLoggedIn(err, false);
                }
                else {
                    console.log("UserLoginService: Session is " + session.isValid());
                    callback.isLoggedIn(err, session.isValid());
                }
            });
        } else {
            console.log("UserLoginService: can't retrieve the current user");
            callback.isLoggedIn("Can't retrieve the CurrentUser", false);
        }
    }

}

export interface WithCredentials{
    with(access:string, secret:string, session:string);

    noCredentials();
}

@Injectable()
export class UserParametersService {

    constructor(public cognitoUtil:CognitoUtil) {
    }

    getParameters(callback:Callback) {
        let cognitoUser = this.cognitoUtil.getCurrentUser();

        if (cognitoUser != null) {
            cognitoUser.getSession(function (err, session) {
                if (err)
                    console.log("UserParametersService: Couldn't retrieve the user");
                else {
                    cognitoUser.getUserAttributes(function (err, result) {
                        if (err) {
                            console.log("UserParametersService: in getParameters: " + err);
                        } else {
                            callback.callbackWithParam(result);
                        }
                    });
                }

            });
        } else {
            callback.callbackWithParam(null);
        }
    }
}