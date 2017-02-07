import { Routes, RouterModule }  from '@angular/router';

import { SelectPackage } from './select-package.component';

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: SelectPackage
  }
];

export const routing = RouterModule.forChild(routes);
