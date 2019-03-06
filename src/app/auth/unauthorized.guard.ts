import { AuthService } from '../auth/auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route } from '@angular/router';
import { Observable } from 'rxjs';
import { BrowserStorageService } from '@services/storage.service';

@Injectable()
export class UnauthorizedGuard implements CanActivate {


  constructor(
    private authService: AuthService,
    private _router: Router,
    private storage: BrowserStorageService
  ) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const userIsAuthenticated = this.authService.isAuthenticated();

    if (userIsAuthenticated !== true) {
      return true;
    }

    // navigate to not found page
    this._router.navigate(['/app']);
    return false;
  }

}
