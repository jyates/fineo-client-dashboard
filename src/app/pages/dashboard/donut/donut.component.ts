import { Component, ElementRef, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';

import { Chart } from './donut.loader.ts';
import { BaseComponent, ItemConfig } from './../baseComponent'

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

  private total: number = -1;

  constructor() {
    super("donut-container");
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
    console.log("Updating ")
    new Chart(el.getContext('2d')).Doughnut(this.data, {
      segmentShowStroke: false,
      percentageInnerCutout: 64,
      responsive: true
    });
  }

  public getSize() {
    let elems = {};
    this.setSize("small", 3, elems);
    this.setSize("large", 6, elems);
    return elems;
  }

  public itemDisplay(item) {
    if (this.config.valueType == "percent") {
      return item['percentage'] + "%"
    }
    return item['value'];
  }

  private select() {
    return "#" + this.id + " .chart-area"
  }
}

export class DonutConfig extends ItemConfig {

  constructor(title:string,
              query:string,
              size:string,
              public valueType:string,
              public centerEnabled:boolean,
              public centerLabel:string){
    super(title, query, size);
  }
}

