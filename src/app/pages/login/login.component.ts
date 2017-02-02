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
  LoggedIn,
  PasswordResetCallback,
  ConfirmPasswordCallback
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
    if(this.submitted){
      console.log("Already submitted... going to wait instead.")
      return;
    }
    console.log("Submitted: "+JSON.stringify(values))

    if (this.form.valid) {
      this.submitted = true;
      this.users.login(this.email.value, this.password.value, this);
    }
  }

  // successful login, we are done!
  loggedIn():void {
    this.router.navigate(['/pages/dashboard']);
    this.submitted = false;
  }

  loginFailed(reason:string):void {
    this.errorMessage = reason;
    this.submitted = false;
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
    this.submitted = false;
    this.passwordModal.hide();
  }

  updatePasswordFromModal():void{
    console.log("Updating password----")
    this.passwordCallback(this.newPassword);
    this.submitted = false;
    this.passwordModal.hide();
  }

  resetPasswordFailed(message:string):void {
    console.log("Failed to reset password - "+message);
    this.passwordResetReason = message;
    this.failedResetModal.show();
    this.submitted = false;
  }

  hideFailedResetModal():void{
    this.submitted = false;
    this.failedResetModal.hide();
  }

  forgotPassword():void{
    console.log("starting forgot password")
    let self = this;
    this.users.resetPassword(this.email.value, {
      verificationCodeSent: function (location, confirm:ConfirmPasswordCallback){
        console.log("Verification code sent to: ", JSON.stringify(location));

        let msg = "Verification code sent to: "+location.CodeDeliveryDetails.Destination + "\nPlease enter code:";

        var code = self.doPrompt(msg);
        if(code == null){
          return;
        }

        var newPassword = self.doPrompt('Enter new password');
        if(newPassword == null){
          return;
        }
        confirm.confirm(code, newPassword).then((result) =>{
          alert("Successfully reset password! Please try logging in again");
        }).catch(err =>{
          console.log("Failed to reset password! \n", JSON.stringify(err));
          alert("Failed to reset password! \nReason: "+err+"\n\nPlease try again.");
        });
      },

      resetFailed: function(reason:string){
        console.log("Failed to reset password: ", JSON.stringify(reason));
        if(reason.includes("Member must have length greater than or equal to 1")){
          alert("Please enter an email address for which to reset the password.");
        } else {
          alert("Failed to reset password! "+reason);
        }
      }
    });
  }

  private doPrompt(msg):any{
    var result = "";
    while(result == ""){
      result = prompt(msg,'');
      if (result == null){
        return null;
      }
    }
    return result;
  }
}
