import {Component, ViewEncapsulation} from '@angular/core';
import {AwsUtil} from '../../services/aws.services'

@Component({
  selector: 'dashboard-outlet',
  template: `<router-outlet></router-outlet>`
})
export class DashboardOutlet {

  constructor(){}
}
