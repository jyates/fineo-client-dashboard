import {Component, ViewEncapsulation} from '@angular/core';

import {BaThemeConfigProvider, colorHelper} from '../../../theme';

@Component({
  selector: 'create-dashboard-item',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./create.scss')],
  template: require('./create.html')
})
export class CreateComponent {

  private gauge:Object;
  private _init:boolean = false;

  constructor(private _baConfig: BaThemeConfigProvider) {
    let pieColor = this._baConfig.get().colors.custom.dashboardPieChart;
    this.gauge = {
      color: pieColor,
      description: 'Gauge',
      stats: '57,820',
      icon: 'person',
      size: 'large',
      percent: 75
    };
  }

  private select(type:string){
    console.log("Selecting type:", type);
  }

  private selectGauge(){
    console.log("Selecting gauge component");
  }
}
