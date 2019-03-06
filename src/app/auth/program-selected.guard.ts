import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route } from '@angular/router';
import { Observable } from 'rxjs';
import { BrowserStorageService } from '@services/storage.service';

@Injectable()
export class ProgramSelectedGuard implements CanActivate {


  constructor(
    private _router: Router,
    private storage: BrowserStorageService
  ) {}

  // if user hasn't selected a program
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const storage = this.storage.getUser().timelineId;

    if (storage) {
      return true;
    }

    // navigate to not found page
    this._router.navigate(['/switcher']);
    return false;
  }

}
