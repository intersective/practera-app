import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { BrowserStorageService, Stack } from '@app/services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class SwitcherResolverService implements Resolve<Stack[]> {
  constructor(
    private service: AuthService,
    private storage: BrowserStorageService,
  ) { }

  async resolve(): Promise<Stack[]> {
    let stacks = this.storage.stacks;
    if (stacks && stacks.length === 0) {
      try {
        stacks = await this.service.getStacks().toPromise();
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
