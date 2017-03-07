import {Component, ViewEncapsulation} from '@angular/core';
import { Router } from '@angular/router';

import {GlobalState} from '../../../global.state';
import {UserLoginService} from '../../../services/cognito.service'

@Component({
  selector: 'ba-page-top',
  styles: [require('./baPageTop.scss')],
  template: require('./baPageTop.html'),
  encapsulation: ViewEncapsulation.None
})
export class BaPageTop {

  public isScrolled:boolean = false;
  public isMenuCollapsed:boolean = false;

  constructor(private _state:GlobalState,
              private users: UserLoginService,
              private router: Router) {
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
    this.router.navigate(['/pages/profile']);
    this._state.notifyDataChanged('menu.activeLink', {
      title: "Profile"
    });
  }
}
