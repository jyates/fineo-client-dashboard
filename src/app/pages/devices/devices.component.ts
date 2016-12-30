import {Component} from '@angular/core';

@Component({
  selector: 'devices',
  styles: [require('./devices.scss')],
  template: `<router-outlet></router-outlet>`
})
export class Devices {

  constructor() {
  }
}
