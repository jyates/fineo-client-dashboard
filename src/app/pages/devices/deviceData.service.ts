import { Injectable } from '@angular/core';

export class DeviceKeyInfo{
  constructor(public id:string){}
}

export class DeviceInfo{
  constructor(public id:string,
              public name:string,
              public keys:DeviceKeyInfo[]){}
}

@Injectable()
export class DeviceDataService {

  devices = [
    new DeviceInfo("d1235232112", "floor 1, sensor 1", [new DeviceKeyInfo("a1234"), new DeviceKeyInfo("a2234")]),
    new DeviceInfo("d2235232112", "floor 1, sensor 2", [new DeviceKeyInfo("b1234"), new DeviceKeyInfo("b2234")]),
    new DeviceInfo("d3235232112", "floor 2, sensor 1", [new DeviceKeyInfo("c1234"), new DeviceKeyInfo("c2234")]),
    new DeviceInfo("d4235232112", "floor 2, sensor 2", [new DeviceKeyInfo("d1234"), new DeviceKeyInfo("d2234")])
  ];

  /*
  * @params:
  * - device: id of the device to load
  */
  public getDeviceInfo(id:string): DeviceInfo{
    var devices = this.devices.filter(elem => elem.id == id);
    if(devices.length == 0){
      return null;
    }
    return devices[0];
  }

  public updateDeviceName(id:string, name:string):void{
    console.log("Updating device: "+id+" to name: "+name);
    // network call
  }

  /*
  * @params:
  * - device: id of the device to delete
  */
  public delete_device(device:string):void{
    console.log("'Deleting' device: "+device);
    // netork call to delete the device
  }
}
