import { Routes, RouterModule }  from '@angular/router';

import { Devices } from './devices.component';
import { ViewAllDevicesComponent } from './components/view-devices/view-all-devices.component'
import { ViewDeviceComponent }     from './components/view/view-device.component'
// import { CreateDeviceComponent } from './components/create/create-device.component'

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: Devices,
    children: [
      { path: 'view', component: ViewAllDevicesComponent },
      // { path: 'create', component: CreateDeviceComponent },
      { path: 'inst/:id', component: ViewDeviceComponent }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
