import {Component, ViewEncapsulation} from '@angular/core';
import {FormGroup, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import {EmailValidator, EqualPasswordsValidator} from '../../theme/validators';
import { Router, NavigationExtras } from '@angular/router';

import { UserSignupService } from '../../services/user.signup.service';

@Component({
  selector: 'select-package',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./select-package.scss')],
  template: require('./select-package.html'),
})
export class SelectPackage {

  private submitted:boolean = false;
  constructor(private router: Router,
              private signup: UserSignupService) {
  }

  public handleSelect(title:string):void{
    this.signup.package = title;
  }

  public isSelected():any{
    let self = this;
    return (title:string) =>{
      return title === self.signup.package;
    }
  }

  public submit():void {
    if(this.signup.package == "Free"){
      let self = this;
      this.submitted = true;
      this.signup.createUser(null).then(result =>{
        this.submitted = false;
        let url = "/confirm"
        let extras: NavigationExtras = {
          queryParams: {"user" : self.signup.email}
        }
        console.log("Done creating user! Need to confirm the user: ", url);
        this.router.navigate([url], extras);
       }).catch(err =>{
         this.submitted = false;
         console.log("Failed to create user! Reason: ", JSON.stringify(err));
         if(err == "User already exists"){
           alert("User already exists! Did you mean to log in?")
           return;
         }
         
         alert("Sign up failed. Please send console output to help@fineo.io. \nReason:"+JSON.stringify(err));
       })
    } else{
      var target = '/payment'
      console.log("redirecting to: "+target);
      this.router.navigate([target]);
    }
    
  }
}
