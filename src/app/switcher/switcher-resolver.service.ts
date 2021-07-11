import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { BrowserStorageService, Stack } from '@app/services/storage.service';
import { Observable } from 'rxjs';
import { UtilsService } from '@app/services/utils.service';

@Injectable({
  providedIn: 'root'
})
export class SwitcherResolverService implements Resolve<any> {
  constructor(
    private service: AuthService,
    private storage: BrowserStorageService,
    readonly utils: UtilsService,
  ) { }

  async resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<Stack> {
    if (!this.storage.stackConfig) {
      const queryParams = this.utils.getQueryParams();
      if (queryParams.has('stack_uuid')) {
        try {
          const res = await this.service.getStackConfig(queryParams.get('stack_uuid')).toPromise();
          this.storage.stackConfig = res;
          return res;
        } catch (err) {
          console.error('Unable to retrieve stack info', err.toString());
          return;
        }
      }
    }
    return this.storage.stackConfig;
  }
}
