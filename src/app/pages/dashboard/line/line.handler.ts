import { Component, ViewChild, Input, EventEmitter, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { BaseElemHandler, ItemConfig, Query } from '../components';
import { LineConfig } from './line.component'

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
  [config]="config"
  [card]="card"
  (deleteEvent)="handleDelete($event)"
  (editEvent)="handleEdit($event)"
>
</line-chart-component>
  `
})
export class LineHandler extends BaseElemHandler<LineConfig> {

public static DEMO_DATA = [ [
      { date: new Date(2012, 11, 1, 1, 1, 1, 1).getTime(), value: 0 },
      { date: new Date(2013, 0, 1, 1, 1, 1, 1).getTime(), value: 15000 },
      { date: new Date(2013, 1, 1, 1, 1, 1, 1).getTime(), value: 30000 },
      { date: new Date(2013, 2).getTime(), value: 25000 },
      { date: new Date(2013, 3).getTime(), value: 21000 },
      { date: new Date(2013, 4).getTime(), value: 24000 },
      { date: new Date(2013, 5).getTime(), value: 31000 },
      { date: new Date(2013, 6).getTime(), value: 40000 },
      { date: new Date(2013, 7).getTime(), value: 37000 },
      { date: new Date(2013, 8).getTime(), value: 18000 },
      { date: new Date(2013, 9).getTime(), value: 5000 },
      { date: new Date(2013, 10).getTime(), value: 40000 },
      { date: new Date(2013, 11).getTime(), value: 20000 }
    ], [
      { date: new Date(2012, 11, 1, 1, 1, 1, 1).getTime(), value: 0 },
      { date: new Date(2013, 0, 1, 1, 1, 1, 1).getTime(), value: 19000 },
      { date: new Date(2013, 1, 1, 1, 1, 1, 1).getTime(), value: 20000 },
      { date: new Date(2013, 2).getTime(), value: 22000 },
      { date: new Date(2013, 3).getTime(), value: 25000 },
      { date: new Date(2013, 4).getTime(), value: 29000 },
      { date: new Date(2013, 5).getTime(), value: 26000 },
      { date: new Date(2013, 6).getTime(), value: 25000 },
      { date: new Date(2013, 7).getTime(), value: 20000 },
      { date: new Date(2013, 8).getTime(), value: 22000 },
      { date: new Date(2013, 9).getTime(), value: 26000 },
      { date: new Date(2013, 10).getTime(), value: 30000 },
      { date: new Date(2013, 11).getTime(), value: 25000 }
    ]
  ];

  protected updateData(results): Object {
    if (!results) {
      return {};
    }
    // convert the results into 'nice' format for the component
    let out = {}
    for (var i = 0; i < results.length; i++) {
      let queryResult = results[i];
      out["g"+i.toString()] = queryResult;
    }
    console.log("Setting line handler output:", out);
    return out;
  }
}