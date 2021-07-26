import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { BrowserStorageService, Stack } from '@app/services/storage.service';
import { UtilsService } from '@app/services/utils.service';

@Injectable({
  providedIn: 'root'
})
export class SwitcherResolverService implements Resolve<Stack[]> {
  constructor(
    private service: AuthService,
    private storage: BrowserStorageService,
    readonly utils: UtilsService,
  ) { }

  async resolve(): Promise<Stack[]> {
    let stacks = this.storage.stacks;
    if (this.utils.isEmpty(stacks)) {
      try {
        stacks = await this.service.getStacks().toPromise();
        if (stacks && stacks.length > 0) {
          this.storage.stacks = stacks;
        }
        return stacks;
      } catch (err) {
        // @TODO: have a plan to gracefully throw this error
        console.error('Fail to retrieve stacks info', err.toString());
        throw err;
      }
    }
    return stacks;
  }
}
