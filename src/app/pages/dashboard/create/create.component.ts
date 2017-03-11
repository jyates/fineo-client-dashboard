import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { BaThemeConfigProvider, colorHelper } from '../../../theme';

@Component({
  selector: 'create-dashboard-item',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./create.scss')],
  template: require('./create.html')
})
export class CreateComponent {

  private gauge: Object;
  private donut: Object;
  private _init: boolean = false;

  constructor(private _baConfig: BaThemeConfigProvider,
    private router: Router) {
    let pieColor = this._baConfig.get().colors.custom.dashboardPieChart;

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
