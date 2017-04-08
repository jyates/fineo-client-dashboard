import { Routes, RouterModule }  from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { Errors } from './errors.component';
import { CanDeactivateGuard } from './can.deactivate.guard'

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: Errors,
    canDeactivate: [CanDeactivateGuard]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);