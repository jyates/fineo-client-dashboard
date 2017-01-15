// angular
// import { Component, ViewChild, ViewEncapsulation, ElementRef, Renderer } from '@angular/core';
// import {FormGroup, AbstractControl, FormBuilder, Validators} from '@angular/forms';
// import {Router} from '@angular/router';

import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { Router} from '@angular/router';

import { ModalDirective } from 'ng2-bootstrap';

// internal libs
import {
  UserService,
  LoggedIn
} from '../../services/user.service';

import { SplitCamelCase } from './split.camelcase.pipe'

@Component({
  selector: 'login',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./login.scss')],
  template: require('./login.html'),
})
export class Login implements LoggedIn {

  public form:FormGroup;
  public email:AbstractControl;
  public password:AbstractControl;
  public errorMessage:string = null;
  public submitted:boolean = false;

  @ViewChild('childModal') passwordModal: ModalDirective;
  @ViewChild('failedReset') failedResetModal: ModalDirective;
  public passwordAdditionalAttributes:Object;
  public passwordAttributes:Object;
  public newPassword:string = null;
  private passwordCallback;
  private passwordResetReason:string ="";

  constructor(private fb:FormBuilder,
              private router: Router,
              private users: UserService) {
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
      this.users.login(this.email.value, this.password.value, this);
    }
  }

  // successful login, we are done!
  loggedIn():void {
    this.router.navigate(['/pages/dashboard']);
  }

  loginFailed(reason:string):void {
    this.submitted = false;
    this.errorMessage = reason;
  }

  resetPasswordRequired(attributesToUpdate:Object, requiredAttributes, callback:(password:string) => void){
    // show the reset password modal, but with the necessary reset information
    this.passwordCallback = callback;
    this.passwordAttributes = attributesToUpdate;
    this.passwordAdditionalAttributes = requiredAttributes;
    this.passwordModal.show();
  }

  cancelUpdatePassword():void{
    this.passwordCallback = null;
    this.passwordAttributes = null;
    this.passwordAdditionalAttributes = null;
    this.passwordModal.hide();
  }

  updatePasswordFromModal():void{
    console.log("Updating password----")
    this.passwordCallback(this.newPassword);
    this.passwordModal.hide();
  }

  resetPasswordFailed(message:string):void {
    console.log("Failed to reset password - "+message);
    this.submitted = false;
    this.passwordResetReason = message;
    this.failedResetModal.show();
  }

  hideFailedResetModal():void{
    this.failedResetModal.hide();
  }
}
