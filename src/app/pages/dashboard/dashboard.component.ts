import { Component, OnInit } from '@angular/core';
import { DataReadService, FineoApi, Metadata } from '../../services'
import { BaThemeConfigProvider, colorHelper } from '../../theme';

@Component({
  selector: 'dashboard',
  styleUrls: ['./dashboard.scss'],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit {

  private loading: boolean = true;
  // there is only a single container, and sort order within the container
  public container: Array<DashboardElement> = []; //dashboard elements

  private meta: Metadata;
  constructor(private dataService: DataReadService, fineo: FineoApi, private _baConfig: BaThemeConfigProvider) {
    this.meta = fineo.meta;
  }

  public ngOnInit() {
    // get the dashboard for the user and build the elements to correspond

    // but for now, lets fake it!
    let pieColor = this._baConfig.get().colors.custom.dashboardPieChart;
    var layoutColors = this._baConfig.get().colors;
    var graphColor = this._baConfig.get().colors.custom.dashboardLineChart;
    let gaugedata = new DashboardDataService(this.dataService, [{ stats: '57,820', percent: 75 }])
    let gconf = {
      "color": pieColor,
      "icon": "money",

    };
    this.container.push(new DashboardElement(
      gaugedata,
      'dashboard gauge', 'large',
      ['SELECT stats, `percent` FROM (VALUES (57,820, 75)) as MyTable("stats", "percent")'],
      'gauge', JSON.stringify(gconf)));
  }
}

class DashboardElement {
  public config: any = {};
  constructor(private data: DashboardDataService, title: string, size: string, queries: Array<string>, public type: string, configAttributes: string) {
    if (configAttributes) {
      this.config = JSON.parse(configAttributes);
    }
    this.config.title = title;
    this.config.size = size;
  }
}

/**
* Light wrapper around the data service for testability
*/
export class DashboardDataService {

  constructor(private dataService: DataReadService, private data: any = null) { }

  public read(sql: string): Promise<any> {
    if (this.data) {
      return Promise.resolve(this.data);
    }
    return this.dataService.read(sql);
  }
}