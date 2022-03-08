import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '@v3/environments/environment';
import { DemoService } from './demo.service';

export interface Experience {
  image: string;
  name: string;
  description: string;
  progress: number;
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

  private _milestones$ = new BehaviorSubject<Milestone[]>([]);
  milestones$ = this._milestones$.asObservable();

  private _projectProgress$ = new BehaviorSubject<ProjectProgress>(null);
  projectProgress$ = this._projectProgress$.asObservable();

  constructor(
    private demo: DemoService
  ) { }

  getExperience() {
    if (environment.demo) {
      this._experience$.next(this.demo.experience);
    }
  }

  getMilestones() {
    if (environment.demo) {
      setTimeout(() => this._milestones$.next(this.demo.milestones), 1000);
    }
  }
}
