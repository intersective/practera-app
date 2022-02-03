import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { BrowserStorageService } from '@services/storage.service';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';

export interface Activity {
  id: number;
  progress?: number;
}

export interface Milestone {
  id: number;
  progress: number;
  Activity: Array<Activity>;
}

@Injectable({
  providedIn: 'root'
})
export class OverviewService {

  constructor(
    private storage: BrowserStorageService,
    private request: RequestService,
    private utils: UtilsService,
  ) { }

  public getProgress() {
    return this.request.graphQLWatch(
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
    ).pipe(map(res => {
      this._normaliseProgress(res.data);
    }));
  }

  private _normaliseProgress(data) {
    if (data) {
      (data.project.milestones || []).map(m => {
        return {
          id: m.id,
          progress: m.progress,
          Activity: (m.activities === null ? [] : m.activities).map(a => {
            return {
              id: a.id,
              progress: a.progress,
            };
          })
        };
      });
      this.storage.set('progress', data);
      this.utils.broadcastEvent('progress:update', data);
    }
  }

}
