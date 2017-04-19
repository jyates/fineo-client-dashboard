import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'

import { DataReadService, FineoApi, Metadata } from '../../services'
import { BaThemeConfigProvider, colorHelper } from '../../theme';
import { CardConfig } from './components';
import { GaugeConfig } from './gauge';
import { DonutConfig, DonutHandler } from './donut';
import { LineConfig, LineHandler, LineQuery, Xaxis, QueryChartConfig} from './line'

@Component({
  selector: 'dashboard',
  styleUrls: ['./dashboard.scss'],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit {

  private static CREATE_ELEMENT = "/pages/dashboard/create";

  private loading: boolean = true;
  // there is only a single container, and sort order within the container
  public container: Array<DashboardElement> = []; //dashboard elements

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
    let gquery = 'SELECT stats, `percent` FROM (VALUES (57,820, 75)) as MyTable("stats", "percent")';
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
    let dconfig = new DonutConfig();
    this.container.push(new DashboardElement(
      this.data(DonutHandler.DEMO_DATA),
      'Large Donut Chart', 'large', 'donut', JSON.stringify(dconfig), false));

    // and a simple line chart
    let q1 = new LineQuery("DEMO QUERY", "query1", colorHelper.hexToRgbA(graphColor, 0.3), new QueryChartConfig("g0", "date", "value"));
    let q2 = new LineQuery("DEMO QUERY", "query2", colorHelper.hexToRgbA(graphColor, 0.15), new QueryChartConfig("g1", "date", "value"));
    let xaxis = new Xaxis("date", true, layoutColors.defaultText, layoutColors.defaultText, 'DD');
    let lconfig = new LineConfig('fill', 'fill', [q1, q2], xaxis, 'smoothedLine');
    let slconfig = JSON.stringify(lconfig);
    debugger;
    this.container.push(new DashboardElement(
        this.data(LineHandler.DEMO_DATA), 'Medium Line Chart', 'medium', 'line', slconfig, false));
  }

  private data(result: any): DashboardDataService {
    return new DashboardDataService(this.dataService, result);
  }

  public deleteCard(index: number) {
    console.log("Delete card selected for card:", index)
  }

  public editCard(index: number) {
    console.log("Edit card selected for card:", index)
  }

  public addDashboardElement() {
    console.log("Add new dashboard element");
    this.router.navigate([Dashboard.CREATE_ELEMENT]);
  }
}

class DashboardElement {
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

  constructor(private dataService: DataReadService, private data: any = null) { }

  public read(sql: string): Promise<any> {
    if (this.data) {
      return Promise.resolve(this.data);
    }
    return this.dataService.read(sql);
  }
}