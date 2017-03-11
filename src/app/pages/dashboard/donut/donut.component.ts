import { Component, ElementRef, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';

import { Chart } from './donut.loader.ts';
import { BaseComponent, ItemConfig } from './../baseComponent'
import { colorHelper } from '../../../theme';

var nextDonutId = 0;

@Component({
  selector: 'donut-chart',
  styleUrls: ['./donut.scss'],
  templateUrl: './donut.html'
})

// TODO: move chart.js to it's own component
/**
 * A simple 'donut' like pie chart thing.
 * Data format:
 * {
     data: [
      label: <string>,
      color: <string>
      percentage: [string|number],
      value: [string | number]
     ]
 * }
 */
export class Donut extends BaseComponent<DonutConfig> {

  @Input()
  public id = `donut-${nextDonutId++}`;

  @Input()
  public colorOptions: Object[] = [];

  private donutData: DonutData = new DonutData();

  constructor() {
    super("donut-container");
    if (this.config == null) {
      this.config = new DonutConfig();
    }
  }

  protected init() {
    this.updateData();
  }

  public updateData() {
    if (!this.data) {
      return;
    }

    this.donutData = this.asDonutData(this.data);
    if (!this.donutData.valid) {
      return;
    }

    let select = this.select();
    let selected = jQuery(select);
    if (!selected) {
      console.log("Could not select from", select);
      return;
    }
    let el = selected.get(0) as HTMLCanvasElement;
    if (!el) {
      console.log("Cannot find element", this.select());
      return;
    }

    new Chart(el.getContext('2d')).Doughnut(this.donutData.items, {
      segmentShowStroke: false,
      percentageInnerCutout: 64,
      responsive: true
    });
  }

  public getSize() {
    let elems = {};
    this.setSize("small", 4, elems);
    this.setSize("large", 6, elems);
    return elems;
  }

  public itemDisplay(item: DonutDatum):string {
    if (this.config.valueType == "percent") {
      let display = Math.round(item.percent * 100) / 100;
// return (item.percent).toPrecision(2) + "%"
      return display + "%"
    }
    return item.value+"";
  }

  private select() {
    return "#" + this.id + " .chart-area"
  }

  private asDonutData(row): DonutData {
    if (!row) {
      console.log(this.id, ": No data row. Skipping!");
      return new DonutData();
    }

    if (row instanceof Array || Array.isArray(row)) {
      if (row.length == 1) {
        row = row[0];
      } else {
        throw new TypeError("Donuts only support a single row of data! Element: " + this.id + ". Got row:\n" + row);
      }
    }

    if (Object.keys(row).length == 0) {
      console.log(this.id, ": No keys in data row. Skipping!");
      return new DonutData();
    }

    let retn = new DonutData();
    var i = 0;
    let colorLen = this.colorOptions.length;
    Object.keys(row).sort().forEach(column => {
      var index = (i++ % colorLen);
      var color = this.colorOptions[index];
      let value = row[column];
      let colorValue = color['color'];
      let data = new DonutDatum(column, value, colorValue);
      retn.add(data);
    });

    return retn.done();
  }
}

class DonutData {
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



class DonutDatum {
  constructor(public label: string,
    public value: number,
    public color: string,
    public percent: number = -1) { }
}

export class DonutConfig extends ItemConfig {

  constructor(title: string = "LOADING",
    query: string = "",
    size: string = "large",
    public valueType: string = "percent",
    public centerEnabled: boolean = true,
    public centerLabel: string = "Total Value") {
    super(title, query, size);
  }
}

