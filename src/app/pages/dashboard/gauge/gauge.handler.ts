import { Component, ViewEncapsulation, Input, EventEmitter, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { BaseElemHandler } from '../components';
import { GaugeConfig } from './gauge.component';

/**
 * Wrapper around a GaugeUI that translates the data into the presentation layer of the GaugeUI component
 */
@Component({
  selector: 'gauge-chart',
  template: `
  <gauge
  [data]="dataOut"
  [config]="config"
  [card]="card"
  (deleteEvent)="handleDelete($event)"
  (editEvent)="handleEdit($event)"
>
</gauge>
`
})
export class GaugeHandler extends BaseElemHandler<GaugeConfig> {

  public static DEMO_DATA = [{
    stats: '57,820',
    percent: 75
  }]

  protected updateData(result): Object {
    if (!result) {
      return null;
    }
    let row = this.getOneRow(result);

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