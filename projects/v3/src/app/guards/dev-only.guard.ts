import { Injectable } from '@angular/core';
import { CanMatch, Router } from '@angular/router';
import { environment } from '@v3/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DevOnlyGuard implements CanMatch {
  constructor(
    private router: Router
  ) {}

  canMatch(): boolean {
    const isLive = environment.production;
    if (isLive === true) {
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}
