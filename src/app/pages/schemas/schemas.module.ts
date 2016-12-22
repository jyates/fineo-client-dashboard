import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CKEditorModule } from 'ng2-ckeditor';
import { NgaModule } from '../../theme/nga.module';

import { AddSchemaComponent }  from './components/add/add.component'
import { SchemaComponent }     from './components/schema/schema.component'
import { Schemas }             from './schemas.component';
import { routing }             from './schemas.routing';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgaModule,
    CKEditorModule,
    routing
  ],
  declarations: [
    Schemas,
    SchemaComponent,
    AddSchemaComponent
  ]
})
export default class SchemasModule {
}

