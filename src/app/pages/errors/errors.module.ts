import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AlertModule, ModalModule, PaginationModule, DropdownModule, DatepickerModule, TimepickerModule} from 'ng2-bootstrap';
import { Ng2TableModule } from 'ng2-table/ng2-table';

import { NgaModule } from '../../theme/nga.module';

import { Errors }              from './errors.component';
import { routing }             from './errors.routing';

// temporary data service - should be replaced with the actual source data service
import { DataService } from './error.data.service';

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
  // jesse - temporary - should be removed
  providers:[
    DataService
  ]
})
export class ErrorsModule {
}

