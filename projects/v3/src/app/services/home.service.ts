import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '@v3/environments/environment';
import { DemoService } from './demo.service';
import { map, mergeMap } from 'rxjs/operators';

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
      setTimeout(() => this._milestones$.next(this.demo.milestones), 1000 * (Math.random() + 1));
    }
  }

  getProjectProgress() {
    if (environment.demo) {
      setTimeout(
        () => {
          this._projectProgress$.next(this.demo.projectProgress);
          this._experienceProgress$.next(this.demo.projectProgress.progress);
        },
        2000 * (Math.random() + 1)
      );
    }
  }


}
