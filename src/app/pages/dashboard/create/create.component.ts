import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { BaThemeConfigProvider, colorHelper } from '../../../theme';
import { LineHandler, Xaxis, QueryChartConfig, LineQuery, LineConfig } from '../line';
import { GaugeHandler } from '../gauge'
import { DonutHandler } from '../donut'
import { CardConfig } from '../components'

@Component({
  selector: 'create-dashboard-item',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./create.scss'],
  templateUrl: './create.html'
})
export class CreateComponent implements OnInit {

  public card: CardConfig;
  private gauge: Object;
  private donut: Object;
  private line: Object;
  private _init: boolean = false;

  constructor(private _baConfig: BaThemeConfigProvider,
    private router: Router) {
    let pieColor = this._baConfig.get().colors.custom.dashboardPieChart;
    var layoutColors = this._baConfig.get().colors;
    var graphColor = this._baConfig.get().colors.custom.dashboardLineChart;

    // all the display cards are _not_ editable, deletable or sortable
    this.card = new CardConfig(false, false, false);

    // setup the basic configurations for each graph that we support
    this.gauge = {
      config: {
        color: pieColor,
        title: 'Gauge',
        icon: 'person',
        size: 'large',
        value: 'stats',
        percent: 'percent'
      },
      data: GaugeHandler.DEMO_DATA
    };
    this.donut = {
      config: {
        title: "Donut Chart",
        size: 'large',
        valueType: 'percent',
        centerEnabled: true,
        centerLabel: 'Total Value',
        colorOptions: CreateComponent.donutColors(this._baConfig)
      },
      data: DonutHandler.DEMO_DATA
    }
    this.line = {
      data: LineHandler.DEMO_DATA,
      config: new LineConfig("Line Chart", "medium", [
        new LineQuery("DEMO QUERY", "query1", colorHelper.hexToRgbA(graphColor, 0.3), new QueryChartConfig("g0", "timestamp", "value")),
        new LineQuery("DEMO QUERY", "query2", colorHelper.hexToRgbA(graphColor, 0.15), new QueryChartConfig("g1", "timestamp", "value")),
      ],
        new Xaxis("date", true, layoutColors.defaultText, layoutColors.defaultText, 'DD'), "smoothedLine")
    }
  }

  ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });
  }

  private static donutColors(_baConfig: BaThemeConfigProvider): Object[] {
    let colorOptions = []
    let dashboardColors = _baConfig.get().colors.dashboard;
    Object.keys(dashboardColors).forEach(name => {
      colorOptions.push({
        name: name,
        color: dashboardColors[name]
      })
    });
    return colorOptions;
  }

  private select(type: string) {
    console.log("Selecting type:", type);
    this.router.navigate(['/pages/dashboard/create/' + type]);
  }
}
