import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';

import { Confirm } from './confirm.component';
import { ConfirmEmpty } from './confirm.empty.component';
import { NextSteps } from './next-steps/next.steps.component';
import { routing } from './confirm.routing';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgaModule,
    routing
  ],
  declarations: [
    ConfirmEmpty,
    NextSteps,
    Confirm
  ]
})
export default class ConfirmModule {}
