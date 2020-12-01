import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';

import { User, BrowserStorageService } from '@services/storage.service';
import { NativeStorageService } from '@services/native-storage.service';

@Injectable({
  providedIn: 'root',
})
export class UserResolverService implements Resolve<User> {
  constructor(
    private storage: BrowserStorageService,
    private router: Router,
    private nativeStorage: NativeStorageService
  ) {}

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<any> {
    return await this.nativeStorage.getObject('me');
  }
}
