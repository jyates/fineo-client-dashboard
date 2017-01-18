import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AlertModule } from 'ng2-bootstrap';
import { ModalModule } from 'ng2-bootstrap/ng2-bootstrap';

import { NgaModule } from '../../theme/nga.module';

import { AddSchemaComponent }  from './components/add/add.component'
import { AddFieldComponent }   from './components/add-field/add-field.component'
import { FieldSubComponent }   from './components/field/field.component'
import { SchemaComponent }     from './components/schema/schema.component'
import { StringifyPipe }       from './components/util/stringify.pipe';
import { Schemas }             from './schemas.component';
import { routing }             from './schemas.routing';

@NgModule({
  imports: [
    AlertModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgaModule,
    ModalModule,
    routing
  ],
  declarations: [
    Schemas,
    SchemaComponent,
    FieldSubComponent,
    AddSchemaComponent,
    AddFieldComponent,
    StringifyPipe
  ]
})
export default class SchemasModule {
}

