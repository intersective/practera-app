import { Injectable } from '@angular/core';
import { BrowserStorageService } from '@v3/services/storage.service';

@Injectable({
  providedIn: 'root',
})
export class SinglePageDeactivateGuard {
  constructor(readonly storage: BrowserStorageService) {}

  canDeactivate() {
    if (this.storage.singlePageAccess === true) {
      return false;
    }

    return true;
  }
}
