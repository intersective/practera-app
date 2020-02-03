import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
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
  activity: 'api/activities.json',
  submissions: 'api/submissions.json',
  progress: 'api/v2/motivations/progress/list.json',
  projectOverview: 'api/v2/plans/project/overview',
};

export interface Activity {
  id: number;
  name: string;
  description?: string;
  tasks: Array<Task>;
}

export interface Task {
  id: number;
  type: string;
  name: string;
  status?: string;
  contextId?: number;
  isForTeam?: boolean;
  dueDate?: string;
  isOverdue?: boolean;
  isDueToday?: boolean;
  isLocked?: boolean;
  submitter?: {
    name: string;
    image: string;
  };
}

export interface OverviewTask {
  is_locked: boolean;
  type: string;
  id: number;
  name: string;
  context_id?: number;
  status?: string;
  is_team?: boolean;
  progress: number;
  deadline: string;
  Submitter?: {
    id: number;
    name: string;
    email: string;
    image: string;
  };
}

export interface OverviewActivity {
  id: number;
  name: string;
  is_locked: boolean;
  Tasks?: Array<OverviewTask>;
}

export interface OverviewMilestone {
  id: number;
  name: string;
  is_locked: boolean;
  Activities: OverviewActivity[];
}

export interface Overview {
  id: number;
  name: string;
  Milestones: OverviewMilestone[];
}

@Injectable({
  providedIn: 'root'
})

export class ActivityService {
  public tasks: Array<any>;

  constructor(
    private request: RequestService,
    private utils: UtilsService,
    public storage: BrowserStorageService,
  ) {}

  // request for the latest data, and return the previously saved data at the same time
  public getActivity(id) {
    this._getActivityData(id).subscribe(res => this.utils.updateActivityCache(id, res));
    return this.utils.getActivityCache(id);
  }

  // request for the latest project data
  private _getActivityData(id) {
    return this.request.postGraphQL(
      `"{` +
        `activity(id:${id}){` +
          `id name description tasks{` +
            `id name type is_locked is_team deadline context_id status{` +
              `status is_locked submitter_name submitter_image` +
            `}` +
          `}` +
        `}` +
      `}"`)
      .pipe(map(res => this._normaliseActivity(res.data)));
  }

  private _normaliseActivity(data): Activity {
    data.activity.tasks = data.activity.tasks.map(task => {
      if (task.is_locked) {
        return {
          id: 0,
          type: 'Locked',
          name: 'Locked'
        };
      }
      switch (task.type) {
        case 'topic':
          return {
            id: task.id,
            name: task.name,
            type: 'Topic',
            status: task.status.status
          };

        case 'assessment':
          return {
            id: task.id,
            name: task.name,
            type: 'Assessment',
            contextId: task.context_id,
            isForTeam: task.is_team,
            dueDate: task.deadline,
            isOverdue: task.deadline ? this.utils.timeComparer(task.deadline) < 0 : false,
            isDueToday: task.deadline ? this.utils.timeComparer(task.deadline, undefined, true) === 0 : false,
            status: task.status.status === 'pending approval' ? 'pending review' : task.status.status,
            isLocked: task.status.is_locked,
            submitter: {
              name: task.status.submitter_name,
              image: task.status.submitter_image
            }
          };
        default:
          console.warn(`Unsupported model type ${task.type}`);
          return {
            id: task.id,
            name: task.name,
            type: task.type
          };
      }
    });
    return data.activity;
  }

  /**
   * loop through all milestone in current project
   * @param {OverviewMilestone[]} milestones object project overview api
   * @param {number} activityId activity id
   */
  private getCurrentActivity(milestones, activityId): {
    currentMilestoneIndex: number;
    currentMilestone: OverviewMilestone;
    currentActivity: OverviewActivity;
  } {
    let currentActivity: OverviewActivity;
    let currentMilestone: OverviewMilestone;

    // firstly, check current milestone
    const currentMilestoneIndex: number = milestones.findIndex(milestone => {
      const { Activities } = milestone;

      // find current activity
      currentActivity = Activities.find(activity => {
        if (activity.id === activityId) {
          return true;
        }
        return false;
      });

      // insert current milestone to "currentMilestone"
      if (currentActivity) {
        currentMilestone = milestone;
        return true;
      }

      return false;
    });

    return {
      currentMilestoneIndex,
      currentMilestone,
      currentActivity,
    };
  }

  /**
   * get next milestone unconditionally
   */
  private getNextMilestone(milestones, currentMilestone, currentMilestoneIndex) {
    let nextMilestone: OverviewMilestone;

    const nextMilestoneIndex = currentMilestoneIndex + 1; // skip checking current
    // get next milestone by the order of milestone array
    for (let i = nextMilestoneIndex, trial = 1; trial <= milestones.length; i++, trial++) {
      const milestoneIndex = i % milestones.length;
      if (nextMilestone === undefined) {
        nextMilestone = milestones[milestoneIndex];
      }
    }

    return nextMilestone;
  }

  /**
   * get next incompleted milestone only (status check is compulsory)
   */
  private getNextIncompletedMilestone(milestones, currentMilestone, currentMilestoneIndex) {
    let nextMilestone: OverviewMilestone;

    if (this.isMilestoneIncomplete(currentMilestone)) {
      return currentMilestone;
    }

    if (!this.isMilestoneIncomplete(currentMilestone)) {
      // get next milestone by the order of milestone array
      for (let i = currentMilestoneIndex, trial = 1; trial <= milestones.length; i++, trial++) {
        const milestoneIndex = i % milestones.length;
        if (this.isMilestoneIncomplete(milestones[milestoneIndex]) && nextMilestone === undefined) {
          nextMilestone = milestones[milestoneIndex];
        }
      }
    }

    return nextMilestone;
  }

  private _normaliseOverview(rawResponse: Overview): Overview {
    const milestones = rawResponse.Milestones;
    // make sure every activity is available
    const normalisedMilestones = milestones.filter(milestone => {
      if (milestone.Activities.length > 0) {
        return true;
      }

      return false;
    });

    return {
      id: rawResponse.id,
      name: rawResponse.name,
      Milestones: normalisedMilestones
    };
  }

  /**
   * Purpose: get next task (look for next incomplete milestone/activity/task),
   * this function will loop through entire status available in a project (from milestone to task-specific) to get the next incompleted task as next task to be redirected to
   *
   * combine all (get activity, progress for both topic and assessment) steps into one function
   * so we can access to tasks with progress information easily
   * @param  {number}       projectId project id
   * @param  {number}       activityId activity id
   * @return {Promise<any>}    Promise
   */
  async getTasksByActivityId(projectId: number, activityId: number, options: {
    currentTaskId: number;
    teamId: number;
  }): Promise<{
    currentActivity: OverviewActivity;
    nextTask: OverviewTask;
  }> {
    // project overview
    const overview = await this.getOverview(projectId).toPromise();

    // firstly, check current milestone
    const {
      currentMilestoneIndex,
      currentActivity,
      currentMilestone
    } = this.getCurrentActivity(overview.Milestones, activityId);

    // search next incompleted milestone
    const nextMilestone: OverviewMilestone = this.getNextIncompletedMilestone(
      overview.Milestones,
      currentMilestone,
      currentMilestoneIndex
    );

    let nextTask;

    // conditions: nextMilestone = undefined, means all milestone has been completed
    if (nextMilestone === undefined) {
      let nextActivity;
      // find next task
      nextTask = this.utils.getNextArrayElement(currentActivity.Tasks, options.currentTaskId);

      // find next activity (if next one is not available, then stick back first one)
      if (nextTask === undefined) {
        nextActivity = this.utils.getNextArrayElement(currentMilestone.Activities, currentActivity.id);
      } else {
        nextActivity = currentActivity;
      }

      // find next milestone
      if (nextActivity === undefined) {
        const nextUnconditionalMilestone = this.getNextMilestone(
          overview.Milestones,
          currentMilestone,
          currentMilestoneIndex,
        );

        return {
          // first task and activity in the milestone as next
          currentActivity: nextUnconditionalMilestone.Activities[0],
          nextTask: nextUnconditionalMilestone.Activities[0].Tasks[0],
        };
      } else {
        nextTask = this.utils.getNextArrayElement(nextActivity.Tasks, options.currentTaskId);
      }

      return {
        currentActivity: nextActivity,
        nextTask,
      };
    }

    let incompletedActivity;
    // skip only if current activity is completed
    if (this.isActivityIncomplete(currentActivity)) {
      nextTask = this.findNext(currentActivity.Tasks, options);
    } else {
      // if nextMilestone not present, use currentMilestone as backup
      incompletedActivity = nextMilestone.Activities.find(activity => {
        if (this.isActivityIncomplete(activity)) {
          return true;
        }
        return false;
      });

      nextTask = this.findNext(incompletedActivity.Tasks, options);
    }

    return {
      currentActivity: incompletedActivity || currentActivity,
      nextTask,
    };
  }

  public _normaliseOverviewTasks(tasks: OverviewTask[]) {
    const result = tasks.map(task => {
      if (task.is_locked) {
        return {
          id: 0,
          type: 'Locked',
          name: 'Locked',
          loadingStatus: false
        };
      }

      switch (task.type) {
        case 'topic':
          return {
            id: task.id,
            name: task.name,
            type: 'Topic',
            loadingStatus: true
          };

        case 'assessment':
          return {
            id: task.id,
            name: task.name,
            type: 'Assessment',
            contextId: task.context_id || 0,
            loadingStatus: true,
            isForTeam: task.is_team,
            dueDate: task.deadline,
            isOverdue: task.deadline ? this.utils.timeComparer(task.deadline) < 0 : false,
            isDueToday: task.deadline ? this.utils.timeComparer(task.deadline, undefined, true) === 0 : false,
          };
      }
    });
    return result;
  }

  // when not done (empty status/feedback available/)
  private isTaskCompleted(task: OverviewTask): boolean {
    // is_locked: take is_locked story as "completed" for now (so we skip to the next one)
    // progress: 0 = not done, 1 = marked as read (done)
    if (task.is_locked || task.progress === 1) {
      return true;
    }

    // if assessment is a team assessment and participent is not in a team, we skip to next one.
    if (task.is_team && !this.storage.getUser().teamId) {
      return true;
    }

    // Assessment: 'done' and 'progress=0' can be coexistent
    if (task.type === 'assessment' && ['pending review', 'done', 'pending approval'].indexOf(task.status) !== -1) {
      return true;
    }

    // potential status: "in progress"/"feedback available"
    return false;
  }

  /**
   * get next task from the provided list of tasks based on array's order
   * @param  {Task[]}     tasks task list
   * @param  {object}     options current taskId and teamId
   * @return {Task}       single task object
   */
  findNext(tasks: OverviewTask[], options: {
    currentTaskId: number;
    teamId: number;
  }): OverviewTask {
    // currentIndex can be -1 because the tasks list can be from different Activity's tasks set
    const currentIndex = tasks.findIndex(task => {
      return task.id === options.currentTaskId;
    });

    const nextIndex = currentIndex + 1;
    if (currentIndex !== -1 && tasks[nextIndex] && !this.isTaskCompleted(tasks[nextIndex])) {
      return tasks[nextIndex];
    }

    // condition: if next task is a completed activity, pick the first undone from the list
    const prioritisedTasks = tasks.filter(task => {
      // avoid team assessment if user isn't in a team
      if (task.is_team && !options.teamId) {
        console.warn('user isn\'t in a team.');
        return false;
      }

      return !this.isTaskCompleted(task);
    });
    return prioritisedTasks[0];
  }

  /**
   * definition of incomplete:
   * - for assessment, submission could be done, but hasn't review or awaiting feedback
   * - for topic, hasn't marked as read
   * @param {[type]} assessment [description]
   */
  isActivityIncomplete(assessment): boolean {
    const { Tasks } = assessment;

    const hasIncompletedTask = Tasks.filter(task => {
      if (task.type === 'assessment') {
        if (task.status === 'not started') {
          return true;
        }

        // don't include 'pending review/pending approval'
        return (task.progress < 1 && (task.status === 'published' || task.status === 'in progress' || task.status === 'feedback available' || task.status === ''));
      }

      return task.progress < 1;
    });

    return hasIncompletedTask.length > 0;
  }

  isMilestoneIncomplete(milestone): boolean {
    const { Activities } = milestone;
    const isIncompleted = Activities.filter(activity => {
      return this.isActivityIncomplete(activity);
    });
    return isIncompleted.length > 0;
  }

  // get overview of statuses for the entire project
  getOverview(projectId: number): Observable<Overview> {
    return this.request.get(api.projectOverview, {
      params: { id: projectId }
    }).pipe(map(res => this._normaliseOverview(res.data)));
  }
}
