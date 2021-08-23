import { AuthService } from '../auth/auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route } from '@angular/router';
import { Observable } from 'rxjs';
import { UtilsService } from '@services/utils.service';
import { environment } from '@environments/environment';
import { BrowserStorageService } from '@services/storage.service';

@Injectable()
export class UnauthorizedGuard implements CanActivate {


  constructor(
    private authService: AuthService,
    private router: Router,
    private utils: UtilsService,
    public storage: BrowserStorageService
  ) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const userIsAuthenticated = this.authService.isAuthenticated();
    if (userIsAuthenticated !== true) {
      const fromGlobalLogin = this.storage.get('fromGlobalLogin');
      // redirect user to global login if user came from it.
      if (fromGlobalLogin) {
        this.utils.openUrl(`${ environment.globalLoginUrl }?referrer=${ window.location.hostname }&stackUuid=${ environment.stackUuid }`);
        return false;
      }
      return true;
    }

    // navigate to not found page
    this.router.navigate(['/app']);
    return false;
  }

}
