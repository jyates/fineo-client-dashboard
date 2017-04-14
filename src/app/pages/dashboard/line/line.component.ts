import { Component, ViewChild, Input, EventEmitter, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { BaseDataItem, ItemConfig, Query } from '../components';

var nextLineId = 0;

/**
* Wrapper around a 'line-chart' that munges the incoming data into a palatable format. Its a bit clunky that we
* go to the extreme of wrapping the chart, but it is already pretty busy manage the configuration and view formatting.
* Here, we are tying into the refresh/save lifecycle, as well as the configuration changes, if any.
*/
@Component({
  selector: 'line-chart',
  styleUrls: ['./line.scss'],
  templateUrl: './line.html'
})
export class LineComponent extends BaseDataItem {

  protected updateData(results): Object {
    console.log("got a data event: ", results);
    if (!results) {
      return {};
    }
    // convert the results into 'nice' format for the component
    let out = {}
    for (var i = 0; i < results.length; i++) {
      let queryResult = results[i];
      out[i] = queryResult;
    }
    console.log("Converted to:", out);
    return out;
  }
}