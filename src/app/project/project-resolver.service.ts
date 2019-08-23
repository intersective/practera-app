import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';

import { ProjectService } from './project.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectResolverService implements Resolve<any> {
  constructor(private projectService: ProjectService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Observable<never> {
    return this.projectService.getMilestones().pipe(
      take(1),
      mergeMap(res => {
        return of(res);
      }),
    );
  }
}
