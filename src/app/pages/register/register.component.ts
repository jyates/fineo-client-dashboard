import {Component} from '@angular/core';
import {FormGroup, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import {EmailValidator, PasswordValidator} from '../../theme/validators';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { UserSignupService } from '../../services/user.signup.service';

import 'style-loader!./register.scss';

@Component({
  selector: 'register',
  templateUrl: './register.html',
})
export class Register {

  public form:FormGroup;
  public name:AbstractControl;
  public email:AbstractControl;
  public password:AbstractControl;
  public repeatPassword:AbstractControl;
  public passwords:FormGroup;

  public submitted:boolean = false;

  constructor(fb:FormBuilder,
              private router: Router,
              private signup: UserSignupService) {

    this.form = fb.group({
      'name': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      'email': ['', Validators.compose([Validators.required, EmailValidator.validate])],
      'passwords': PasswordValidator.getPasswordGroup(fb)
    });

    this.name = this.form.controls['name'];
    if(this.signup.name){
      this.name.setValue(this.signup.name);
    }

    this.email = this.form.controls['email'];
    if(this.signup.email){
      this.email.setValue(this.signup.email);
    }
    this.passwords = <FormGroup> this.form.controls['passwords'];
    this.password = this.passwords.controls['password'];
    this.repeatPassword = this.passwords.controls['repeatPassword'];
    if(this.signup.password){
      let p = this.signup.password;
      this.password.setValue(p);
      this.repeatPassword.setValue(p);
    }
  }

  

  public onSubmit(values:Object):void {
    this.submitted = true;
    if (!this.form.valid) {
      console.log("Somehow submitted, but the form was invalid!");
      return;
    }
    this.signup.startSignUp(this.name.value, this.email.value, this.password.value);

    var target = '/select-package'
    console.log("redirecting to: "+target);
    this.router.navigate([target]);
  }

  public passwordMessage():string{
    let message = "Passwords must contain numbers, letters, special characters and be at least 8 characters";
    if(!this.passwordError() || (this.password.value == "" && this.repeatPassword.value == "")){
      return message;
    }
    console.log("getting error!");
    let top = this.passwords.errors
    if(top != undefined && top["passwordsEqual"]){
      return "Passwords don't match!"
    }

    // they match, so the error must be in the original password
    return message;
  }

  public passwordError():boolean{
    return !this.passwords.valid && (this.repeatPassword.touched && this.password.touched)
  }
}
