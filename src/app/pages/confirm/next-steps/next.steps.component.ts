import {Component, OnInit} from '@angular/core';
import {FormGroup, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Observable }  from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Component({
  selector: 'next_steps',
  templateUrl: './next.steps.html',
  styleUrls: ['./next.steps.scss']
})
export class NextSteps{
  constructor(private route: ActivatedRoute,
              private router: Router) {
  }

  public onSubmit():void {
    this.router.navigate(["/login"]);
 }
}
