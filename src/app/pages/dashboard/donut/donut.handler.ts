import { Component, ViewEncapsulation, Input, EventEmitter, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { BaseElemHandler } from '../components';
import { DonutConfig } from './donut.component';

/**
 * Wrapper around a GaugeUI that translates the data into the presentation layer of the GaugeUI component
 */
@Component({
  selector: 'donut-chart',
  template: require('./donut.handler.html'),
})
export class DonutHandler extends BaseElemHandler<DonutConfig> {

  public static DEMO_DATA = {
    column1: 10,
    column2: 20,
    column3: 75,
    column4: 35,
    column5: 122
  }

  protected updateData(row): DonutData {
    debugger;
    if (!row) {
      console.log("No data row. Skipping!");
      return new DonutData();
    }

    row = this.getOneRow(row);
    if (Object.keys(row).length == 0) {
      console.log("No keys in data row. Skipping!");
      return new DonutData();
    }

    let retn = new DonutData();
    var i = 0;
    let colorLen = this.config.colorOptions.length;
    Object.keys(row).sort().forEach(column => {
      var index = (i++ % colorLen);
      var color = this.config.colorOptions[index];
      let value = row[column];
      let colorValue = color['color'];
      let data = new DonutDatum(column, value, colorValue);
      retn.add(data);
    });

    return retn.done();
  }
}

export class DonutData {
  public valid: boolean = false;
  public items: DonutDatum[] = [];
  public total: number = 0;

  public add(item: DonutDatum): void {
    this.total += item.value;
    this.items.push(item);
  }

  /*
   * Calculate the percent each item holds against the total and mark
   * this as 'valid' (e.g. displayable)
   */
  public done(): DonutData {
    this.items.forEach(data => {
      data.percent = (data.value * 100) / this.total;
    });

    this.valid = true;
    return this;
  }
}

export class DonutDatum {
  constructor(public label: string,
    public value: number,
    public color: string,
    public percent: number = -1) { }
}