import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AlertModule, ModalModule, PaginationModule, DropdownModule, DatepickerModule, TimepickerModule } from 'ng2-bootstrap';
import { Ng2TableModule } from 'ng2-table/ng2-table';

import { NgaModule } from '../../theme/nga.module';

import { Errors } from './errors.component';
import { routing } from './errors.routing';
import { ErrorDataService } from './error.data.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgaModule,
    ModalModule.forRoot(),
    AlertModule.forRoot(),
    DropdownModule.forRoot(),
    PaginationModule.forRoot(),
    DatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    Ng2TableModule,
    routing
  ],
  declarations: [
    Errors
  ],
  providers: [
    ErrorDataService
  ]
})
export class ErrorsModule {
}

