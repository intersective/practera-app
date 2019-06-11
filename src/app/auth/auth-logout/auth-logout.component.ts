import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterEnter } from '@services/router-enter.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-auth-logout',
  template: '',
})
export class AuthLogoutComponent extends RouterEnter {
  routeUrl = '/logout';
  constructor(
    public router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    super(router);
  }

  onEnter() {
    this.route.params.subscribe(params => {
      if (params && params.t) {
        return this.authService.logout(params);
      }
      return this.authService.logout();
    });
  }

}
