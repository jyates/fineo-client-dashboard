import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';

import { ModalModule } from 'ng2-bootstrap/ng2-bootstrap';

import { routing } from './devices.routing';

import { DeviceHoverTable }         from './components/deviceTable/deviceTable.component';
import { ViewDeviceComponent }      from './components/view/view-device.component';
import { ViewAllDevicesComponent }  from './components/view-devices/view-all-devices.component';
import { ViewKeysComponent }        from './components/keys/view-keys.component';

import { Devices } from './devices.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgaModule,
    ModalModule,
    routing
  ],
  declarations: [
    Devices,
    DeviceHoverTable,
    ViewAllDevicesComponent,
    ViewDeviceComponent,
    ViewKeysComponent
  ]
})
export default class DevicesModule {}
