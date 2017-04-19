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
  @Input() id:string = "baAmChart"

  @ViewChild("baAmChart") _select: ElementRef;
  private chart;

  constructor(private elRef: ElementRef, private _baAmChartThemeService: BaAmChartThemeService) {
    this._loadChartsLib();
  }

  ngOnInit() {
    AmCharts.themes.blur = this._baAmChartThemeService.getTheme();
  }

  ngAfterViewInit() {
    console.log("Creating chart with config:", this.baAmChartConfiguration);
    debugger;
    this.chart = AmCharts.makeChart(this._select.nativeElement, this.baAmChartConfiguration);
    this.onChartReady.emit(this.chart);
  }

  public resetChart(config:Object){
    debugger;
    this.baAmChartConfiguration = config;
    this.chart = AmCharts.makeChart(this.id, config);
    this.onChartReady.emit(this.chart);
  }

  public updateXaxis(axis:Object){
    this.chart.categoryAxis = axis;
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
        console.log(i,") Adding graph", graph,"because none found");
        // var add = new AmCharts.AmGraph();
        // add.id = graph.id;
        // add.type = graph.type;
        this.chart.addGraph(graph);
        continue;
      }
      current.type = graph.type;
      current.valueField = graph.valueField;
      current.color = graph.color;
    }
  }

  public updateData(dataProvider) {
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
