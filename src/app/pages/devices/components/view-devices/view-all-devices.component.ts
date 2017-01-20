import {Component, ViewEncapsulation, ViewChild} from '@angular/core';
import { Router } from '@angular/router';

import {
  DeviceDataService,
  DeviceInfo
} from '../../../../services/deviceData.service'
import { DeviceHoverTable } from '../deviceTable/deviceTable.component'

@Component({
  selector: 'view-all-devices',
  encapsulation: ViewEncapsulation.None,
  template: require('./devices.html'),
  styles: [require('./devices.scss')]
})
export class ViewAllDevicesComponent {

  @ViewChild('deviceTable') deviceTable: DeviceHoverTable;
  public loading:boolean = true;
  constructor(private router: Router,
              private devices: DeviceDataService) {
  }

  public newDevice():void{
    console.log("creating new device");
    this.devices.createDevice().then((result:DeviceInfo) =>{
      this.deviceTable.addDevice(result);
    }).catch(err =>{
      console.log("Failed to create a new device:");
      console.log(JSON.stringify(err));
      alert("Failed to create a new device! Please send console output to help@fineo.io");
    })
  }

  public doneLoading(event): void{
    this.loading = false;
  }
}
