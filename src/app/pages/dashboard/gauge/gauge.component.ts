import { Component, ViewEncapsulation, Input, EventEmitter, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { BaseComponent, ItemConfig } from './../baseComponent';

var nextId = 0;

/**
 * Wrapper around a GaugeUI that translates the data into the presentation layer of the GaugeUI component
 */
 @Component({
  selector: 'gauge',
  styles: [require('./gauge.scss')],
  template: require('./gauge.html'),
})
export class Gauge {

  @Input()
  public editable:boolean = true;
  @Input()
  public deletable:boolean = true;
  @Input()
  public sortable:boolean = true;
}