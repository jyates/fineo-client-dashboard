import { Component, ViewEncapsulation, ElementRef, Input, AfterViewInit, OnChanges,  SimpleChanges} from '@angular/core';

import { Chart } from './donut.loader.ts';
import {BaseComponent} from './../baseComponent'

var nextId = 0;

@Component({
  selector: 'donut-chart',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./donut.scss')],
  template: require('./donut.html')
})

// TODO: move chart.js to it's own component
/**
 * A simple 'donut' like pie chart thing.
 * Data format:
 * {
 *   data: [
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
  id = `donut-${nextId++}`;

  @Input()
  public valueType:string; // raw or percentage

  @Input()
  public centerEnabled:boolean;

  @Input()
  public data: Array<Object>;

  protected init() {
    this.updateData();
  }

  public updateData() {
    let el = jQuery(this.select()).get(0) as HTMLCanvasElement;
    new Chart(el.getContext('2d')).Doughnut(this.data, {
      segmentShowStroke: false,
      percentageInnerCutout : 64,
      responsive: true
    });
  }

  public itemDisplay(item){
    if (valueType == "percent" ){
      return item['percentage']+"%"
    }
    return item['value'];
  }

  private getSuffix(){
    return ? :"%": ""
  }

  private select(){
    return "#"+this.id+" .chart-area"
  }
}
