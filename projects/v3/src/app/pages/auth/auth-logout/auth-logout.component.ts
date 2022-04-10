import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '@v3/services/auth.service';

@Component({
  selector: 'app-auth-logout',
  template: '',
})
export class AuthLogoutComponent implements OnInit {
  routeUrl = '/logout';
  constructor(
    public router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {

  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params && params.t) {
        return this.authService.logout(params);
      }
      return this.authService.logout();
    });
  }

}
