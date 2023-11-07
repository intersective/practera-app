import { AuthService } from '@v3/services/auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route } from '@angular/router';
import { Observable } from 'rxjs';
import { UtilsService } from '@v3/services/utils.service';
import { environment } from '@v3/environments/environment';

@Injectable()
export class UnauthorizedGuard implements CanActivate {


  constructor(
    private authService: AuthService,
    private router: Router,
    private utils: UtilsService
  ) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (environment.demo) {
      return true
    }
    const userIsAuthenticated = this.authService.isAuthenticated();
    if (userIsAuthenticated !== true) {
      // skip global login on registration page
      if (state.url.includes('registration')) {
        return true;
      }
      // redirect to global login
      this.utils.openUrl(`${ environment.globalLoginUrl }?referrer=${ window.location.hostname }&stackUuid=${ environment.stackUuid }`);
      return false;
    }

    // navigate to not found page
    this.router.navigate(['/v3']);
    return false;
  }

}
