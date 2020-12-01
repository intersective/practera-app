import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route } from '@angular/router';
import { Observable } from 'rxjs';
import { NativeStorageService } from '@services/native-storage.service';

@Injectable()
export class ProgramSelectedGuard implements CanActivate {


  constructor(
    private router: Router,
    private nativeStorage: NativeStorageService
  ) {}

  // if user hasn't selected a program
  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const { timelineId } = await this.nativeStorage.getObject('me');

    if (timelineId) {
      return true;
    }

    // navigate to not found page
    this.router.navigate(['switcher', 'switcher-program']);
    return false;
  }

}
