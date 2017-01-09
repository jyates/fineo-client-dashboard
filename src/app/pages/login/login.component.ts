import {Component, ViewEncapsulation} from '@angular/core';
import {FormGroup, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { Router } from '@angular/router';
// import {AWS} from './aws.loader.ts';
import {
  CognitoCallback,
  UserLoginService,
  LoggedInCallback
} from '../../services/cognito.service';

import {
  FineoApi
} from '../../services/fineo.service';

// declare var apigClientFactory:any;

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
              private users: UserLoginService,
              private fineo: FineoApi) {
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
      if(message == "Password reset required for the user"){
        // show the reset password information
      }
    } else { //success
      this.isLoggedIn(message, true);
    }
  }

  isLoggedIn(message:string, isLoggedIn:boolean) {
    if (isLoggedIn){
      // Fineo wrapping access
        // this.fineo.schema.getMetrics()
        //   .then(result => window.confirm("Got schemas:"+JSON.stringify(result)))
        //   .catch(err => window.confirm("Error getting schemas: "+JSON.stringify(err)));

        // Direct AWS generated API Gateway access
       // this.users.withCredentials({
       //   with:function(access, secret, session){
       //     var apigClient = apigClientFactory.newClient({
       //        accessKey: access,
       //        secretKey: secret,
       //        sessionToken: session,
       //        apiKey: 'yLi6cd4Gpi2RsX8R1tvay6JPLFTXuyTaEFRp4A1d',
       //        region: 'us-east-1' // OPTIONAL: The region where the API is deployed, by default this parameter is set to us-east-1
       //    });
       //     // window.confirm("User loggedd in with credentials\naccess: "+access+"\nsecret:"+secret+"\nsession:"+session);
       //    apigClient.schemaGet().then(function(successResult){
       //      window.confirm("Got schema info: "+JSON.stringify(successResult));
       //    }).catch(function(err){
       //      window.confirm("Failed get: "+JSON.stringify(err));
       //    });
       //   }
       // })
      this.router.navigate(['/pages/dashboard']);
    }
      
  }

  resetPassword(attributes, requiredAttributes, callback):void{
    console.error("---- login#resetPassword needs to be implemented! ---");
    attributes["name"] = "demo"
    callback("1Qasdfghjkl;'", attributes)
  }

  handleMFA(codeOptions, callback):void{
    console.log("Getting MFA info from user");
    callback("1234");
  }
}
