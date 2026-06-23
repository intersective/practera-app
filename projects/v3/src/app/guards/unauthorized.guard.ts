import { AuthService } from '@v3/services/auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route } from '@angular/router';
import { Observable } from 'rxjs';
import { UtilsService } from '@v3/services/utils.service';
import { environment } from '@v3/environments/environment';
import { BrowserStorageService } from '@v3/services/storage.service';

@Injectable()
export class UnauthorizedGuard implements CanActivate {


  constructor(
    private authService: AuthService,
    private router: Router,
    private utils: UtilsService,
    private storage: BrowserStorageService,
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
      const stackUuid = this.storage.get('stackUuid') || environment.stackUuid;
      // redirect to global login
      this.utils.openUrl(`${ environment.globalLoginUrl }?referrer=${ window.location.hostname }&stackUuid=${ stackUuid }`);
      return false;
    }

    // navigate to not found page
    this.router.navigate(['/v3']);
    return false;
  }

}
