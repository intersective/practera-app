import { Injectable } from '@angular/core';
import { CanLoad, Router } from '@angular/router';
import { environment } from '@v3/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DevOnlyGuard implements CanLoad {
  constructor(
    private router: Router
  ) {}

  canLoad(): boolean {
    const isLive = environment.production as any;
    if (isLive === true) {
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}
