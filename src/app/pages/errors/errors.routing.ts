import { Routes, RouterModule }  from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { Errors } from './errors.component';

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: Errors,
    children: [
    ]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);