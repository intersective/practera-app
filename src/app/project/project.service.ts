import { Injectable } from '@angular/core';
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
  progress: 'api/v2/motivations/progress/list.json'
};


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
    private utils: UtilsService) { }
  
  public getMilestones() {
    return this.request.get(api.milestone)
    .pipe(map(response => {
      if (response.success && response.data) {
        return this._normaliseMilestones(response.data);
      }
    }));
  }
  
  private _normaliseMilestones(data){
    if (!Array.isArray(data)) {
      this.request.apiResponseFormatError('Milestones array format error');
      return [];
    }
    let milestones = [];
    data.forEach(eachMilestone => {
      if (!this.utils.has(eachMilestone, 'id') || 
          !this.utils.has(eachMilestone, 'name') || 
          !this.utils.has(eachMilestone, 'is_locked')) {
        return this.request.apiResponseFormatError('Milestone format error');
      }
      let milestone: Milestone = {
        id: 0,
        name: '',
        description: '',
        isLocked: false,
        progress: 0,
        Activity:[]
      };
      milestone.id = eachMilestone.id;
      milestone.name = eachMilestone.name;
      milestone.isLocked = eachMilestone.is_locked;
      if (this.utils.has(eachMilestone, 'description')) {
        milestone.description = eachMilestone.description;
      };
      
      milestones.push(milestone);
    });
  return milestones;
  }

  public getMilestoneIds(milestones) {
    let milestoneIds = [];
    milestones.forEach(milestone => { 
      if (!milestone.isLocked) {
        milestoneIds.push(milestone.id);
      }
   })
    return  milestoneIds; 
  }
  public addActivitiesToEachMilestone(milestones,activities) {
    
    activities.forEach(function (activity) {
      var findMilestone = milestones.find(function (milestonWithThisId) {
        return milestonWithThisId.id === activity.milestoneId
      })
      findMilestone.Activity.push(activity);
    });
    return milestones;
  }
  
  public getActivities(id) {
    return this.request.get(api.activity, {
      params: {
        milestone_id: JSON.stringify(id)
      }
    })
    .pipe(map(response => {
      if (response.success && response.data) {
        return this._normaliseActivities(response.data);
      }
    }));
  }

  private _normaliseActivities(data: any) {
    
    let activities: Array<Activity> = [];
    if (!Array.isArray(data)) {
      this.request.apiResponseFormatError('Activities array format error');
      return [];
    }
    
    data.forEach(eachActivity => {
      if (!this.utils.has(eachActivity, 'Activity')) {
        return this.request.apiResponseFormatError('Activity.Activity format error');
      }
      if (this.utils.has(eachActivity, 'Activity') && eachActivity.Activity.is_locked === false ) {
        if (!this.utils.has(eachActivity, 'ActivitySequence')) {
          return this.request.apiResponseFormatError('ActivitySequence format error');
        }
      }
      let activity: Activity = {
        id: 0,
        name: '',
        milestoneId: 0,
        isLocked: false,
        leadImage: '',
        progress: 0,
      }
      let thisActivity = eachActivity.Activity;

      activity.id = thisActivity.id;
      activity.name = thisActivity.name;
      activity.isLocked = thisActivity.is_locked;

      if (this.utils.has(thisActivity, 'lead_mage')) {
        activity.leadImage = thisActivity.lead_image;
      }
      if (!thisActivity.isLocked) {
        activity.milestoneId = thisActivity.milestone_id;
      }
       activities.push(activity);
    })
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
        return this._normaliseProgress(response.data,milestones);
      }
    }));
  }

  private _normaliseProgress(data: any, milestones) {
    
    if (!this.utils.has(data, 'Project.Milestone')) {
      this.request.apiResponseFormatError('Progress format error');
      return 0;
    }

    this._milestoneProgress(data.Project,milestones);
  }

  private _milestoneProgress(progress,milestones) {
    
    progress.Milestone.forEach(function(eachMilestone){ 
      let findMilestone = milestones.find(function (milestone) {
       return milestone.id === eachMilestone.id
      });

    findMilestone.progress = eachMilestone.progress;
    findMilestone.Activity.forEach(function(activity){
      var findActivityWithThisId = eachMilestone.Activity.find(function(item) {
        return item.id === activity.id;
      })
      activity.progress = findActivityWithThisId.progress;
      });
    })
  }
}