import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { BrowserStorageService } from "@services/storage.service";

@Injectable({
  providedIn: 'root',
})
export class SinglePageDeactivateGuard {
  constructor(private storage: BrowserStorageService) {}

  canDeactivate() {
    if (this.storage.get('singlePageAccess')) {
      return false;
    }
    return true;
  }
}
