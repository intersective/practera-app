import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@v3/services/auth.service';

@Component({
  selector: 'app-auth-logout',
  template: '',
})
export class AuthLogoutComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
console.log('asdbasdasjkdnaksjdnaksjd::', params);
      if (params && params.t) {
        return this.authService.logout(params);
      }
      return this.authService.logout();
    });
  }

}
