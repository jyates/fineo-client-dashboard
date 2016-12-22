import {Component} from '@angular/core';

import {DeviceDataService} from '../../../../deviceData.service'

@Component({
  selector: 'striped-table',
  template: require('./stripedTable.html')
})
export class StripedTable {

  smartTableData:Array<any>;

  constructor(private _basicTablesService: DeviceDataService) {
    this.smartTableData = _basicTablesService.smartTableData;
  }
}
