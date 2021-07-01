import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

// import {}

@Injectable({ providedIn: 'root' })
export class AuthResolver implements Resolve<any> {
  constructor(private service: AuthService) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    console.log('asdabsdasdlasdnlandljawbndljkawbnd');
    return route.paramMap.get('stack_uuid');
  }
}
