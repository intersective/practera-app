import { Injectable } from '@angular/core';
import { environment } from '@v3/environments/environment';
import { DemoService } from './demo.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { first, map, shareReplay, tap } from 'rxjs/operators';
import { ApolloService } from './apollo.service';
import { NotificationsService } from './notifications.service';
import { AuthService } from './auth.service';
import { BrowserStorageService } from './storage.service';
import { UtilsService } from './utils.service';

export interface Experience {
  leadImage: string;
  name: string;
  description: string;
  locale: string;
  cardUrl?: string;
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

  private _pulseCheck$ = new BehaviorSubject<number>(null);
  pulseCheck$ = this._pulseCheck$.pipe(shareReplay(1));

  private _activityCount$ = new BehaviorSubject<number>(null);
  activityCount$ = this._activityCount$.asObservable();

  private _milestones$ = new BehaviorSubject<Milestone[]>(null);
  milestones$ = this._milestones$.asObservable();

  // milestone list with "progress" injected in each of the activities
  private _projectProgress$ = new BehaviorSubject<ProjectProgress>(null);
  public projectProgress$ = this._projectProgress$.asObservable();

  constructor(
    private apolloService: ApolloService,
    private demo: DemoService,
    private notificationsService: NotificationsService,
    private authService: AuthService,
    private storageService: BrowserStorageService,
    private utilsService: UtilsService,
  ) { }

  clearExperience() {
    return of([
      this._experience$.next(null),
      this._activityCount$.next(null),
      this._milestones$.next([]),
    ]);
  }

  getExperience() {
    if (environment.demo) {
      return this.demo.experience().pipe(map(res => this._normaliseExperience(res))).subscribe();
    }

    return this.authService.authenticate().pipe(
      tap(async res => {
        if (res?.data?.auth?.experience === null) {
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
      map(res => this._normaliseExperience(res)),
      first(),
    ).subscribe({
      error: async (err) => {
        console.error('Auth:query', err);
      }
    });
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

    return this.apolloService.graphQLFetch(`
      {
        milestones {
          id
          name
          description
          isLocked
          activities{
            id name isLocked leadImage
          }
        }
      }`,
    ).pipe(
      map(res => this._normaliseProject(res)),
    ).subscribe();
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

    this.storageService.set('activities', this.aggregateActivities(milestones));

    this._activityCount$.next(activityCount);

    // only update if the milestones are different
    if (!this.utilsService.isEqual(this._milestones$.getValue(), milestones)) {
      this._milestones$.next(milestones);
    }

    return milestones;
  }

  aggregateActivities(milestones) {
    const activities = {};

    milestones?.forEach(milestone => {
      milestone.activities?.forEach(activity => {
        activities[activity.id] = activity;
      });
    });

    return activities;
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
    ).pipe(
      map(res => this._handleProjectProgress(res)),
    ).subscribe();
  }

  private _handleProjectProgress(data) {
    if (!data) {
      return ;
    }
    this._projectProgress$.next(data.data.project);
    this._experienceProgress$.next(Math.round(data.data.project.progress * 100));
  }

  getPulseCheck() {
    if (environment.demo) {
      return this.demo.pulseCheck().pipe(map(res => this._handlePulseCheck(res))).subscribe();
    }

    // we only want the "confidence" pulse check so pass the arg: question: "confidence"
    return this.apolloService.graphQLFetch(
      `query {
        pulseCheck(question: "confidence")
      }`,
    ).pipe(
      map(res => this._handlePulseCheck(res)),
    ).subscribe();
  }

  private _handlePulseCheck(data) {
    if (!data) {
      return ;
    }
    // need to transform the result (data.data): { confidence: { self: 0.5, team: 0.6, expert: 0.7 } } to:
    // { groupLabel: 'On Track', group: [{ value: 0.5, label: 'Self' }, { value: 0.6, label: 'Team' }, { value: 0.7, label: 'Expert' }] }
    const pulseCheck = data.data;
    const groupLabel = 'On Track';
    const group = Object.keys(pulseCheck).map(key => ({ value: pulseCheck[key], label: key }));
    this._pulseCheck$.next({ groupLabel, group });
  }
}
