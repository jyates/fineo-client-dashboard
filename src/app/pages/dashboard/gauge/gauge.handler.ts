import { Component, ViewEncapsulation, Input, EventEmitter, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { BaseElemHandler } from '../components';
import { GaugeConfig } from './gauge.component';

/**
 * Wrapper around a GaugeUI that translates the data into the presentation layer of the GaugeUI component
 */
@Component({
  selector: 'gauge',
  template: require('./gauge.handler.html'),
})
export class GaugeHandler extends BaseElemHandler<GaugeConfig> {

  public static DEMO_DATA = [{
    stats: '57,820',
    percent: 75
  }]

  protected updateData(result): Object {
    console.log("got a data event: ", result);
    if (!result) {
      return null;
    }
    let row = this.getOneRow(result);

    console.log("updating gauge data")
    // get the name of the value column
    let column = this.config.value;
    let out = {};
    if (column) {
      let value = row[column] ? row[column] : "0";
      out['stats'] = "" + value;
    }
    // and the name of the percent column
    let percent = this.config.percent;
    if (percent) {
      let pvalue = row[percent] ? row[percent] : 0;
      out['percent'] = pvalue;
    }
    return out;
  }
}