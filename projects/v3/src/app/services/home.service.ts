import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '@v3/environments/environment';
import { DemoService } from './demo.service';
import { RequestService } from 'request';
import { map, mergeMap } from 'rxjs/operators';
import { ApolloService } from './apollo.service';

export interface Experience {
  image: string;
  name: string;
  description: string;
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
  experienceProgress$ = this._experienceProgress$.asObservable();

  private _activityCount$ = new BehaviorSubject<number>(null);
  activityCount$ = this._activityCount$.asObservable();

  private _milestones$ = new BehaviorSubject<Milestone[]>([]);
  milestones$ = this._milestones$.asObservable();

  private _projectProgress$ = new BehaviorSubject<ProjectProgress>(null);
  projectProgress$ = this._projectProgress$.asObservable();

  milestonesWithProgress$ = this._milestones$.asObservable().pipe(
    mergeMap(
      milestones => this._projectProgress$.asObservable().pipe(map(
        progress => {
          if (!milestones || !milestones.length) {
            return null;
          }
          // emit the milestones only if progress hasn't come back
          if (!progress || !progress.milestones) {
            return milestones;
          }
          // add the progress to the activities
          const activityProgress = [];
          progress.milestones.forEach(m => m.activities.forEach(a => activityProgress[a.id] = a.progress));
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
    )
  );

  constructor(
    private request: RequestService,
    private apolloService: ApolloService,
    private demo: DemoService
  ) { }

  getExperience() {
    if (environment.demo) {
      this._experience$.next(this.demo.experience);
      this._experienceProgress$.next(+Math.random().toFixed(2));
    }
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
    return this.apolloService.graphQLWatch(
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
    this._experienceProgress$.next(data.data.project.progress);
  }

}
