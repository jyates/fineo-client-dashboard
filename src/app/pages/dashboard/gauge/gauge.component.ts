import { Component, ViewEncapsulation, Input, EventEmitter, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { BaseElemHandler } from '../components';
import { GaugeConfig } from './gauge.ui.component';

/**
 * Wrapper around a GaugeUI that translates the data into the presentation layer of the GaugeUI component
 */
@Component({
  selector: 'gauge',
  template: require('./gauge.html'),
})
export class Gauge extends BaseElemHandler<GaugeConfig> {

  protected updateData(result): Object {
    console.log("got a data event: ", result);
    let row = result ? result[0] : null;
    if (!row) {
      return null;
    }

    console.log("updating gauge")
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