import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'

import { DataReadService, FineoApi, Metadata } from '../../services'
import { BaThemeConfigProvider, colorHelper } from '../../theme';
import { CardConfig } from './components';
import { GaugeConfig } from './gauge';
import { DonutConfig, DonutHandler } from './donut';
import { LineConfig, LineHandler, LineQuery, Xaxis, QueryChartConfig } from './line'

@Component({
  selector: 'dashboard',
  styleUrls: ['./dashboard.scss'],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit {

  private static CREATE_ELEMENT = "/pages/dashboard/create";

  // track the 'view mode' for the dashboard.
  // Use different view modes we so don't need to deal with serializing configs, etc. between screens
  public mode: string = 'display';
  private loading: boolean = true;
  // there is only a single container, and sort order within the container
  public container: Array<DashboardElement> = []; //dashboard elements
  private editIndex: number = -1;

  private meta: Metadata;
  constructor(private dataService: DataReadService, fineo: FineoApi, private _baConfig: BaThemeConfigProvider, private router: Router) {
    this.meta = fineo.meta;
  }

  public ngOnInit() {
    // get the dashboard for the user and build the elements to correspond
    var found = false;
    // oh no, we don't have a dashboard for them. Add the default one.
    if (!found) {
      this.addDefaultDashboardElements();
    }
    this.loading = false;
  }

  private addDefaultDashboardElements() {
    // but for now, lets fake it!
    let pieColor = this._baConfig.get().colors.custom.dashboardPieChart;
    var layoutColors = this._baConfig.get().colors;
    var graphColor = this._baConfig.get().colors.custom.dashboardLineChart;
    // first gauge
    let gquery = 'SELECT `value`, `percent` FROM (VALUES (57,820, 75)) as MyTable("value", "percent")';
    let gconf = new GaugeConfig('fill title', gquery, 'fillSize', 'money', 'value', 'percent');
    // second gauge
    let gconf2 = new GaugeConfig('fill title', gquery, 'fillSize', 'refresh', 'value', 'percent');
    // add the gauges
    this.container.push(new DashboardElement(this.data({ value: '2000', percent: 20 }),
      'Small Gauge', 'small', 'gauge', JSON.stringify(gconf2), false));
    this.container.push(new DashboardElement(this.data({ value: '57,820', percent: 75 }),
      'Large Gauge', 'large', 'gauge', JSON.stringify(gconf), false));
    this.container.push(new DashboardElement(this.data({ value: '120', percent: 2 }),
      'Small Gauge 2', 'small', 'gauge', JSON.stringify(gconf2), false));

    // a simple donut
    let dconfig = new DonutConfig('fill', "SELECT 10 as column1, 20 as column2, 75 as column3, 35 as column4, 122 as column5 FROM (VALUES (1))");
    this.container.push(new DashboardElement(
      this.data(DonutHandler.DEMO_DATA),
      'Large Donut Chart', 'large', 'donut', JSON.stringify(dconfig), false));

    // and a simple line chart
    let q1 = new LineQuery("DEMO QUERY", "query1", colorHelper.hexToRgbA(graphColor, 0.3), new QueryChartConfig("g0", "timestamp", "value"));
    let q2 = new LineQuery("DEMO QUERY", "query2", colorHelper.hexToRgbA(graphColor, 0.15), new QueryChartConfig("g1", "timestamp", "value"));
    let xaxis = new Xaxis("date", true, layoutColors.defaultText, layoutColors.defaultText, 'DD');
    let lconfig = new LineConfig('fill', 'fill', [q1, q2], xaxis, 'smoothedLine');
    let slconfig = JSON.stringify(lconfig);
    this.container.push(new DashboardElement(
      this.data(LineHandler.DEMO_DATA), 'Medium Line Chart', 'medium', 'line', slconfig, false));
  }

  /**
   * Helper method to get create a dashboard service that just sends static data
  */
  private data(result: any): DashboardDataService {
    return new DashboardDataService(this.dataService, result);
  }

  public deleteCard(index: number) {
    console.log("Delete card selected for card:", index)
    this.loading = true;
    // TODO delete the chart
    setTimeout(() => { this.loading = false }, 2000);
  }

  public editCard(index: number) {
    console.log("Edit card selected for card:", index)
    this.editIndex = index;
    this.mode = 'edit';
  }

  public saveCard(index: number) {
    console.log("Saving edit card: ", this.editIndex, "vs.", index);
    this.loading = true;
    setTimeout(() => {
      this.mode = 'display';
      this.loading = false;
      this.editIndex = -1;
    }, 2000);
  }

  public cancelEdit(index: number) {
    console.log("Canceling editing card:", this.editCard, "vs.", index);
    this.mode = 'display';
    this.editIndex = -1;
  }

  public addDashboardElement() {
    console.log("Add new dashboard element");
    this.router.navigate([Dashboard.CREATE_ELEMENT]);
  }
}

export class DashboardElement {
  public config: any = {};
  public card: CardConfig = new CardConfig(true, true, true);
  constructor(public data: DashboardDataService, title: string, size: string, public type: string,
    configAttributes: string, public refresh: boolean = true) {
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

  private data;
  private index = 0;
  constructor(private dataService: DataReadService, data: any = null) {
    this.data = data;
    if (!Array.isArray(data)) {
      this.data = [data];
    }
  }

  public read(sql: string): Promise<any> {
    if (this.data) {
      return Promise.resolve(this.data[this.index++ % this.data.length]);
    }
    return this.dataService.read(sql);
  }
}