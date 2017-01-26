import {Injectable, Inject} from "@angular/core";

import {GlobalState} from '../global.state'
import {environment} from '../environment'

import {
  CognitoCallback,
  RegistrationUser,
  UserRegistrationService,
} from './cognito.service'

import {
  FineoApi
} from './fineo.service'

/**
* A central place to manage user state. Encapsulates logging a user in/out, as well as metadata information about the user, like what their API Key is.
*/
@Injectable()
export class UserSignupService {

  private name:string;
  public email:string;
  private password:string;

  constructor(@Inject(UserRegistrationService) public registration: UserRegistrationService,
              @Inject(FineoApi) private fineo:FineoApi,
              @Inject(GlobalState) private state:GlobalState){
    Stripe.setPublishableKey(environment.stripeToken);
  }

  public startSignUp(name:string, email:string, password:string):void{
    this.name = name;
    this.email = email;
    this.password = password;
  }

  public submitCreditCardInfo(card:CCInfo):Promise<any>{
    if(this.name == null || this.email == null || this.password == null){
      return Promise.reject({error:{message: "You must complete the registration form before submitting a credit card!"}});
    }

    return new Promise((resolve, reject) =>{
      (<any>window).Stripe.card.createToken(card, (status: number, response: any) => {
        if(response.error){
          reject(response);
        }else{
          resolve(new FullStripeResponse(status, response));
        }
      });
    });
  }

  public createUser(stripeToken:string):Promise<any>{
    let user = new RegistrationUser();
    user.name = this.name;
    user.email = this.email;
    user.password = this.password;
    user.stripeToken = stripeToken;

    let self = this;
    // create the user in cognito
    return new Promise((resolve, reject) =>{
      this.registration.register(user, new SimpleSuccessFailureCallback(resolve, reject, "Successfully signed up user"));  
    });
  }

  /**
   * New users must be confirmed via a codde in their email.
   */ 
  public confirmUser(username:string, code:string):Promise<any>{
    let self = this;
    return new Promise((resolve, reject) =>{
      this.registration.confirmRegistration(username, code, new SimpleSuccessFailureCallback(resolve, reject, "Successfully confirmed user"));
    });
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

export class FullStripeResponse{
 constructor(public status:Object, public response:StripeResponse){}
}

export class StripeResponse{
  public id:string
}

export class CCInfo{
  public number:string;
  public exp_month:number;
  public exp_year:number;
  public cvc:number;
  public zipcode:number;
}

/**
* Simple CognitoCallback that just handles success/failure on called to #cognitoCallback()
*/
class SimpleSuccessFailureCallback implements CognitoCallback {
  constructor(private resolve, private reject, private message){
    console.log("Creating callback with message: ", message);
  }
  
  cognitoCallback(errMessage, result){
    if(errMessage != null){
      this.reject(errMessage);
    } else {
      console.log(this.message,": ", UserSignupService.transform(result));
      this.resolve(result);
    }
  }
  // don't do these!
  resetPassword: null
  handleMFA: null
}