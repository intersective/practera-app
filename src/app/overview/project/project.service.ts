import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';
import { RequestService } from '@shared/request/request.service';

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
    private storage: BrowserStorageService,
    private utils: UtilsService,
    private request: RequestService
  ) { }

  public getProject(): Observable<any> {
    return this.request.graphQLQuery(`
      {
        milestones{
          id
          name
          progress
          description
          isLocked
          activities{
            id name progress isLocked leadImage
          }
        }
      }`,
    ).pipe(map(res => this._normaliseProject(res.data)));
  }

  private _normaliseProject(data): Array<Milestone> {
    if (!data) {
      return null;
    }
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
