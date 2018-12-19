import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
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
  milestone: '/api/milestone.json',
  activity: 'api/activities.json',
  progress: 'api/v2/motivations/progress/list.json'
};

export interface Activity {
  id?: number;
  name?: string;
  isLocked?: boolean;
  progress: number;
  hasFeedback?: boolean;
  leadImage?: string;
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
  // milestones: Array <Milestone> = [
  //   {
  //     id: 1,
  //     name: 'fundamental',
  //     project_id: 55,
  //     progress :1,
  //     description: ' You are now part of the learning community. Whether you are a Project Stakeholder, Consulting Mentor or a University Student about to embark on your first consulting project, welcome. This Fundamentals milestone will provide you with an overview, explain your role and provide you with tips and tricks for a successful learning experience ',
  //     Activity :[
  //       {
  //         id: 101,
  //         name: 'Test Activity one',
  //         isLocked: false,
  //         progress: 0.34,
  //         hasFeedback: true,
  //         leadImage:''
  //       },
  //       {
  //         id: 102,
  //         name: 'Activity two',
  //         isLocked: true,
  //         progress: 0.74,
  //         leadImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGTVf63Vm3XgOncMVSOy0-jSxdMT8KVJIc8WiWaevuWiPGe0Pm',
  //         hasFeedback: false,
  //       },
  //       {
  //         id: 102,
  //         name: 'Activity two',
  //         isLocked: true,
  //         progress: 0.74,
  //         leadImage: '',
  //         hasFeedback: false,
  //       } 
  //     ],
  //     isLocked: false
  //   },
  //   {
  //     id: 2,
  //     name: 'delivery',
  //     description:'', 
  //     project_id: 55,
  //     progress: 0.62,
  //     Activity :[
  //       { 
  //         id: 103,
  //         name: 'Test Activity three',
  //         isLocked: false,
  //         progress: 0.47,
  //         hasFeedback: false,
  //       },
  //       {
  //         id: 104,
  //         name: 'Activity four',
  //         isLocked: false,
  //         progress:0.98,
  //         hasFeedback: false,
  //       },
  //       {
  //         id: 105,
  //         name: 'Test Activity five',
  //         isLocked: false,
  //         progress: 0.47,
  //         hasFeedback: false,
  //       },
  //     ],
  //     isLocked: false
  //   },
  //   {
  //     id: 3,
  //     name: 'communication',
  //     description: 'there is some dummy text',
  //     progress: 1,
  //     project_id: 55,
  //     Activity :[
  //       {
  //         id: 106,
  //         name: 'Test Activity six',
  //         isLocked: false,
  //         progress: 1,
  //         hasFeedback: false,
  //       },
  //       {
  //         id: 107,
  //         name: 'Activity seven',
  //         isLocked: false,
  //         progress:0.48,
  //         hasFeedback: true,
  //       }
  //     ],
  //     isLocked: true
  //   },
  //   {
  //     id: 4,
  //     name: 'last',
  //     description: 'The deliver phase of a project is all about getting the work done. During this phase your team will likely work both independently and collectively to research and ultimately present your findings. Throughout this phase you will also complete a second employability skill assessment to see how you feel your skills are development and reflect on the journey so far in a reflection journal entry.',
  //     progress: 0.45,
  //     project_id: 65,
  //     Activity :[
  //       {
  //         id: 108,
  //         name: 'Test Activity six',
  //         isLocked: false,
  //         progress: 1,
  //         hasFeedback: false,
  //       },
  //     ],
  //     isLocked: false
  //   }
  // ];

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
    return milestones;
  }

  getActivities() {
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

  private _normaliseActivities(data) {
    let activities = [];
    if (!Array.isArray(data)) {
      this.request.apiResponseFormatError('Activity array format error');
      return [];
    }
    data.forEach(eachActivity, function (activity) {
      var activityArray = [];
      angular.forEach(activities.data, function (activity) {
          //to get activity list assigning a empty array to activity property of milestone.
          if (milestone.id === activity.Activity.milestone_id) {
              //old logic - milestone.activity = activity
              //modify old log to get activity list.
              activityArray.push(activity);
          }

      });

      milestone.activity = activityArray;
  });
  }
}