import { Component, ViewChild, Input, Output, ElementRef, EventEmitter } from '@angular/core';

import { BaThemePreloader } from '../../../theme/services';

import 'amcharts3';
import 'amcharts3/amcharts/plugins/responsive/responsive.js';
import 'amcharts3/amcharts/serial.js';

import 'ammap3';
import 'ammap3/ammap/maps/js/worldLow';


import { BaAmChartThemeService } from './baAmChartTheme.service';

import 'style-loader!./baAmChart.scss';

@Component({
  selector: 'ba-am-chart',
  templateUrl: './baAmChart.html',
  providers: [BaAmChartThemeService],
})
export class BaAmChart {

  @Input() baAmChartConfiguration: Object;
  @Input() baAmChartClass: string;
  @Output() onChartReady = new EventEmitter<any>();

  @ViewChild('baAmChart') public _selector: ElementRef;
  private chart;

  constructor(private _baAmChartThemeService: BaAmChartThemeService) {
    this._loadChartsLib();
  }

  ngOnInit() {
    AmCharts.themes.blur = this._baAmChartThemeService.getTheme();
  }

  ngAfterViewInit() {
    debugger;
    console.log("Creating chart with config:", this.baAmChartConfiguration);
    this.chart = AmCharts.makeChart(this._selector.nativeElement, this.baAmChartConfiguration);
    this.onChartReady.emit(this.chart);
  }


  public resetChart(config){
    // this.chart = AmCharts.makeChart(this._selector.nativeElement, config);
    // this.onChartReady.emit(this.chart);
  }

  public updateGraphs(graphs: Array<any>) {
    if (!this.chart) {
      console.log("Skipping updating graphs becuase no current chart");
      return;
    }
    for (var i = 0; i < graphs.length; i++) {
      var graph = graphs[i];
      var current = this.chart.graphs[i];
      if (!current) {
        console.log("Adding graph because none was found at: ", i);
        var graph = new AmCharts.AmGraph();
        this.chart.addGraph(graph);
        continue;
      }
      current.type = graph.type;
      current.valueField = graph.valueField;
      current.color = graph.color;
    }
    this.chart.invalidateSize();
    this.chart.animateAgain();
  }

  public updateData(dataProvider) {
    return;
    this.chart.dataProvider = dataProvider;
    this.chart.validateData();
  }

  private _loadChartsLib(): void {
    BaThemePreloader.registerLoader(new Promise((resolve, reject) => {
      let amChartsReadyMsg = 'AmCharts ready';

      if (AmCharts.isReady) {
        resolve(amChartsReadyMsg);
      } else {
        AmCharts.ready(function() {
          resolve(amChartsReadyMsg);
        });
      }
    }));
  }
}
