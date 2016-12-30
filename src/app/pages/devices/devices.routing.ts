import { Routes, RouterModule }  from '@angular/router';

import { Devices } from './devices.component';
import { ViewDeviceComponent } from './components/view/view-device.component'

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: Devices,
    children: [
      { path: ':id', component: ViewDeviceComponent }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
