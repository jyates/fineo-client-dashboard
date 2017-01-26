import { Routes, RouterModule }  from '@angular/router';

import { Confirm } from './confirm.component';

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: Confirm
  }
];

export const routing = RouterModule.forChild(routes);
