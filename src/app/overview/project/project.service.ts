import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';

/**
 * @name api
 * @description list of api endpoint involved in this service
 * @type {Object}
 */
const api = {
};

export interface Activity {
  id: number;
  name: string;
  isLocked: boolean;
  leadImage?: string;
  progress?: number;
}

export interface Milestone {
  id: number;
  name: string;
  description?: string;
  isLocked: boolean;
  progress: number;
  Activity: Array <Activity>;
}

@Injectable({
  providedIn: 'root',
})

export class ProjectService {
  public activities: Array<Activity> = [];

  constructor(
    private request: RequestService,
    private storage: BrowserStorageService,
    private utils: UtilsService
  ) {}

  // request for the latest data, and return the previously saved data at the same time
  public getProject(): BehaviorSubject<any> {
    this._getProjectData().subscribe(res => this.utils.projectSubject.next(res));
    return this.utils.projectSubject;
  }

  // request for the latest project data
  private _getProjectData() {
    return this.request.postGraphQL(
      `"{` +
        `milestones{` +
          `id name progress description isLocked activities{` +
            `id name progress isLocked leadImage ` +
          `}` +
        `}` +
      `}"`)
      .pipe(map(res => this._normaliseProject(res.data)));
  }

  private _normaliseProject(data): Array<Milestone> {
    return (data.milestones || []).map(m => {
      return {
        id: m.id,
        name: m.name,
        description: m.description,
        progress: m.progress,
        isLocked: m.isLocked,
        Activity: (m.activities === null ? [] : m.activities).map(a => {
          return {
            id: a.id,
            name: a.name,
            progress: a.progress,
            isLocked: a.isLocked,
            leadImage: a.leadImage
          };
        })
      };
    });
  }

}
