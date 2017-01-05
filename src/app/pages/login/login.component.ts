import {Component, ViewEncapsulation} from '@angular/core';
import {FormGroup, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { Router } from '@angular/router';
// import {AWS} from './aws.loader.ts';
import {
  CognitoCallback,
  UserLoginService,
  LoggedInCallback
} from '../../services/cognito.service'

@Component({
  selector: 'login',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./login.scss')],
  template: require('./login.html'),
})
export class Login implements CognitoCallback, LoggedInCallback{

  public form:FormGroup;
  public email:AbstractControl;
  public password:AbstractControl;
  public errorMessage:string = null;
  public submitted:boolean = false;

  constructor(private fb:FormBuilder,
              private router: Router,
              private users: UserLoginService) {
    // console.log(AWS)
    this.form = fb.group({
      'email': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(4)])]
    });

    this.email = this.form.controls['email'];
    this.password = this.form.controls['password'];
  }

  public onSubmit(values:Object):void {
    console.log("Submitted: "+JSON.stringify(values))
    this.submitted = true;
    if (this.form.valid) {
      this.users.authenticate(this.email.value, this.password.value, this);
    }
  }

  cognitoCallback(message:string, result:any) {
    this.submitted = false;
    if (message != null) { //error
      this.errorMessage = message;
      console.log("result: " + this.errorMessage);
    } else { //success
      this.isLoggedIn(message, true);
    }
  }

  isLoggedIn(message:string, isLoggedIn:boolean) {
    if (isLoggedIn)
      this.router.navigate(['/pages/dashboard']);
  }
}
