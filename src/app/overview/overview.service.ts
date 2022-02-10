import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
    private readonly storage: BrowserStorageService,
    private readonly request: RequestService,
    private readonly utils: UtilsService,
  ) { }

  getProgress(): Observable<any> {
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
    ).pipe(map(res => this._normaliseProgress(res.data)));
  }

  private _normaliseProgress(data): Array<Milestone> {
    if (data) {
      this.storage.set('progress', data);
      this.utils.broadcastEvent('progress:update', data);
      return data;
    }
    return null;
  }

}
