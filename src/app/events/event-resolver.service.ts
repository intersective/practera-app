import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';

import { EventsService, Event } from './events.service';

@Injectable({
  providedIn: 'root',
})
export class EventResolverService implements Resolve<Event> {
  constructor(private eventService: EventsService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Event> | Observable<never> {
    const activityId = +route.paramMap.get('id');

    return this.eventService.getEvents(activityId).pipe(
      take(1),
      mergeMap(events => {
        return of(events);
      })
    );
  }
}
