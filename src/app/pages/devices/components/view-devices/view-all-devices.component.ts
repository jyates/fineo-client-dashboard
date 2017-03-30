import {Component, ViewChild} from '@angular/core';
import { Router } from '@angular/router';

import {
  DeviceDataService,
  DeviceInfo
} from '../../../../services/deviceData.service'
import { DeviceHoverTable } from '../deviceTable/deviceTable.component'

@Component({
  selector: 'view-all-devices',
  templateUrl: './devices.html',
  styleUrls: ['./devices.scss']
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
      if(err.credentials){
        console.log("Credentials failed to load. Should revert back to login screen");
        console.log("Credentials failed because:", err.message);
        return;
      }
      console.log("Failed to create a new device:");
      console.log(JSON.stringify(err));
      alert("Failed to create a new device! Please send console output to help@fineo.io");
    })
  }

  public doneLoading(event:boolean): void{
    console.log("Done loading: ", event);
    this.loading = false;
  }

  public deletingItem(device):void{
    if(device == null){
      console.log("Done deleting device!");
      this.loading = false;
    }else{
      console.log("Waiting for device delete!");
      this.loading = true;
    }
  }
}
