import { Inject, Injectable, InjectionToken, NgZone } from '@angular/core';
import { Observable, interval, pipe } from 'rxjs';
import { switchMap, concatMap, tap, retryWhen, take, delay } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class VersionCheckService {
  private currentHash = '{{POST_BUILD_ENTERS_HASH_HERE}}';

  constructor(
    private requestService: RequestService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  // check every 3 minutes
  initiateVersionCheck(frequency = 1000 * 60 * 3) {
    // make the interval run outside of angular so that we can benifit from the automation test
    return this.ngZone.runOutsideAngular(() => {
      this.trackVersion(frequency).subscribe(
        (res: { hash: string; version: string; }) => {
          if (this.hasHashChanged(this.currentHash, res.hash)) {
            this.router.navigate(['logout', { t: new Date().getTime() }]);
          }
        },
        (err) => console.log
      );
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
      ),
      retryWhen(errors => {
        // retry for 5 times if anything go wrong
        return errors.pipe(delay(1000), take(5));
      })
    );
  }

  private hasHashChanged(currentHash, newHash) {
    if (!currentHash || currentHash === '{{POST_BUILD_ENTERS_HASH_HERE}}') {
      return false;
    }

    return currentHash !== newHash;
  }
}
