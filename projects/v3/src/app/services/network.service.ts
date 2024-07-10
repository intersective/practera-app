import { Injectable } from '@angular/core';
import { RequestService } from 'request';
import { Observable, fromEvent, merge, of } from 'rxjs';
import { map, switchMap, startWith, distinctUntilChanged, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private online$: Observable<boolean>;

  constructor(private request: RequestService) {
    this.online$ = merge(
      of(navigator.onLine),
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ).pipe(
      switchMap(isOnline => {
        if (!isOnline) {
          // When offline, check server reachability
          return this.checkServerReachability().pipe(
            startWith(false)
          );
        }
        return of(isOnline);
      }),
      distinctUntilChanged() // Emit only when the online status actually changes
    );
  }

  get isOnline() {
    return this.online$;
  }

  private checkServerReachability(): Observable<boolean> {
    return this.request.get('https://practera.com', { observe: 'response' })
      .pipe(
        map(response => response.status === 200),
        catchError(() => of(false))
      );
  }
}
