import {Component, ViewEncapsulation} from '@angular/core';
@Component({
  selector: 'devices',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./devices.scss')],
  template: require('./devices.html')
})
export class Devices {

  constructor() {
  }
}
