import {Component, ViewEncapsulation} from '@angular/core';
import {AwsUtil} from '../../services/aws.services'

@Component({
  selector: 'dashboard',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./dashboard.scss')],
  template: require('./dashboard.html')
})
export class Dashboard {

  constructor(){}
}
