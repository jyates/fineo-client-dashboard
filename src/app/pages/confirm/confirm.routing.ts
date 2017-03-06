import { Routes, RouterModule }  from '@angular/router';

import { ConfirmEmpty } from './confirm.empty.component';
import { Confirm } from './confirm.component';
import { NextSteps } from './next-steps/next.steps.component';

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: ConfirmEmpty,
    children:[
      {path: "", component: Confirm},
      {path: "next-steps", component: NextSteps}
    ]
  }
];

export const routing = RouterModule.forChild(routes);
