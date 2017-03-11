import { Component, Input, EventEmitter, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import './gauge.loader.ts';

import { BaseComponent, ItemConfig, Query } from './../baseComponent';
import { layoutPaths } from '../../../theme';

var nextId = 0;

@Component({
  selector: 'line-chart',
  styleUrls: ['./gauge.scss'],
  templateUrl: './gauge.html'
})
export class Line extends BaseComponent<LineConfig> {
  @Input()
  id = `line-${nextId++}`;

  public chartData: ChartData = new ChartData(layoutPaths.images.amChart);

  constructor() {
    super("line-chart-container");
  }

  private getChartClass() {
    return "dashboard-line-chart";// + this.config.size;
  }

  private getSize() {
    let elems = {};
    this.setSize("small", 4, elems);
    this.setSize("large", 6, elems);
    return elems;
  }

  // callback when chart is ready 
  initChart(chart: any) {
    let zoomChart = () => {
      chart.zoomToDates(new Date(2013, 3), new Date(2014, 0));
    };

    chart.addListener('rendered', zoomChart);
    zoomChart();

    if (chart.zoomChart) {
      chart.zoomChart();
    }
  }

  protected updateData() {
    this.chartData.data(this.data);
  }

  protected updateConfig() {
    this.chartData.categoryAxis = this.config.xAxis;
    this.chartData.categoryField = this.config.xAxis.name;
    this.chartData.updateGraphs(this.config.queries);
  }
}

export class LineConfig extends ItemConfig {

  constructor(title: string,
    queries: LineQuery[],
    size: string,
    public xAxisIsDate:boolean,
    public xAxis: Xaxis) {
    super(title, queries, size);
  }
}

export class LineQuery extends Query {
  constructor(text, name,
              public id:string,
              public color: string,
              public chart:QueryChartConfig) {
    super(text, name);
  }
}

export class QueryChartConfig{
  constructor(public xfield:string, public yfield){
    if (!xfield)
      throw new ReferenceError("Must provide an xfield name");
    if (!yfield)
      throw new ReferenceError("Must provide a yfield name");
  }

  public translate(rows:Object[], targetX:string):Object[]{
    let ret = [];
    rows.forEach(kv => {
      let x = kv[this.xfield];
      if(!x){
        console.log("Row is missing value for x-coordinate:", this.xfield);
        return;
      }
      let xfield = targetX ? targetX: this.xfield;
      let yfield = this.yfield;
      ret.push({
        xfield: x,
        yfield: kv[this.yfield]
      });
    });
    return ret;
  }
}

export class Xaxis {
  public boldPeriodBeginning = false;
  public parseDates: true;
  public gridAlpha: 0;
  public color;
  public axisColor;
  public name;
}

class ChartData {

  public dataProvider = [];
  public graphs: GraphInfo[];
  public categoryAxis: Xaxis = new Xaxis();
  public categoryField;
  public chartCursor: Cursor = new Cursor();
  public export: {
    enabled: true
  };
  public dataDateFormat: 'DD MM YYYY';
  public creditsPosition: 'bottom-right';
  public zoomOutButton: {
    backgroundColor: '#fff',
    backgroundAlpha: 1
  };
  public zoomOutText: 'zoom out';
  public type: 'serial';
  public theme: 'blur';
  public marginTop: 15;
  public marginRight: 15;
  public responsive: {
    'enabled': true
  };

  private queries: LineQuery[];
  private dataInternal: Object;

  constructor(public pathToImages){}

  // Update the data provider with new data
  public data(data: Object): void {
    this.dataInternal = data;
    /*
     * data will be formatted as:
     {
        [
          queryId:{
            [
              column: value
            ]
          }
        ]
     }
     */
    // parse the results according to the current queries we have
    let newProvider = [];
    if(!this.queries){
      return;
    }

    this.queries.forEach(query =>{
      let id = query.id;
      let rows = <Object[]>data[id];
      if(!rows){
        console.log("No rows recieved for query:", query);
        return;
      }
      rows = query.chart.translate(rows, this.categoryAxis.name)
      newProvider.push(rows);
    });

    this.dataProvider = newProvider;  
  }

  public updateGraphs(queries: LineQuery[]): void {
    this.queries = queries;
    this.data(this.dataInternal);
  }
}

class Cursor {
  // public categoryBalloonDateFormat: 'MM YYYY';
  // public categoryBalloonColor: '#4285F4';
  public categoryBalloonAlpha: 0.7;
  public cursorAlpha: 0;
  public valueLineEnabled: true;
  public valueLineBalloonEnabled: true;
  public valueLineAlpha: 0.5;
}

class GraphInfo {
  public id: string;
  public bullet = 'none';
  public useLineColorForBulletBorder = true;
  public lineColor;
  public lineThickness = 1;
  public negativeLineColor: "red";
  public type: 'smoothedLine';
  public valueField: 'value0';
  public fillAlphas = 1;
  public fillColorsField: 'lineColor';
}