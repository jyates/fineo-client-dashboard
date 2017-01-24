import {Component, EventEmitter} from '@angular/core';

import {
  DeviceDataService,
  DeviceInfo
} from '../../../../services/deviceData.service'

@Component({
  selector: 'device-table',
  template: require('./deviceTable.html'),
  outputs : ['loaded', 'deleting']
})
export class DeviceHoverTable {

  public metricsTableData:DeviceInfo[] = [];
  public loaded = new EventEmitter();
  public deleting = new EventEmitter();

  constructor(private device_service: DeviceDataService) {
   this.device_service.devices().then(result =>{
     this.loaded.next(true);
     this.metricsTableData = result;
   }).catch(err =>{
     this.loaded.next(false);
     this.alertFineo("load device information", err);
   })
  }

  onDeleteConfirm(device_info): void {
    if (!window.confirm('Are you sure you want to delete device: ' + device_info["id"] + '?')) {
      // nope, don't actually want to delete that device
      return;
    }

    // notify listeners that we are deleting the device
    this.deleting.next(device_info);

    // delete the device
     this.device_service.delete_device(device_info.id).then(result =>{
       // remove the device for 'responsive' design
       this.metricsTableData = this.metricsTableData.filter(elem => elem.id != device_info.id);

       // update the actual device information
       return this.device_service.devices().then(result =>{
         this.deleting.next(null);
         this.metricsTableData = result;
       })
     })
     .catch(err =>{
       this.alertFineo("delete device "+device_info.id, err);
       this.deleting.next(null);
     });
  }

  private alertFineo(op:string, err:Object):void{
       console.log("Failed to ", op)
       console.log(JSON.stringify(err));
       alert("Failed to "+op+". Please send console to help@fineo.io");
  }

  public addDevice(device:DeviceInfo){
    this.metricsTableData.push(device);
  }
}
