import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route } from '@angular/router';
import { Observable } from 'rxjs';
import { BrowserStorageService } from '@v3/services/storage.service';
import { environment } from '@v3/environments/environment';

@Injectable()
export class ProgramSelectedGuard implements CanActivate {


  constructor(
    private router: Router,
    private storage: BrowserStorageService
  ) {}

  // if user hasn't selected a program
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (environment.demo) {
      return true;
    }

    const timelineId = this.storage.getUser().timelineId;
    if (timelineId) {
      return true;
    }

    // navigate to not found page
    this.router.navigate(['experiences']);
    return false;
  }

}
