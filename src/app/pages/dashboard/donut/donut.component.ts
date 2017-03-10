import { Component, ElementRef, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';

import { Chart } from './donut.loader.ts';
import { BaseComponent } from './../baseComponent'

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
 *   title: <string>,
     size: <string>,
     data: [
      label: <string>,
      color: <string>
      percentage: [string|number],
      value: [string | number]
     ],
     total: {
      label: <string>,
      value: [string, number]
     }
 * }
 */
export class Donut extends BaseComponent {

  @Input()
  public id = `donut-${nextDonutId++}`;

  @Input()
  public valueType: string; // raw or percentage

  @Input()
  public centerEnabled: boolean;

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
    if (this.valueType == "percent") {
      return item['percentage'] + "%"
    }
    return item['value'];
  }

  private select() {
    return "#" + this.id + " .chart-area"
  }
}
