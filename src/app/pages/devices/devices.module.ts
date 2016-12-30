import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';

import { routing } from './devices.routing';

import { DeviceDataService }  from './deviceData.service';
import { DeviceHoverTable }   from './components/basicTables/components/hoverTable';
import { ViewDeviceComponent }   from './components/view/view-device.component';

import { Devices } from './devices.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgaModule,
    routing
  ],
  declarations: [
    Devices,
    DeviceHoverTable,
    ViewDeviceComponent
  ],
  providers: [
    DeviceDataService
  ]
})
export default class DevicesModule {}
