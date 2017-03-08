import {Component, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'create-dashboard-item',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./create.scss')],
  template: require('./create.html')
})
export class CreateComponent {

  constructor() {
  }
}
