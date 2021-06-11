import { Injectable } from '@angular/core';
import { BrowserStorageService } from '@services/storage.service';

@Injectable({
  providedIn: 'root',
})
export class SinglePageDeactivateGuard {
  constructor(readonly storage: BrowserStorageService) {}

  canDeactivate() {
    if (this.storage.singlePageAccess) {
      return false;
    }
    return true;
  }
}
