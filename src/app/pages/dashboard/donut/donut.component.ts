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
export class Donut extends BaseComponent {

  @Input()
  id = `donut-${nextId++}`;

  @Input()
  public data: Array<Object>;

  protected init() {
    this.updateData();
  }

  private updateData() {
    let el = jQuery(this.select()).get(0) as HTMLCanvasElement;
    new Chart(el.getContext('2d')).Doughnut(this.data, {
      segmentShowStroke: false,
      percentageInnerCutout : 64,
      responsive: true
    });
  }

  private select(){
    return "#"+this.id+" .chart-area"
  }
}
