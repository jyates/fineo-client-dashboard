import {Injectable, Inject} from "@angular/core";

import {GlobalState} from '../global.state'

import {
  CognitoCallback,
  LoggedInCallback,
  UserLoginService
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
  private email:string;
  private password:string;

  constructor(@Inject(UserLoginService) public loginService:UserLoginService,
              @Inject(FineoApi) private fineo:FineoApi,
              @Inject(GlobalState) private state:GlobalState){
  }

  public startSignUp(name:string, email:string, password:string):void{
    this.name = name;
    this.email = email;
    this.password = password;
  }

  public submitCreditCardInfo(card:CCInfo):Promise<any>{
    return null;
  }
}

export class CCInfo{
  public name:string;
  public number:string;
  public exp_month:number;
  public exp_year:number;
  public cvc:number;
  public zipcode:number;
}