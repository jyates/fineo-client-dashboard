import { Component, ViewChild, Input, EventEmitter, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { BaseElemHandler, ItemConfig, Query } from '../components';
import { LineConfig } from './line.chart.component'

var nextLineId = 0;

/**
* Wrapper around a 'line-chart' that munges the incoming data into a palatable format. Its a bit clunky that we
* go to the extreme of wrapping the chart, but it is already pretty busy manage the configuration and view formatting.
* Here, we are tying into the refresh/save lifecycle, as well as the configuration changes, if any.
*/
@Component({
  selector: 'line-chart',
  templateUrl: './line.handler.html'
})
export class LineHandler extends BaseElemHandler<LineConfig> {

public static DEMO_DATA = [ [
      { date: new Date(2012, 11, 1, 1, 1, 1, 1).getTime(), value: 0 },
      { date: new Date(2013, 0, 1, 1, 1, 1, 1).getTime(), value: 15000 },
      // { date: new Date(2013, 1, 1, 1, 1, 1, 1).getTime(), value: 30000 },
      // { date: new Date(2013, 2).getTime(), value: 25000 },
      // { date: new Date(2013, 3).getTime(), value: 21000 },
      // { date: new Date(2013, 4).getTime(), value: 24000 },
      // { date: new Date(2013, 5).getTime(), value: 31000 },
      // { date: new Date(2013, 6).getTime(), value: 40000 },
      // { date: new Date(2013, 7).getTime(), value: 37000 },
      // { date: new Date(2013, 8).getTime(), value: 18000 },
      // { date: new Date(2013, 9).getTime(), value: 5000 },
      // { date: new Date(2013, 10).getTime(), value: 40000 },
      // { date: new Date(2013, 11).getTime(), value: 20000 },
      // { date: new Date(2014, 0).getTime(), value: 5000 },
      // { date: new Date(2014, 1).getTime(), value: 3000 },
      // { date: new Date(2014, 2).getTime(), value: 1800 },
      // { date: new Date(2014, 3).getTime(), value: 10400 },
      // { date: new Date(2014, 4).getTime(), value: 25500 },
      // { date: new Date(2014, 5).getTime(), value: 2100 },
      // { date: new Date(2014, 6).getTime(), value: 6500 },
      // { date: new Date(2014, 7).getTime(), value: 1100 },
      // { date: new Date(2014, 8).getTime(), value: 17200 },
      // { date: new Date(2014, 9).getTime(), value: 26900 },
      // { date: new Date(2014, 10).getTime(), value: 14100 },
      // { date: new Date(2014, 11).getTime(), value: 35300 },
      // { date: new Date(2015, 0).getTime(), value: 54800 },
      // { date: new Date(2015, 1).getTime(), value: 49800 }
    ], [
      { date: new Date(2012, 11, 1, 1, 1, 1, 1).getTime(), value: 0 },
      { date: new Date(2013, 0, 1, 1, 1, 1, 1).getTime(), value: 19000 },
      // { date: new Date(2013, 1, 1, 1, 1, 1, 1).getTime(), value: 20000 },
      // { date: new Date(2013, 2).getTime(), value: 22000 },
      // { date: new Date(2013, 3).getTime(), value: 25000 },
      // { date: new Date(2013, 4).getTime(), value: 29000 },
      // { date: new Date(2013, 5).getTime(), value: 26000 },
      // { date: new Date(2013, 6).getTime(), value: 25000 },
      // { date: new Date(2013, 7).getTime(), value: 20000 },
      // { date: new Date(2013, 8).getTime(), value: 22000 },
      // { date: new Date(2013, 9).getTime(), value: 26000 },
      // { date: new Date(2013, 10).getTime(), value: 30000 },
      // { date: new Date(2013, 11).getTime(), value: 25000 },
      // { date: new Date(2014, 0).getTime(), value: 13000 },
      // { date: new Date(2014, 1).getTime(), value: 13000 },
      // { date: new Date(2014, 2).getTime(), value: 13000 },
      // { date: new Date(2014, 3).getTime(), value: 13000 },
      // { date: new Date(2014, 4).getTime(), value: 13000 },
      // { date: new Date(2014, 5).getTime(), value: 13000 },
      // { date: new Date(2014, 6).getTime(), value: 13000 },
      // { date: new Date(2014, 7).getTime(), value: 13000 },
      // { date: new Date(2014, 8).getTime(), value: 13000 },
      // { date: new Date(2014, 9).getTime(), value: 13000 },
      // { date: new Date(2014, 10).getTime(), value: 13000 },
      // { date: new Date(2014, 11).getTime(), value: 13000 },
      // { date: new Date(2015, 0).getTime(), value: 13000 },
      // { date: new Date(2015, 1).getTime(), value: 13000 }
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
      out[i] = queryResult;
    }
    console.log("Setting line handler output:", out);
    return out;
  }
}