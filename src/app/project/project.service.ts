import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
  milestone: 'api/milestone.json',
  activity: 'api/activities.json',
  progress: 'api/v2/motivations/progress/list.json',
  overview: '/api/v2/plans/project/overview.json'
};

// added for displaying empty placeholder (enhance UX)
export interface DummyMilestone {
  dummy?: boolean;
  Activity?: Array<DummyActivity>;
}

export interface DummyActivity {
  dummy?: boolean;
}

export interface Activity {
  id: number;
  name: string;
  milestoneId?: number;
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
  Activity: Array <Activity | DummyActivity>;
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
  ) { }

  public getMilestones() {
    return this.request.get(api.milestone)
      .pipe(map(response => {
        if (response.success && response.data) {
          return this._normaliseMilestones(response.data);
        }
      }));
  }

  private _normaliseMilestones(data): Array<Milestone | DummyMilestone> {
    if (!Array.isArray(data)) {
      this.request.apiResponseFormatError('Milestones array format error');
      return [{ dummy: true }];
    }
    const milestones = [];
    data.forEach(eachMilestone => {
      if (!this.utils.has(eachMilestone, 'id') ||
          !this.utils.has(eachMilestone, 'name') ||
          !this.utils.has(eachMilestone, 'is_locked')) {
        return this.request.apiResponseFormatError('Milestone format error');
      }
      milestones.push({
        id: eachMilestone.id,
        name: eachMilestone.name,
        description: this.utils.has(eachMilestone, 'description') ? eachMilestone.description : '',
        isLocked: eachMilestone.is_locked,
        progress: 0,
        Activity: [{ dummy: true }]
      });
    });
    return milestones;
  }

  public getActivities(milestones) {
    const milestoneIds = this._getMilestoneIds(milestones);
    return this.request.get(api.activity, {
      params: {
        milestone_id: JSON.stringify(milestoneIds)
      }
    })
    .pipe(map(response => {
      if (response.success && response.data) {
        return this._normaliseActivities(response.data);
      }
    }));
  }

  private _getMilestoneIds(milestones) {
    return milestones
      .map(milestone => {
        if (milestone.isLocked) {
          return 0;
        }
        return milestone.id;
      })
      .filter(id => {
        return id > 0;
      });
  }

  private _normaliseActivities(data: any) {
    const activities: Array<Activity> = [];
    if (!Array.isArray(data)) {
      this.request.apiResponseFormatError('Activities array format error');
      return [];
    }

    data.forEach(eachActivity => {
      if (!this.utils.has(eachActivity, 'Activity.id') ||
          !this.utils.has(eachActivity, 'Activity.name') ||
          !this.utils.has(eachActivity, 'Activity.is_locked')) {
        this.request.apiResponseFormatError('Activity.Activity format error');
        return ;
      }
      const activity = eachActivity.Activity;
      activities.push({
        id: activity.id,
        name: activity.name,
        milestoneId: activity.milestone_id,
        isLocked: activity.is_locked,
        leadImage: this.utils.has(activity, 'lead_image') ? activity.lead_image : '',
        progress: 0,
      });
    });
    return activities;
  }

  public getProgress(milestones) {
    return this.request.get(api.progress, {
      params: {
        model: 'Project',
        model_id: this.storage.getUser().projectId,
        scope: 'Activity'
      }
    })
    .pipe(map(response => {
      if (response.success && response.data) {
        return this._normaliseProgress(response.data, milestones);
      }
    }));
  }

  // get overview of statuses for the entire project
  public getOverview(): Observable<any> {
    const { projectId } = this.storage.getUser();

    return this.request.get(api.overview, {
      params: { id: projectId }
    });
  }

  private _normaliseProgress(data: any, milestones) {
    if (!this.utils.has(data, 'Project.Milestone')) {
      this.request.apiResponseFormatError('Progress format error');
      return {};
    }
    return data.Project;
  }

}
