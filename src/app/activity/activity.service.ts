import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';

/**
 * @name api
 * @description list of api endpoint involved in this service
 * @type {Object}
 */
const api = {
  activity: 'api/activities.json',
  submissions: 'api/submissions.json',
  progress: 'api/v2/motivations/progress/list.json'
};

export interface Task {
  id: number,
  type: string,
  name: string,
  status?: string,
  progress?: number,
  contextId?: number,
  feedbackReviewed?: boolean,
  loadingStatus?: boolean
}

export interface Activity {
  id: number,
  name: string,
  description?: string,
  tasks: Array<Task>
}

@Injectable({
  providedIn: 'root'
})

export class ActivityService {

  constructor(
    private request: RequestService,
    private utils: UtilsService,
  ) {}

  getActivity(id: number): Observable<any> {
    return this.request.get(api.activity, {params: {id: id}})
      .pipe(map(response => {
        if (response.success && response.data) {
          return this._normaliseActivity(response.data);
        }
      })
    );
  }

  private _normaliseActivity(data: any) {
    // In API response, 'data' is an array of activities(since we passed activity id, it will return only one activity, but still in array format). That's why we use data[0]
    if (!Array.isArray(data) || !this.utils.has(data[0], 'Activity') || !this.utils.has(data[0], 'ActivitySequence') || !this.utils.has(data[0], 'References')) {
      return this.request.apiResponseFormatError('Activity format error');
    }

    let activity: Activity = {
      id: 0,
      name: '',
      description: '',
      tasks: []
    };
    activity.id = data[0].Activity.id;
    activity.name = data[0].Activity.name;
    activity.description = data[0].Activity.description;

    let contextIds = {};
    data[0].References.forEach(element => {
      if (!this.utils.has(element, 'Assessment.id') || !this.utils.has(element, 'context_id')) {
        return this.request.apiResponseFormatError('Activity.References format error');
      }
      contextIds[element.Assessment.id] = element.context_id;
    });

    data[0].ActivitySequence.forEach(element => {
      if (!this.utils.has(element, 'model') || !this.utils.has(element, element.model)) {
        return this.request.apiResponseFormatError('Activity.ActivitySequence format error');
      }
      switch (element.model) {
        case 'Story.Topic':
          activity.tasks.push({
            id: element[element.model].id,
            name: element[element.model].title,
            type: 'Topic',
            loadingStatus: true
          });
          break;
        case 'Assess.Assessment':
          activity.tasks.push({
            id: element[element.model].id,
            name: element[element.model].name,
            type: 'Assessment',
            contextId: contextIds[element[element.model].id] || 0,
            loadingStatus: true
          });
          break;
      }
    });
    return activity;
  }

  getTasksProgress(activity: Activity): Observable<any> {
    return this.request.get(api.progress, {params: {
        model: 'Activity',
        model_id: activity.id,
        scope: 'Task'
      }})
      .pipe(map(response => {
        if (response.success && response.data) {
          return this._normaliseTasksProgress(response.data, activity.tasks);
        }
      })
    );
  }

  private _normaliseTasksProgress(data: any, tasks: Array<Task>) {
    if (!this.utils.has(data, 'Activity.Topic') || !this.utils.has(data, 'Activity.Assessment')) {
      return this.request.apiResponseFormatError('Progress.Activity format error');
    }
    let topicProgresses = {};
    let assessmentProgresses = {};
    data.Activity.Topic.forEach(element => {
      if (!this.utils.has(element, 'id') || !this.utils.has(element, 'progress')) {
        return this.request.apiResponseFormatError('Progress.Activity.Topic format error');
      } 
      topicProgresses[element.id] = element.progress
    });
    data.Activity.Assessment.forEach(element => {
      if (!this.utils.has(element, 'id') || !this.utils.has(element, 'progress')) {
        return this.request.apiResponseFormatError('Progress.Activity.Assessment format error');
      } 
      assessmentProgresses[element.id] = element.progress
    });
    tasks.forEach((task, index) => {
      switch (task.type) {
        case 'Topic':
          tasks[index].progress = topicProgresses[task.id] || 0;
          if (tasks[index].progress == 1) {
            tasks[index].status = 'done';
          } else {
            tasks[index].status = '';
          }
          tasks[index].loadingStatus = false;
          break;
        case 'Assessment':
          tasks[index].progress = assessmentProgresses[task.id] || 0;
          break;
      }
    });
    return tasks;
  }

  getAssessmentStatus(task: Task): Observable<any> {
    return this.request.get(api.submissions, {params:{
        assessment_id: task.id,
        context_id: task.contextId
      }})
      .pipe(map(response => {
        if (response.success && response.data) {
          return this._normaliseAssessmentStatus(response.data, task);
        }
      })
    );
  }

  private _normaliseAssessmentStatus(data: any, task: Task) {
    if (this.utils.isEmpty(data)) {
      task.status = '';
      task.loadingStatus = false;
      return task;
    }
    // In API response, 'data' is an array of submissions, but we only support one submission per assessment now. That's why we use data[0] - the first submission
    if (!Array.isArray(data) || !this.utils.has(data[0], 'AssessmentSubmission')) {
      return this.request.apiResponseFormatError('Submission format error');
    }

    switch (data[0].AssessmentSubmission.status) {
      case 'pending approval':
        task.status = 'pending review';
        break;
      
      case 'published':
        if (task.progress == 1) {
          task.status = 'done';
          task.feedbackReviewed = true;
        } else {
          task.status = 'feedback available'
          task.feedbackReviewed = false;
        }
        break;

      default:
        task.status = data[0].AssessmentSubmission.status
        break;
    }
    task.loadingStatus = false;
    return task;
  }

}
