import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';

import { ModalModule } from 'ng2-bootstrap';

import { routing } from './devices.routing';

import { DeviceHoverTable }         from './components/deviceTable/deviceTable.component';
import { ViewDeviceComponent }      from './components/view/view-device.component';
import { ViewAllDevicesComponent }  from './components/view-devices/view-all-devices.component';

import { Devices } from './devices.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgaModule,
    ModalModule.forRoot(),
    routing
  ],
  declarations: [
    Devices,
    DeviceHoverTable,
    ViewAllDevicesComponent,
    ViewDeviceComponent,
  ]
})
export default class DevicesModule {}
