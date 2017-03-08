import { Routes, RouterModule }  from '@angular/router';

import { Dashboard } from './dashboard.component';
import { ModuleWithProviders } from '@angular/core';
import { CreateComponent } from './create/create.component';

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: Dashboard,
    children: [
      { path: 'create', component: CreateComponent }
    ]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
