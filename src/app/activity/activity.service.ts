import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
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
  id: number;
  type: string;
  name: string;
  status?: string;
  progress?: number;
  contextId?: number;
  feedbackReviewed?: boolean;
  loadingStatus?: boolean;
  isForTeam?: boolean;
  dueDate?: string;
  isOverdue?: boolean;
  isDueToday?: boolean;
}

export interface Activity {
  id: number;
  name: string;
  description?: string;
  tasks: Array<Task>;
}

export interface OverviewActivity {
  id: number;
  name: string;
  type: string;
  is_locked: boolean;
  progress: number;
}

export interface OverviewTopic {
  id: number;
  name: string;
  type: string;
  context_id: number;
  is_locked: boolean;
  status: string;
  is_team: boolean;
  progress: number;
  Submitter: {
      id: number;
      name: string;
      email: string;
      image: string;
  };
}

export interface Overview {
  progress: number;
  Milestone: {
    id: number;
    name: string;
    progress: number;
    Activity: {
      id: number;
      branch: string;
      name: string;
      progress: number;
      Assessment?: OverviewActivity[];
      Topic?: OverviewTopic[];
      Tasks?: Array<OverviewActivity | OverviewTopic>;
    }[];
  }[];
}

@Injectable({
  providedIn: 'root'
})

export class ActivityService {
  public tasks: Array<any>;

  constructor(
    private request: RequestService,
    private utils: UtilsService,
  ) {}

  private _normaliseOverviews(project: Overview): any {
    const { progress, Milestone } = project;

    const milestones = Milestone.map(milestone => {
      const activity = milestone.Activity.map(act => {
        let assessments = (act.Assessment) ? act.Assessment : [];
        let topics = (act.Topic) ? act.Topic : [];

        assessments = assessments.map(assessment => {
          return Object.assign(assessment, { type: 'Assessment' });
        });
        topics = topics.map(topic => {
          return Object.assign(topic, { type: 'Topic' });
        });
        const tasks = assessments.concat(topics);

        return {
          id: act.id,
          branch: act.branch,
          name: act.name,
          progress: act.progress,
          Tasks: tasks,
        };
      });

      return {
        id: milestone.id,
        name: milestone.name,
        progress: milestone.progress,
        Activities: activity,
      };
    });

    return {
      progress,
      Milestones: milestones
    };
  }

  async getTaskWithStatusByProjectId(id): Promise<any> {
    const tasksWithProgress = await this.getTasksProgress({
      model: 'project',
      model_id: id,
      scope: 'task',
    }).pipe(map(response => {
      return this._normaliseOverviews(response.data.Project);
    })).toPromise();

    return tasksWithProgress;
  }

  /**
   * combine all (get activity, progress for both topic and assessment) steps into one function
   * so we can access to tasks with progress information easily
   * @param  {number}       id activity id
   * @return {Promise<any>}    Promise
   */
  async getTaskWithStatusByActivityId(id, filters?: {
    key: string;
    value: string;
  }): Promise<any> {
    const activity: Activity = await this.getActivity(id).toPromise();
    const tasksWithProgress = await this.getTasksProgress({
      model: 'activity',
      model_id: activity.id,
      scope: 'task',
      tasks: activity.tasks,
    }).toPromise();

    // extract assessment type task
    const assessmentApiCalls = [];
    const nonAssessments = [];
    tasksWithProgress.forEach(task => {
      if (task.type === 'Assessment') {
        assessmentApiCalls.push(this.getAssessmentStatus(task));
      } else {
        nonAssessments.push(task);
      }
    });

    // extract assessment type task
    let assessmentProgresses = await forkJoin(assessmentApiCalls).toPromise();

    // optional filter to filter based on "key" & "value"
    if (filters) {
      assessmentProgresses = assessmentProgresses.filter(progress => {
        // Handle inconsistency: sometimes, incomplete status is an empty string ''
        if (filters.key === 'status' && progress[filters.key] === '') {
          return true;
        }
        return progress[filters.key] === filters.value;
      });
    }

    return nonAssessments.concat(assessmentProgresses);
  }

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
    // In API response, 'data' is an array of activities
    // (since we passed activity id, it will return only one activity, but still in array format).
    // That's why we use data[0]
    const thisActivity = data[0];

    if (!Array.isArray(data) || !this.utils.has(thisActivity, 'Activity') || !this.utils.has(thisActivity, 'ActivitySequence') || !this.utils.has(thisActivity, 'References')) {
      return this.request.apiResponseFormatError('Activity format error');
    }

    const activity: Activity = {
      id: 0,
      name: '',
      description: '',
      tasks: []
    };
    activity.id = thisActivity.Activity.id;
    activity.name = thisActivity.Activity.name;
    activity.description = thisActivity.Activity.description;

    const contextIds = {};
    thisActivity.References.forEach(element => {
      if (!this.utils.has(element, 'Assessment.id') || !this.utils.has(element, 'context_id')) {
        return this.request.apiResponseFormatError('Activity.References format error');
      }
      contextIds[element.Assessment.id] = element.context_id;
    });

    thisActivity.ActivitySequence.forEach(element => {
      if (this.utils.has(element, 'is_locked') && element.is_locked) {
        return activity.tasks.push({
          id: 0,
          type: 'Locked',
          name: 'Locked',
          loadingStatus: false
        });
      }
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
            loadingStatus: true,
            isForTeam: element[element.model].is_team,
            dueDate: element[element.model].deadline,
            isOverdue: this.utils.timeComparer(element[element.model].deadline) < 0 ? true : false,
            isDueToday: this.utils.timeComparer(element[element.model].deadline, undefined, true) === 0 ? true : false,
          });
          break;
      }
    });
    return activity;
  }

  /**
   * get and inject progress value (from 0 to 1) for each task
   * @param  {Activity}        activity object
   * @param  {object}          options model & model_id & scope
   * @return {Observable<any>}
   */
  getTasksProgress(options: {
    model_id: number; // model id
    model?: string;
    scope?: string;
    tasks?: Task[];
  }): Observable<any> {
    const params = {
      model_id: options.model_id,
      model: options.model || 'Activity',
      scope: options.scope || 'Task',
    };

    return this.request.get(api.progress, { params })
      .pipe(map(response => {
        if (response.success && response.data) {
          if (options.tasks) {
            return this._normaliseTasksProgress(response.data, options.tasks);
          }

          return response;
        }
      })
    );
  }

  private _normaliseTasksProgress(data: any, tasks: Array<Task>): Task[] | void {
    if (!this.utils.has(data, 'Activity.Topic') && !this.utils.has(data, 'Activity.Assessment')) {
      return this.request.apiResponseFormatError('Progress.Activity format error');
    }

    const topicProgresses = {};
    const assessmentProgresses = {};
    if (this.utils.has(data, 'Activity.Topic')) {
      data.Activity.Topic.forEach(topic => {
        if (!this.utils.has(topic, 'id') || !this.utils.has(topic, 'progress')) {
          return this.request.apiResponseFormatError('Progress.Activity.Topic format error');
        }
        topicProgresses[topic.id] = topic.progress;
      });
    }

    if (this.utils.has(data, 'Activity.Assessment')) {
      data.Activity.Assessment.forEach(assessment => {
        if (!this.utils.has(assessment, 'id') || !this.utils.has(assessment, 'progress')) {
          return this.request.apiResponseFormatError('Progress.Activity.Assessment format error');
        }
        assessmentProgresses[assessment.id] = assessment.progress;
      });
    }

    tasks.forEach((task, index) => {
      switch (task.type) {
        case 'Topic':
          tasks[index].progress = topicProgresses[task.id] || 0;
          tasks[index].status = '';
          tasks[index].loadingStatus = false;

          if (tasks[index].progress === 1) {
            tasks[index].status = 'done';
          }
          break;
        case 'Assessment':
          tasks[index].progress = assessmentProgresses[task.id] || 0;
          break;
      }
    });
    return tasks;
  }

  getAssessmentStatus(task: Task): Observable<any> {
    return this.request.get(api.submissions, {
        params: {
          assessment_id: task.id,
          context_id: task.contextId
        }
      })
      .pipe(map(response => {
        if (response.success && response.data) {
          return this._normaliseAssessmentStatus(response.data, task);
        }
      }));
  }

  // when not done (empty status/feedback available/)
  private isTaskCompleted(task: Task): boolean {
    // take locked story as "completed" for now to skip to the next one
    if (!task.status && task.type === 'Locked') {
      return true;
    }

    switch (task.status) {
      case 'pending review':
      case 'done':
        return true;
    }

    // potential status: "in progress"/"feedback available"
    return false;
  }

  /**
   * get next task from the provided list of tasks based on array's order
   * @param  {Task[]}     tasks task list
   * @param  {object}     options id and teamId
   * @return {Task}       single task object
   */
  findNext(tasks: Task[], options: {
    id: number;
    teamId: number;
  }): Task | null {
    const currentIndex = tasks.findIndex(task => {
      return task.id === options.id;
    });

    const nextIndex = currentIndex + 1;
    if (tasks[nextIndex] && !this.isTaskCompleted(tasks[nextIndex])) {
      return tasks[nextIndex];
    } else {
      // condition: if next task is a completed activity, pick the first undone from the list
      const prioritisedTasks: Task[] = tasks.filter(task => {
        // avoid team assessment if user isn't in a team
        if (task.isForTeam && !options.teamId) {
          return false;
        }

        return !this.isTaskCompleted(task);
      });

      if (prioritisedTasks.length > 0) {
        return prioritisedTasks[0];
      }
    }

    return null;
  }

  private _normaliseAssessmentStatus(data: any, task: Task) {
    if (this.utils.isEmpty(data)) {
      task.status = '';
      task.loadingStatus = false;
      return task;
    }
    // In API response, 'data' is an array of submissions,
    // but we only support one submission per assessment now.
    // That's why we use data[0] - the first submission
    const thisSubmission = data[0];
    if (!Array.isArray(data) || !this.utils.has(thisSubmission, 'AssessmentSubmission')) {
      return this.request.apiResponseFormatError('Submission format error');
    }

    // standardize and restrict statuses into 3 main categorises
    // eg. (pending review / feedback available / done)
    switch (thisSubmission.AssessmentSubmission.status) {
      case 'pending approval':
      case 'pending review':
        task.status = 'pending review';
        break;

      case 'published':
        // default
        task.status = 'feedback available';
        task.feedbackReviewed = false;

        if (task.progress === 1) {
          task.status = 'done';
          task.feedbackReviewed = true;
        }
        break;

      case 'done':
        task.status = 'done';
        break;

      default:
        // Potential status: '' (empty string) / 'in progress'
        task.status = thisSubmission.AssessmentSubmission.status;

        if (['', 'in progress'].indexOf(task.status) === -1) {
          console.warn(`Potential incompatible assessment status: ${thisSubmission.AssessmentSubmission.status}`);
        }
        break;
    }
    task.loadingStatus = false;
    return task;
  }

  /**
   * definition of incomplete:
   * - for assessment, submission could be done, but hasn't review or awaiting feedback
   * - for topic, hasn't marked as read
   * @param {[type]} assessment [description]
   */
  isActivityIncomplete(assessment): boolean {
    const hasIncompletedTask = assessment.Tasks.filter(task => {
      if (task.type === 'Assessment') {
        // don't include 'pending review/pending approval'
        return (task.progress < 1 && (task.status === 'in progress' || task.status === 'feedback available' || task.status === ''));
      }

      return task.progress < 1;
    });

    return hasIncompletedTask.length > 0;
  }

  isMilestoneIncomplete(milestone): boolean {
    const isIncompleted = milestone.Activities.filter(activity => {
      return this.isActivityIncomplete(activity);
    });
    return isIncompleted.length > 0;
  }
}
