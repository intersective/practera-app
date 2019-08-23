import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { SwitcherService } from '../switcher/switcher.service';

@Injectable({
  providedIn: 'root',
})
export class AuthResolverService implements Resolve<any> {
  constructor(private authService: AuthService, private swticherService: SwitcherService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Observable<never> {
    return this.swticherService.getMyInfo().pipe(
      take(1),
      mergeMap(res => {
        return of(res);
      }),
    );
  }
}
