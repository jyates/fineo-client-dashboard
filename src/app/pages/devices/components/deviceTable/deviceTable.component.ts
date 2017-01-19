import {Component} from '@angular/core';

import {DeviceDataService} from '../../../../services/deviceData.service'

@Component({
  selector: 'device-table',
  template: require('./deviceTable.html')
})
export class DeviceHoverTable {

  metricsTableData:Array<any>;

  constructor(private device_service: DeviceDataService) {
   this.device_service.devices().then(result =>{
     this.metricsTableData = result;
   });
  }

  onDeleteConfirm(device_info): void {
    if (!window.confirm('Are you sure you want to delete device: ' + device_info["id"] + '?')) {
      // nope, don't actually want to delete that device
      return;
    }

    // delete the device
     this.device_service.delete_device(device_info.id).then(result =>{
       // remove the device for 'responsive' design
       this.metricsTableData = this.metricsTableData.filter(elem => elem.id != device_info.id);

       // update the actual device information
       return this.device_service.devices().then(result =>{
         this.metricsTableData = result;
       })
     })
     .catch(err =>{
       console.log("Failed to delete device ", device_info.id);
       console.log(JSON.stringify(err));
       alert("Failed to delete device "+ device_info.id+". Please send console to help@fineo.io");
     });
     
  }
}
