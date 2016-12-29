import { Routes, RouterModule }  from '@angular/router';

import { Schemas } from './schemas.component';
import { SchemaComponent } from './components/schema/schema.component';
import { AddSchemaComponent } from './components/add/add.component';

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: Schemas,
    children: [
      { path: 'inst/:id', component: SchemaComponent },
      { path: 'create', component: AddSchemaComponent }
      // { path: 'schemas/1234', component: SchemaComponent }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
