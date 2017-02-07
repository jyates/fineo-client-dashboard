import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';

import { SelectPackage } from './select-package.component';
import { routing }       from './select-package.routing';
import { Package } from './components/package.component'


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgaModule,
    routing
  ],
  declarations: [
    SelectPackage,
    Package
  ]
})
export default class SelectPackageModule {}
