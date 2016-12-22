import {Component} from '@angular/core';

import {DeviceDataService} from '../../../../deviceData.service'

@Component({
  selector: 'bordered-table',
  template: require('./borderedTable.html'),
})
export class BorderedTable {

  metricsTableData:Array<any>;

  constructor(private _basicTablesService: DeviceDataService) {
    this.metricsTableData = _basicTablesService.metricsTableData;
  }
}
