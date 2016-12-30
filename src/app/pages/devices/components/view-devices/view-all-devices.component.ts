import {Component, ViewEncapsulation} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'view-all-devices',
  encapsulation: ViewEncapsulation.None,
  template: require('./devices.html')
})
export class ViewAllDevicesComponent {

  constructor(private router: Router) {
  }

  // user wants to create a new device
  public newDevice():void{
    this.router.navigate(['/devices/create']);
  }
}
