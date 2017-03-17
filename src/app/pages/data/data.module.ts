import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ModalModule, TooltipModule } from 'ng2-bootstrap';

import { NgaModule } from '../../theme/nga.module';

import { StreamComponent }   from './components/stream/stream.component';
import { BatchComponent }    from './components/batch/batch.component';

import { DataComponent }     from './data.component';
import { routing }           from './data.routing';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgaModule,
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    routing
  ],
  declarations: [
    DataComponent,
    StreamComponent,
    BatchComponent,
  ]
})
export class DataModule {}