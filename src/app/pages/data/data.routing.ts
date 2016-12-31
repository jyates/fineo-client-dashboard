import { Routes, RouterModule }  from '@angular/router';

import { DataComponent } from './data.component';
import { BatchComponent } from './components/batch/batch.component';
import { StreamComponent } from './components/stream/stream.component';

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: DataComponent,
    children: [
      { path: 'batch', component: BatchComponent },
      { path: 'stream', component: StreamComponent }
      // { path: 'schemas/1234', component: SchemaComponent }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
