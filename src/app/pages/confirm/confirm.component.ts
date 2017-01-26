import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {FormGroup, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Observable }  from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import {
  UserSignupService,
  CCInfo,
  FullStripeResponse,
  StripeResponse
} from '../../services/user.signup.service';

@Component({
  selector: 'confirm',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./confirm.scss')],
  template: require('./confirm.html'),
})
export class Confirm implements OnInit {

  public form:FormGroup;
  public code:AbstractControl;
  public username:string = null;

  public submitted:boolean = false;

  constructor(fb:FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private signup: UserSignupService) {
    let self = this;
    this.form = fb.group({
      'code': ['', Validators.compose([Validators.required, Validators.minLength(4)])]
    });

    this.code = this.form.controls['code'];
  }

  public ngOnInit() {
    this.route
      .queryParams
      .map(params => params['user']).subscribe(user => this.username = user);
  }

  public onSubmit(values:FormGroup):void {
    this.submitted = true;
    if (!this.form.valid) {
      return;
    }

    if(this.username == null){
      alert("No user email provided! Add ?user=<email> to URL and try again");
      return;
    }

    this.signup.confirmUser(this.username, this.code.value)
      .then(result =>{
        this.router.navigate(["/login"]);
        this.submitted = false;
      }).catch(err =>{
        console.log("Failed to confirm user: ", err);
        this.submitted = false;
        alert(err);
      });
  }
}