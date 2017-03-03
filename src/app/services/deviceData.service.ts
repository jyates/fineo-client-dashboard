import { Injectable, Inject } from '@angular/core';

import {
  FineoApi,
  Metadata
} from './fineo.service';

import {RETRY_TIMEOUT} from '../environment'

export class DeviceKeyInfo{
  constructor(public id:string){}
}

export class CreatedDeviceKeyInfo extends DeviceKeyInfo{
  constructor(id:string, public secret:string){
    super(id);
  }
}

export class DeviceInfo{
  constructor(public id:string,
              public name:string,
              public keys:DeviceKeyInfo[]){}
}

@Injectable()
export class DeviceDataService {

  private deviceService:Metadata;
  constructor(@Inject(FineoApi) fineo:FineoApi){
    this.deviceService = fineo.meta;
  }

  /**
  * @param device: id of the device to load
  */
  public getDeviceInfo(id:string): Promise<DeviceInfo>{
    let p1 = this.deviceService.getDeviceInfo(id);
    let p2 = this.deviceService.getDeviceKeys(id);
    return  <Promise<DeviceInfo>>Promise.all([p1, p2])
            .then(result =>{
              let deviceInfo = result[0];
              let keyInfo = result[1];
              let keys = []
              keyInfo.keys.forEach(key =>{
                keys.push(new DeviceKeyInfo(key));
              });
              return Promise.resolve(new DeviceInfo(id, deviceInfo.description, keys));
            });
  }

  /**
  * Get information about all the current devices
  */
  public devices():Promise<DeviceInfo[]>{
    // sometimes the user isn't fully "created" when logging in. This avoids failing for that
    let p = Promise.reject("inital");
    return p.catch(a => this.deviceService.getDeviceIds())
          .catch(this.rejectDelay)
          .catch(a => this.deviceService.getDeviceIds())
          .then(result =>{
      let info = []
      if(result.devices === undefined){
        return Promise.resolve([]);
      }

      result.devices.forEach(id =>{
        info.push(this.getDeviceInfo(id));
      });
      return Promise.all(info);
    });
  }

  private rejectDelay(reason):Promise<any> {
    console.log("Waiting", RETRY_TIMEOUT, "ms after failure. Error:", reason);
    return new Promise(function(resolve, reject) {
      setTimeout(reject.bind(null, reason), RETRY_TIMEOUT);
    });
  }

  public updateDeviceName(id:string, name:string):Promise<any>{
    console.log("Updating device: "+id+" to name: "+name);
    return this.deviceService.updateDevice(id, name);
  }

  /**
  * @param device: id of the device to delete
  */
  public delete_device(device:string):Promise<any>{
    console.log("'Deleting' device: "+device);
    return this.deviceService.deleteDevice(device);
  }

  public createKey(id:string):Promise<CreatedDeviceKeyInfo>{
    console.log("creating key for device id: "+id);
    return this.deviceService.createKey(id).then(result =>{
      return Promise.resolve(new CreatedDeviceKeyInfo(result.key, result.secret));
    });
  }

  /**
  * @param id: id of the device to delete
  * @param key_id: id of the key to delete
  */
  public deleteKey(id:string, key_id:string):Promise<any>{
    console.log(id+") deleting key: "+key_id);
    return this.deviceService.deleteKey(id, key_id);
  }

  public createDevice():Promise<DeviceInfo>{
    console.log("creating a new device!");
    return this.deviceService.createDevice().then(result =>{
      return Promise.resolve(new DeviceInfo(result.id, "", []));
    });
  }
}
