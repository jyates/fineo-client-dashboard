import { Routes, RouterModule }  from '@angular/router';

import { Dashboard } from './dashboard.component';
import { ModuleWithProviders } from '@angular/core';
import { DashboardOutlet } from './dashboard.outlet.component';
import { CreateComponent } from './create/create.component';
import { CreateItem } from './createItem/create.item.component';

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: DashboardOutlet,
    children: [
      {path: '', component: Dashboard},
      { path: 'create', component: CreateComponent },
      {path: 'create/:type', component: CreateItem}
    ]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
