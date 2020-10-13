import { Injectable } from '@angular/core';
import {
  CanActivate, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateChild,
  NavigationExtras,
  CanLoad, Route
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return this.checkLogin();
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return this.canActivate(route, state);
  }

  canLoad(route: Route): Promise<boolean> {
    return this.checkLogin();
  }

  async checkLogin(): Promise<boolean> {
    const loggedIn = await this.authService.isAuthenticated();
    console.log('checking login::', loggedIn);
    if (loggedIn) {
      console.log('loggedin?', loggedIn);
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
