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
  progress: number;
  tasks?: Array <Task>
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
  public Milestones = [];
  public milestone_ids = [];
  public milestones = [];
  
  constructor( 
    private request: RequestService,
    private utils: UtilsService,
    private storage: BrowserStorageService) { }

  public getMilestones() {
    return this.request.get(api.milestone, {
      params: {}
    })
    .pipe(map(response => {
      if (response.success && response.data) {
        return this._normaliseMilestones(response.data);
      }
    }))
  }

  private _normaliseMilestones(data){
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
      }
      
      this.getActivities(eachMilestone.id).subscribe(activities => {
        milestone.Activity = activities;
        this.milestones.push(milestone);
      });
      
      console.log('milestones is:',this.milestones);
      //this._addActivitiesToEachMilestone(eachMilestone, activities); 
  })
  this.milestones.forEach(milestone => {
    this.milestone_ids.push(milestone.id);
    
  })
  console.log('milestoneIds is:',this.milestone_ids);
   
  this.milestone_ids.forEach(this.getProgress, this);
    return this.Milestones = this.milestones;
  }

  // private _addActivitiesToEachMilestone(milestones,activities) {
  //   let activitiesOfEachMilestone =[];
  //   milestones.forEach(function(eachMilestone) {
  //     activities.find(function (activity) {
  //       activitiesOfEachMilestone.push( activity.milestoneId == eachMilestone.id);
  //     })
  //     eachMilestone.Activity = activitiesOfEachMilestone;
  //   })
  // }


  public getActivities(id) {
    return this.request.get(api.activity, {
      params: {
        milestone_id: id,
      }
    })
    .pipe(map(response => {
      if (response.success && response.data) {
        return this._normaliseActivities(response.data);
      }
    }))
  }

  private _normaliseActivities(data: any) {
    let activities :Array <Activity> ;
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
        tasks: []
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
      if (this.utils.has(thisActivity, 'ActivitySequence')) {
        thisActivity.ActivitySequence.forEach(task => {
          activity.tasks.push(task);
        })   
     };

      activities.push(activity);

    })
    return activities;
  }
  
  public getProgress(id) {
    return this.request.get(api.progress, {
      params: {
        model: 'Milestone',
        model_id: id,
        scope: 'Task'
      }
    })
    .pipe(map(response => {
      if (response.sucess && response.date) {
        return this._normaliseProgress(response.date);
      }
    }))
  }

  private _normaliseProgress(data: any) {
    
    if (!this.utils.has(data, 'Project.Milestone')) {
      this.request.apiResponseFormatError('Progress format error');
      return 0;
    }

    this._milestoneProgress(data);
  }

  private _milestoneProgress(data) {
    data.Milestone.forEach(this._loopThroughMilestones, this);
  }

  private _loopThroughMilestones(progressOfMilestones) {
    var findMilestoneWithThisId = this.Milestones.find(function (item) {
      return item.id === progressOfMilestones.id;
    })
    findMilestoneWithThisId.progress = progressOfMilestones.progress;

    this._activityProgress(findMilestoneWithThisId, progressOfMilestones);
  }

  private _activityProgress(data,progress) {
    data.Activity.forEach(function(activity){
      var findActivityWithThisId = progress.Activity.find(function(item) {
        return item.id === activity.id;
      })
      data.Activity.progress = findActivityWithThisId.progress;
    })
  }
}