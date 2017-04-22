import { Component, ViewChild, Input, EventEmitter, AfterViewInit, OnChanges, SimpleChange } from '@angular/core';
import { BaseElemHandler, ItemConfig, Query } from '../components';
import { Line, LineConfig, LineQuery, Xaxis, QueryChartConfig } from './line.component'

/**
* Wrapper around a 'line-chart' that munges the incoming data into a palatable format. Its a bit clunky that we
* go to the extreme of wrapping the chart, but it is already pretty busy manage the configuration and view formatting.
* Here, we tie into the refresh/save lifecycle, as well as the configuration changes, if any.
*/
@Component({
  selector: 'line-chart',
  template: `
<line-chart-component
  [data]="dataOut"
  [config]="configOut"
  [card]="card"
  (deleteEvent)="handleDelete($event)"
  (editEvent)="handleEdit($event)"
>
</line-chart-component>
  `
})
export class LineHandler extends BaseElemHandler<LineConfig> {

  public static DEMO_DATA = [[
    { timestamp: new Date(2012, 11, 1, 1, 1, 1, 1).getTime(), value: 0 },
    { timestamp: new Date(2013, 0, 1, 1, 1, 1, 1).getTime(), value: 15000 },
    { timestamp: new Date(2013, 1, 1, 1, 1, 1, 1).getTime(), value: 30000 },
    { timestamp: new Date(2013, 2).getTime(), value: 25000 },
    { timestamp: new Date(2013, 3).getTime(), value: 21000 },
    { timestamp: new Date(2013, 4).getTime(), value: 24000 },
    { timestamp: new Date(2013, 5).getTime(), value: 31000 },
    { timestamp: new Date(2013, 6).getTime(), value: 40000 },
    { timestamp: new Date(2013, 7).getTime(), value: 37000 },
    { timestamp: new Date(2013, 8).getTime(), value: 18000 },
    { timestamp: new Date(2013, 9).getTime(), value: 5000 },
    { timestamp: new Date(2013, 10).getTime(), value: 40000 },
    { timestamp: new Date(2013, 11).getTime(), value: 20000 }
  ], [
    { timestamp: new Date(2012, 11, 1, 1, 1, 1, 1).getTime(), value: 0 },
    { timestamp: new Date(2013, 0, 1, 1, 1, 1, 1).getTime(), value: 19000 },
    { timestamp: new Date(2013, 1, 1, 1, 1, 1, 1).getTime(), value: 20000 },
    { timestamp: new Date(2013, 2).getTime(), value: 22000 },
    { timestamp: new Date(2013, 3).getTime(), value: 25000 },
    { timestamp: new Date(2013, 4).getTime(), value: 29000 },
    { timestamp: new Date(2013, 5).getTime(), value: 26000 },
    { timestamp: new Date(2013, 6).getTime(), value: 25000 },
    { timestamp: new Date(2013, 7).getTime(), value: 20000 },
    { timestamp: new Date(2013, 8).getTime(), value: 22000 },
    { timestamp: new Date(2013, 9).getTime(), value: 26000 },
    { timestamp: new Date(2013, 10).getTime(), value: 30000 },
    { timestamp: new Date(2013, 11).getTime(), value: 25000 }
  ]
  ];

  @ViewChild(Line) public chart: Line;

  public configOut: LineConfig;

  protected updateData(results): Object {
    if (!results) {
      return {};
    }
    // convert the results into 'nice' format for the component
    let out = {}
    for (var i = 0; i < results.length; i++) {
      let queryResult = results[i];
      out["g" + i.toString()] = queryResult;
    }
    console.log("Setting line handler output:", out);
    return out;
  }

  public hintConfig(){
    this.chart.hintConfig();
  }

  public updateConfig(changes:SimpleChange) {
    if(!changes.currentValue){
      return;
    }
    let config = changes.currentValue;
    let previous = changes.previousValue;
    if (config instanceof LineConfig) {
      this.configOut = config;
      return;
    }
    // if we are in the standard dashboard, we get passed a standard Object, which we need to turn into a LineConfig,
    // because line configs have functions that we need to leverage... or maybe we get rid of the line config functions
    // in the gauge handler and do it in another object. But its done now and I have other things to do #startup
    this.configOut = LineHandler.asLineConfig(config);
  }

  public static asLineConfig(config:any):LineConfig{
    // translate the given config into a proper line config
    let queries: Array<LineQuery> = [];
    if (config.queries) {
      for (var i = 0; i < config.queries.length; i++) {
        var q = config.queries[i];
        var qc = q['chart'];
        var chart = new QueryChartConfig(qc.queryId, qc.xfield, qc.yfield);
        queries.push(new LineQuery(q.text, q.name, q.color, chart));
      }
    }
    let x = config.xAxis;
    let xaxis = new Xaxis(x.name, x.parseDates, x.color, x.axisColor, x.minPeriod);
    return new LineConfig(config.title, config.size, queries, xaxis, config.type);
  }
}