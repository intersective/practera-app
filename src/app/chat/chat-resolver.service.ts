import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';

import { ChatService } from './chat.service';

@Injectable({
  providedIn: 'root',
})
export class ChatResolverService implements Resolve<any> {
  constructor(private chatService: ChatService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Observable<never> {
    console.log(route);
    return this.chatService.getchatList().pipe(
      take(1),
      mergeMap(res => {
        return of(res);
      }),
    );
  }
}
