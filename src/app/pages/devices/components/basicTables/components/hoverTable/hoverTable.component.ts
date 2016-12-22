import {Component} from '@angular/core';

import {DeviceDataService} from '../../../../deviceData.service'

@Component({
  selector: 'device-table',
  template: require('./hoverTable.html')
})
export class DeviceHoverTable {

  metricsTableData:Array<any>;

  constructor(private device_service: DeviceDataService) {
    this.metricsTableData = device_service.devices;
  }

  onDeleteConfirm(device_info): void {
    if (!window.confirm('Are you sure you want to delete device: ' + device_info["id"] + '?')) {
      // nope, don't actually want to delete that device
      return;
    }

    // delete the device
     this.device_service.delete_device(device_info);
  }
}
