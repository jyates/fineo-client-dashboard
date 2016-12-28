import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgaModule } from '../../theme/nga.module';
import { ModalModule } from 'ng2-bootstrap/ng2-bootstrap';

import { AddSchemaComponent }  from './components/add/add.component'
import { SchemaComponent, FieldSubComponent }     from './components/schema/schema.component'
// import { AddFieldModalComponent }     from './components/add-field-modal/add_field_modal.component'
import { Schemas }             from './schemas.component';
import { routing }             from './schemas.routing';



@NgModule({
  imports: [
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
    AddSchemaComponent,
    FieldSubComponent
    // ,AddFieldModalComponent
  ]
})
export default class SchemasModule {
}

