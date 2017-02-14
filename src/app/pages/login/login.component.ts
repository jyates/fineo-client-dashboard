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

  @ViewChild('resetModal') passwordModal: ModalDirective;
  @ViewChild('forgotModal') forgotPasswordModal: ModalDirective;
  @ViewChild('failedReset') failedResetModal: ModalDirective;

  public passwordAdditionalAttributes:Object;
  public passwordAttributes:Object;
  public newPassword:string = null;
  private passwordCallback;
  private passwordResetReason:string ="";

  public doForgotPassword = false;
  public forgotPasswordMessage:string = "";
  public forgotPasswordReplacement:string = "";
  public forgotVerificationCode:string = "";
  public forgotPasswordCallback:Function;

  constructor(private fb:FormBuilder,
              private router: Router,
              private users: UserService) {
    this.form = fb.group({
      'email': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(8)])]
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
    if(message.includes("PostConfirmation")){
      console.log("Reset didn't fail, cognito just sends a confirm signup on password reset.")
      console.log("Error message:", message);
      return;
    }
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
    // reset the verification
    this.doForgotPassword  = true;
    this.forgotVerificationCode = "";
    this.forgotPasswordReplacement = "";

    let self = this;
    this.users.resetPassword(this.email.value, {
      verificationCodeSent: function (location, confirm:ConfirmPasswordCallback){
        console.log("Verification code sent to: ", JSON.stringify(location));

        self.forgotPasswordMessage =  "Verification code sent to: "+location.CodeDeliveryDetails.Destination;

        self.forgotPasswordCallback = function(){
          confirm.confirm(self.forgotVerificationCode, self.forgotPasswordReplacement).then((result) =>{
            alert("Successfully reset password! Please try logging in again");
          }).catch(err =>{
            self.cancelForgotPassword();
            let message = JSON.stringify(err)
            if(message.includes("PostConfirmation")){
              console.log("Reset didn't fail, cognito just sends a confirm signup on password reset.")
              console.log("Error message:", message);
              return;
            }
            console.log("Failed to reset password! \n", message);
            alert("Failed to reset password! \nReason: "+message+"\n\nPlease try again.");
          });
        }
        self.forgotPasswordModal.show();
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

  cancelForgotPassword(){
    this.forgotPasswordModal.hide();
  }
}
