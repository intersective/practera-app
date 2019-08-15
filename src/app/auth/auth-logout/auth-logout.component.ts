import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-auth-logout',
  template: '',
})
export class AuthLogoutComponent {
  routeUrl = '/logout';
  constructor(
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
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
