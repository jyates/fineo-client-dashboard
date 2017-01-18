import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ModalModule } from 'ng2-bootstrap/ng2-bootstrap';
import { ThreeBounceComponent } from 'ng2-spin-kit'

import { NgaModule } from '../../theme/nga.module';

import { Login }          from './login.component';
import { SplitCamelCase } from './split.camelcase.pipe';
import { routing }       from './login.routing';

@NgModule({
  imports: [
  // angular
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  // other libs
    ModalModule,
    ThreeBounceComponent,
  // internal libs
    NgaModule,
  // this module
    routing
  ],
  declarations: [
    Login,
    SplitCamelCase
  ]
})
export default class LoginModule {}
