import { AuthService } from '@v3/services/auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route } from '@angular/router';
import { Observable } from 'rxjs';
import { UtilsService } from '@v3/services/utils.service';
import { environment } from '@v3/environments/environment';

/** True while Authorization Code + PKCE is starting or returning to this app. */
function oauthHandoffInProgress(): boolean {
  const params = new URLSearchParams(window.location.search);
  if (params.get('oauth') === '1' && params.has('stack_uuid')) return true;
  if (params.has('code') && params.has('state')) return true;
  try {
    return Boolean(sessionStorage.getItem('oauth_pkce'));
  } catch {
    return false;
  }
}

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
      // Stack handoff (?oauth=1, or the ?code=&state= callback) is still in
      // progress. Sending the browser to global login here abandons it.
      if (oauthHandoffInProgress()) {
        return false;
      }
      // redirect to global login
      this.utils.openUrl(`${ environment.globalLoginUrl }?referrer=${ window.location.hostname }&stackUuid=${ environment.stackUuid }`);
      return false;
    }

    // Redirect authenticated users to the experience picker
    this.router.navigate(['/experiences']);
    return false;
  }

}
