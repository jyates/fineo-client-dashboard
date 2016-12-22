import { Routes, RouterModule }  from '@angular/router';

import { Schemas } from './schemas.component';
import { SchemaComponent } from './components/schema/schema.component';


// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: Schemas,
    children: [
      { path: ':id', component: SchemaComponent }
      // { path: 'schemas/1234', component: SchemaComponent }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
