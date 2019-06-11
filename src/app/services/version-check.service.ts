import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable, interval, pipe } from 'rxjs';
import { switchMap, concatMap } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class VersionCheckService {
  private currentHash = '{{POST_BUILD_ENTERS_HASH_HERE}}';

  constructor(private requestService: RequestService, private router: Router) {}

  // check every 5 seconds
  initiateVersionCheck(frequency = 1000 * 5) {
    return this.trackVersion(frequency).subscribe((res: {hash: string; version: string;}) => {
      if (this.hasHashChanged(this.currentHash, res.hash)) {
        this.router.navigate(['logout']);
      }
    });
  }

  trackVersion(frequency): Observable<any> {
    return interval(frequency).pipe(
      switchMap(() => this.requestService.get(`${window.location.origin}/version.json?t=${new Date().getTime()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
          'Pragma': 'no-cache',
          'Expires': 0,
        }}),
      ));
  }

  private hasHashChanged(currentHash, newHash) {
    if (!currentHash || currentHash === '{{POST_BUILD_ENTERS_HASH_HERE}}') {
      return false;
    }

    return currentHash !== newHash;
  }
}
