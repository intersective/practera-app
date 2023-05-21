import { Injectable } from '@angular/core';
import { BehaviorSubject, from, of } from 'rxjs';
import { environment } from '@v3/environments/environment';
import { DemoService } from './demo.service';
import { map, mergeMap, shareReplay, tap } from 'rxjs/operators';
import { ApolloService } from './apollo.service';
import { NotificationsService } from './notifications.service';
import { AuthService } from './auth.service';

export interface Experience {
  leadImage: string;
  name: string;
  description: string;
  locale: string;
}

export interface Milestone {
  id: number;
  name: string;
  description: string;
  isLocked: boolean;
  activities?: {
    id: number;
    name: string;
    isLocked: boolean;
    leadImage: string;
    progress?: number;
  }[];
}

export interface ProjectProgress {
  progress: number;
  milestones: {
    id: number;
    activities?: {
      id: number;
      progress?: number;
    }[];
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private _experience$ = new BehaviorSubject<Experience>(null);
  experience$ = this._experience$.asObservable();

  private _experienceProgress$ = new BehaviorSubject<number>(null);
  experienceProgress$ = this._experienceProgress$.pipe(shareReplay(1));

  private _activityCount$ = new BehaviorSubject<number>(null);
  activityCount$ = this._activityCount$.asObservable();

  private _milestones$ = new BehaviorSubject<Milestone[]>(null);
  milestones$ = this._milestones$.asObservable();

  private _projectProgress$ = new BehaviorSubject<ProjectProgress>(null);
  projectProgress$ = this._projectProgress$.asObservable();

  milestonesWithProgress$ = this._milestones$.asObservable().pipe(
    mergeMap(
      mRes => this._projectProgress$.asObservable().pipe(map(
        progress => {
          const milestones = JSON.parse(JSON.stringify(mRes));
          if (!milestones || !milestones.length) {
            return null;
          }
          // emit the milestones only if progress hasn't come back
          if (!progress || !progress.milestones) {
            return milestones;
          }
          // add the progress to the activities
          const activityProgress = [];
          progress.milestones.forEach(m => m.activities ? m.activities.forEach(a => activityProgress[a.id] = a.progress) : null);
          milestones.forEach((milestone, mIndex) => {
            if (!milestone.activities || !milestone.activities.length) {
              return;
            }
            milestone.activities.forEach((activity, aIndex) => {
              if (activityProgress[activity.id]) {
                milestones[mIndex].activities[aIndex].progress = activityProgress[activity.id];
              }
            });
            }
          );
          return milestones;
        }
      ))
    ),
    shareReplay(1)
  );

  constructor(
    private apolloService: ApolloService,
    private demo: DemoService,
    private notificationsService: NotificationsService,
    private authService: AuthService,
  ) { }

  clearExperience() {
    return of([
      this._experience$.next(null),
      this._activityCount$.next(null),
      this._milestones$.next(null),
    ]);
  }

  getExperience() {
    if (environment.demo) {
      return this.demo.experience().pipe(map(res => this._normaliseExperience(res))).subscribe();
    }

    return this.apolloService.graphQLFetch(`
      query experience {
        experience{
          locale
          name
          description
          leadImage
        }
      }`,
    ).pipe(
      tap(async res => {
        if (res?.data?.experience === null) {
          await this.notificationsService.alert({
            header: 'Unable to access experience',
            message: 'Please re-login and try again later',
            buttons: [
              {
                text: 'OK',
                role: 'cancel',
                handler: () => {
                  this.authService.logout();
                },
              },
            ]
          })
        }
      }),
      map(res => this._normaliseExperience(res))
    ).subscribe();
  }

  private _normaliseExperience(res) {
    if (!res) {
      return null;
    }
    this._experience$.next(res.data.experience);
    return res.data.experience;
  }

  getMilestones() {
    if (environment.demo) {
      return this.demo.milestones().pipe(map(res => this._normaliseProject(res))).subscribe();
    }
    return this.apolloService.graphQLWatch(`
      {
        milestones{
          id
          name
          description
          isLocked
          activities{
            id name isLocked leadImage
          }
        }
      }`,
    ).pipe(map(res => this._normaliseProject(res))).subscribe();
  }

  private _normaliseProject(data): Array<Milestone> {
    if (!data) {
      return null;
    }
    const milestones = data.data.milestones;
    let activityCount = 0;
    milestones.forEach(m => {
      if (m.activities && m.activities.length) {
        activityCount += m.activities.length;
      }
    });
    this._activityCount$.next(activityCount);
    this._milestones$.next(milestones);
    return milestones;
  }

  getProjectProgress() {
    if (environment.demo) {
      return this.demo.projectProgress().pipe(map(res => this._handleProjectProgress(res))).subscribe();
    }
    return this.apolloService.graphQLFetch(
      `query {
          project {
            progress
            milestones{
              id
              progress
              activities{
                id progress
              }
            }
          }
        }`,
      ).pipe(map(res => this._handleProjectProgress(res))).subscribe();
  }

  private _handleProjectProgress(data) {
    if (!data) {
      return ;
    }
    this._projectProgress$.next(data.data.project);
    this._experienceProgress$.next(Math.round(data.data.project.progress * 100));
  }

}
