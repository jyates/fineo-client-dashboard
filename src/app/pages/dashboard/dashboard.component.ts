import { Component, OnInit } from '@angular/core';
import { DataReadService, FineoApi, Metadata } from '../../services'
import { BaThemeConfigProvider, colorHelper } from '../../theme';
import { CardConfig } from './components';
import { GaugeConfig } from './gauge';

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
    let gaugedata = new DashboardDataService(this.dataService, { value: '57,820', percent: 75 })
    let gquery = 'SELECT stats, `percent` FROM (VALUES (57,820, 75)) as MyTable("stats", "percent")';
    let gconf = new GaugeConfig('fill title', gquery, 'fillSize', 'money', 'value', 'percent');
    this.container.push(new DashboardElement(gaugedata, 'dashboard gauge', 'large', 'gauge', JSON.stringify(gconf)));
    // second gauge
    let gaugedata2 = new DashboardDataService(this.dataService, { value: '2000', percent: 20 })
    this.container.push(new DashboardElement(gaugedata2, 'dashboard gauge', 'large', 'gauge', JSON.stringify(gconf)));
    this.loading = false;
  }
}

class DashboardElement {
  public config: any = {};
  public card: CardConfig = new CardConfig(true, true, true);
  constructor(public data: DashboardDataService, title: string, size: string, public type: string, configAttributes: string) {
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