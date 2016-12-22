import { Routes, RouterModule }  from '@angular/router';

import { Payment } from './payment.component';

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: Payment
  }
];

export const routing = RouterModule.forChild(routes);
