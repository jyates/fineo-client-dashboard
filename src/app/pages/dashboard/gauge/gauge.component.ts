import {Component, ViewEncapsulation, Input} from '@angular/core';
import './gauge.loader.ts';

@Component({
  selector: 'gauge',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./gauge.scss')],
  template: require('./gauge.html')
})
export class Gauge {

  @Input()
  public chart:Object;
}
