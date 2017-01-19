import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ModalModule } from 'ng2-bootstrap/ng2-bootstrap';
// import { NgProgressModule } from 'ng2-progressbar';

import { NgaModule } from '../../theme/nga.module';

import { DataUploadService } from '../../services/dataUpload.service';

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
    ModalModule,
    DataUploadService,
    routing
  ],
  declarations: [
    DataComponent,
    StreamComponent,
    BatchComponent,
  ]
})
export default class DataModule {
}

