import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { BaThemeConfigProvider, colorHelper } from '../../../theme';
import { Xaxis, GraphInfo } from '../line';

@Component({
  selector: 'create-dashboard-item',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./create.scss'],
  templateUrl: './create.html'
})
export class CreateComponent {

  private gauge: Object;
  private donut: Object;
  private line: Object;
  private _init: boolean = false;

  constructor(private _baConfig: BaThemeConfigProvider,
    private router: Router) {
    let pieColor = this._baConfig.get().colors.custom.dashboardPieChart;
    var layoutColors = this._baConfig.get().colors;
    var graphColor = this._baConfig.get().colors.custom.dashboardLineChart;

    this.gauge = {
      config: {
        color: pieColor,
        title: 'Gauge',
        icon: 'person',
        size: 'large',
      },
      data: {
        stats: '57,820',
        percent: 75
      }
    };

    this.donut = {
      config: {
        title: "Donut Chart",
        size: 'large',
        valueType: 'percent',
        centerEnabled: true,
        centerLabel: 'Total Value'
      },
      data: {
        column1: 10,
        column2: 20,
        column3: 75,
        column4: 35,
        column5: 122
      },
      colors: CreateComponent.donutColors(this._baConfig)
    }

    this.line = {
      data:{

      },
      config:{
        title: "Line Chart",
        size: "large",
        queries: [
          {
            id: "1",
            color: colorHelper.hexToRgbA(graphColor, 0.3),
            chart:{
              xfield: "x",
              yfield: "y"
            }
          },
          {
            id: "2",
            color: colorHelper.hexToRgbA(graphColor, 0.15),
            chart:{
              xfield: "x",
              yfield: "y"
            }
          }
        ],
        xAxisIsDate: false,
        xAxis: new Xaxis("x", false, layoutColors.defaultText, layoutColors.defaultText),
        info:{

        }
      }
    }
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
