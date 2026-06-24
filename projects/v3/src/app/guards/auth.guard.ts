import { Injectable } from '@angular/core';
import {
  CanActivate, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateChild,
  NavigationExtras,
  CanMatch, Route
} from '@angular/router';
import { AuthService } from '@v3/services/auth.service';
import { environment } from '@v3/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild, CanMatch {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkLogin();
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }

  canMatch(route: Route): boolean {
    return this.checkLogin();
  }

  checkLogin(): boolean {
    if (environment.demo) {
      return true
    }
    if (this.authService.isAuthenticated()) {
      return true;
    }

    this.router.navigate(['auth', 'login']);
    return false;
  }
}
