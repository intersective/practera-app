import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { RouterEnter } from '@services/router-enter.service';

@Component({
  selector: 'app-auth-logout',
  template: '',
})
export class AuthLogoutComponent extends RouterEnter {
  routeUrl = '/logout';
  constructor(
    public router: Router,
    private authService: AuthService
  ) {
    super(router);
  }

  onEnter() {
    this.authService.logout();
  }

}
