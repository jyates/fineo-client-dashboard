import {Component, ViewEncapsulation} from '@angular/core';
import {FormGroup, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'payment',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./payment.scss')],
  template: require('./payment.html'),
})
export class Payment {

  public form:FormGroup;
  public number:AbstractControl;
  public year:AbstractControl;
  public month:AbstractControl;
  public cvc:AbstractControl;
  public zipcode:AbstractControl;

  public submitted:boolean = false;

  constructor(fb:FormBuilder, private router: Router) {

    this.form = fb.group({
      'number': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      'month': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
      'year': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
      'cvc': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      'zipcode': ['', Validators.compose([Validators.required, Validators.minLength(4)])]
    });

    this.number = this.form.controls['number'];
    this.year = this.form.controls['year'];
    this.month = this.form.controls['month'];
    this.cvc = this.form.controls['cvc'];
    this.zipcode = this.form.controls['zipcode'];
  }

  public onSubmit(values:Object):void {
    this.submitted = true;
    console.log(values);
    if (!this.form.valid) {
      return;
    }

    // submit the payment information to Stripe to get a token
    var payment_token = this.get_token(values);

    // create the user in the database
    this.create_user(payment_token);

    // go to the user's dashboard
    console.log("going back to dashboard");
    this.router.navigate(['/pages/dashboard']);
  }

  private get_token(form:Object){
     return null;
  }

  private create_user(token:string):void{
  }
}
