import {Component, ViewEncapsulation} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'devices',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./devices.scss')],
  template: require('./devices.html')
})
export class Devices {

  constructor(private router: Router) {
  }

  // user wants to create a new device
  public newDevice():void{
    this.router.navigate(['/devices/create']);
  }
}
