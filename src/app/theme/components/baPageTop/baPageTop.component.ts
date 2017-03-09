import {Component, ViewEncapsulation} from '@angular/core';
import { Router } from '@angular/router';

import {GlobalState} from '../../../global.state';
import {UserLoginService} from '../../../services/cognito.service'
import {BaMenuService} from '../../services/baMenu/baMenu.service'

import 'style-loader!./baPageTop.scss';

@Component({
  selector: 'ba-page-top',
  templateUrl: './baPageTop.html',
})
export class BaPageTop {

  public isScrolled:boolean = false;
  public isMenuCollapsed:boolean = false;

  constructor(private _state:GlobalState,
              private users: UserLoginService,
              private router: Router,
              private menu:BaMenuService) {
    this._state.subscribe('menu.isCollapsed', (isCollapsed) => {
      this.isMenuCollapsed = isCollapsed;
    });
  }

  public toggleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
    this._state.notifyDataChanged('menu.isCollapsed', this.isMenuCollapsed);
    return false;
  }

  public scrolledChanged(isScrolled) {
    this.isScrolled = isScrolled;
  }

  public signOut(){
    this.users.logout();
    this.router.navigate(['/login']);
  }

  public profile(){
    // this will end up triggering the baMenu.service which will set the page title based on the route path
    this.router.navigate(['/pages/profile']);
  }
}
