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

  constructor(private _baConfig:BaThemeConfigProvider) {
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

  ngAfterViewInit() {
    if (!this._init) {
      this._loadPieCharts();
      this._init = true;
    }
  }

  private _loadPieCharts() {
    jQuery('.chart').each(function () {
      let chart = jQuery(this);
      chart.easyPieChart({
        easing: 'easeOutBounce',
        onStep: function (from, to, percent) {
          jQuery(this.el).find('.percent').text(Math.round(percent));
        },
        barColor: jQuery(this).attr('data-rel'),
        trackColor: 'rgba(0,0,0,0)',
        size: 84,
        scaleLength: 0,
        animation: 2000,
        lineWidth: 9,
        lineCap: 'round',
      });
    });
  }

  private select(type:string){
    console.log("Selecting type:", type);
  }

  private selectGauge(){
    console.log("Selecting gauge component");
  }
}
