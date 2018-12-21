import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';
import { Task } from '../activity/activity.service';

/**
 * @name api
 * @description list of api endpoint involved in this service
 * @type {Object}
 */
const api = {
  milestone: '/api/milestone.json',
  activity: 'api/activities.json',
  progress: 'api/v2/motivations/progress/list.json'
};

export interface Activity {
  id: number;
  name: string;
  milestoneId: number;
  isLocked: boolean;
  leadImage?: string;
  description?: string;
  tasks: Array <Task>
}

export interface Milestone {
  id: number;
  name: string;
  project_id?: number;
  description?: string;
  isLocked: boolean;
  lead_image?: string;
  progress: number;
  Activity: Array <Activity>;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  public milestone_ids = [];
  public activities ;
  
  constructor( 
    private request: RequestService,
    private utils: UtilsService,
    private storage: BrowserStorageService) { }

  getMilestones() {
    return this.request.get(api.milestone, {
      params: {}
    })
    .pipe(map(response => {
      if (response.sucess && response.date) {
        return this._normaliseMilestones(response.date);
      }
    }))
  }

  private _normaliseMilestones(data): Array<Milestone> {
    let milestones = [];
    if (!Array.isArray(data)) {
      this.request.apiResponseFormatError('Milestones array format error');
      return [];
    }
    data.forEach(eachMilestone => {
      if (!this.utils.has(eachMilestone, 'id') || 
          !this.utils.has(eachMilestone, 'name') || 
          !this.utils.has(eachMilestone, 'is_locked')) {
        return this.request.apiResponseFormatError('Milestone format error');
      }
      let milestone: Milestone = {
        id: 0,
        name: '',
        project_id: 0,
        description: '',
        isLocked: false,
        lead_image: '',
        progress: 0,
        Activity:[]
      };
      milestone.id = eachMilestone.id;
      milestone.name = eachMilestone.name;
      milestone.isLocked = eachMilestone.is_locked;
      if (this.utils.has(eachMilestone, 'description')) {
        milestone.description = eachMilestone.description;
      }
      if (this.utils.has(eachMilestone, 'lead_image')) {
        milestone.description = eachMilestone.lead_image;
      }
      if (this.utils.has(eachMilestone, 'project_id')) {
        milestone.description = eachMilestone.project_id;
      }
      milestones.push(eachMilestone);
      milestones.forEach(milestone => {
        this.milestone_ids.push(milestone.id);
      })
    })
    this.activities = this.getActivities();
    this._addActivitiesToEachMilestone(milestones,this.activities);
    return milestones;
  }

  private _addActivitiesToEachMilestone(milestones,activities) {
    let activitiesOfEachMilestone =[];
    milestones.forEach(function(eachMilestone) {
      activities.find(function (activity) {
        activitiesOfEachMilestone.push( activity.Activity.milestoneId == eachMilestone.id);
      })
      eachMilestone.Activity = activitiesOfEachMilestone;
    })
  }

  public getActivities() {
    return this.request.get(api.activity, {
      params: {
        milestone_id: JSON.stringify(this.milestone_ids),
        project_id: this.storage.getUser().projectId
      }
    })
    .pipe(map(response => {
      if (response.sucess && response.date) {
        return this._normaliseActivities(response.date);
      }
    }))
  }

  private _normaliseActivities(data: any) {
    let activities =[];
    if (!Array.isArray(data)) {
      this.request.apiResponseFormatError('Activities array format error');
      return [];
    }
    
    data.forEach(eachActivity => {
      if (!this.utils.has(eachActivity, 'Activity')) {
        return this.request.apiResponseFormatError('Activity.Activity format error');
      }
      if (this.utils.has(eachActivity, 'Activity') && eachActivity.Activity.is_locked === false ) {
        if (!this.utils.has(eachActivity, 'ActivitySequence') || !this.utils.has(eachActivity, 'References')) {
          return this.request.apiResponseFormatError('Activities format error');
        }
      }
      let activity: Activity = {
        id: 0,
        name: '',
        milestoneId: 0,
        isLocked: false,
        leadImage: '',
        description: '',
        tasks: []
      }
      let thisActivity = eachActivity.Activity;
      activity.id = thisActivity.id;
      activity.name = thisActivity.name;
      activity.isLocked = thisActivity.is_locked;

      if (this.utils.has(thisActivity, 'description')) {
        activity.description = thisActivity.description;
      }
      if (this.utils.has(thisActivity, 'lead_mage')) {
        activity.leadImage = thisActivity.lead_image;
      }
      if (!thisActivity.isLocked) {
        activity.milestoneId = thisActivity.milestone_id;
      }
      if (this.utils.has(thisActivity, 'ActivitySequence')) {
        thisActivity.ActivitySequence.forEach(task => {
          activity.tasks.push(task);
        })   
     };

      return activities.push(activity);

    })
  }     
}