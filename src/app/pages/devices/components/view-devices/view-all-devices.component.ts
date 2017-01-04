import {Component, ViewEncapsulation} from '@angular/core';
import { Router } from '@angular/router';

import { DeviceDataService } from '../../deviceData.service'

@Component({
  selector: 'view-all-devices',
  encapsulation: ViewEncapsulation.None,
  template: require('./devices.html')
})
export class ViewAllDevicesComponent {

  constructor(private router: Router,
              private devices: DeviceDataService) {
  }

  // user wants to create a new device
  public newDevice():void{
    console.log("creating new device");
    this.devices.createDevice();
  }
}
