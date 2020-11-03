import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap, take, map } from 'rxjs/operators';

import { User, BrowserStorageService } from '@services/storage.service';
import { NativeStorageService } from '@services/native-storage.service';
import { PreferenceService, Category } from '@services/preference.service';
import { UtilsService } from '@services/utils.service';

@Injectable({
  providedIn: 'root'
})
export class PreferenceResolverService implements Resolve<{categories: Category[]}>{

  constructor(
    private storage: BrowserStorageService,
    private router: Router,
    private nativeStorage: NativeStorageService,
    private preferenceService: PreferenceService,
    private utilsService: UtilsService,
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    this.preferenceService.getPreference();
    return this.preferenceService.preference$.pipe(map(res => {
      return this.preferenceService.refresh(res);
    }));
  }
}
