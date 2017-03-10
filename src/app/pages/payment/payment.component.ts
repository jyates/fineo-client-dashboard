import {Component} from '@angular/core';
import {FormGroup, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { Router, NavigationExtras } from '@angular/router';

import {
  UserSignupService,
  CCInfo,
  FullStripeResponse
} from '../../services/user.signup.service';

@Component({
  selector: 'payment',
  styleUrls: ['./payment.scss'],
  templateUrl: './payment.html',
})
export class Payment {

  public form:FormGroup;
  public number:AbstractControl;
  public month_year:AbstractControl;
  public cvc:AbstractControl;
  public zipcode:AbstractControl;

  public submitted:boolean = false;

  constructor(fb:FormBuilder,
              private router: Router,
              private signup: UserSignupService) {
    let self = this;
    this.form = fb.group({
      'number': ['', Validators.compose([Validators.required, Validators.minLength(16), function(control:AbstractControl){
        if(!Stripe.card.validateCardNumber(control.value)){
          return {"invalidCardNumber": "Invalid card number!"};
        }
        else if(!Stripe.card.cardType(control.value)){
          return {"invalidCardNumber": "Not a valid card type!"};
        }
        return null;
      }
      ])],
      'month_year': ['', Validators.compose([Validators.required, Validators.minLength(2), function(control:AbstractControl){
        let parts = control.value.split("/")
        // no value yet
        if(parts === undefined){
          return {"invalidCardDate": "Not a proper format"}
        }
        let year_month = parts.reverse().join("-");
        if(!Stripe.card.validateExpiry(year_month)){
          return {"invalidCardDate": "Card expiry is not valid or not in the future!"};
        }
        return null;
      }])],
      'cvc': ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(3)])],
      'zipcode': ['', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(5)])]
    });

    this.number = this.form.controls['number'];
    this.month_year = this.form.controls['month_year'];
    this.cvc = this.form.controls['cvc'];
    this.zipcode = this.form.controls['zipcode'];
  }

  public hasError(control:AbstractControl):boolean {
    return !control.valid && control.touched;
  }

  public hasSuccess(control:AbstractControl):boolean{ 
    return control.valid && control.touched;
  }

  public onSubmit(values:FormGroup):void {
    this.submitted = true;
    if (!this.form.valid) {
      return;
    }

    // submit the payment information to Stripe to get a token
    let self = this;
    this.get_token().then(result =>{
      console.log("successfully got stripe token: ", JSON.stringify(result));
      // and create a user with that token information
      return this.create_user(result);
    }).then(created =>{
      this.submitted = false;
      let url = "/confirm"
      let extras: NavigationExtras = {
         queryParams: {"user" : self.signup.email}
       }
      console.log("Done creating user! Need to confirm the user: ", url);
      this.router.navigate([url], extras);
    })
    .catch(response =>{
      console.log("Credit card information was invalid", JSON.stringify(response));
      if((response.error != undefined) && (response.error.message != undefined)){
        response = response.error.message;
      }
      alert("Credit card information was invalid: "+ response);
      // alert(response.error.message);
      this.submitted = false;
    })
  }

  private get_token():Promise<any>{
    // translate the a CCInfo
    let cc = new CCInfo();
    cc.number = this.number.value;
    let split = this.month_year.value.split("/");
    cc.exp_month = split[0];
    cc.exp_year = split[1];
    cc.zipcode = this.zipcode.value;
    cc.cvc = this.cvc.value;

    // make the request
    return this.signup.submitCreditCardInfo(cc);
  }

  private create_user(result:any):Promise<any>{
    return this.signup.createUser(result.response.id);
  }
}
