import {Component} from '@angular/core';

import {DeviceDataService} from '../../../../deviceData.service'

@Component({
  selector: 'condensed-table',
  template: require('./condensedTable.html')
})
export class CondensedTable {

  peopleTableData:Array<any>;

  constructor(private _basicTablesService: DeviceDataService) {
    this.peopleTableData = _basicTablesService.peopleTableData;
  }
}
