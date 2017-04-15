import { Component, ElementRef, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';

import { Chart } from './donut.loader.ts';
import { BaseCardComponent, ItemConfig } from '../components'
import { DonutData, DonutDatum } from './donut.handler'


var nextDonutId = 0;

@Component({
  selector: 'donut',
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
export class Donut extends BaseCardComponent<DonutConfig> {

  @Input()
  public id = `donut-${nextDonutId++}`;

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

    new Chart(el.getContext('2d')).Doughnut((<DonutData>this.data).items, {
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

  public itemDisplay(item: DonutDatum): string {
    if (this.config.valueType == "percent") {
      let display = Math.round(item.percent * 100) / 100;
      // return (item.percent).toPrecision(2) + "%"
      return display + "%"
    }
    return item.value + "";
  }

  private select() {
    return "#" + this.id + " .chart-area"
  }
}

export class DonutConfig extends ItemConfig {

  constructor(title: string = "LOADING",
    query: string = "",
    size: string = "large",
    public valueType: string = "percent",
    public centerEnabled: boolean = true,
    public centerLabel: string = "Total Value",
    public colorOptions: Array<string> = []) {
    super(title, query, size);
  }
}

