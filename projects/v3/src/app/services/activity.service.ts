import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { UtilsService } from '@v3/services/utils.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { Router } from '@angular/router';
import { ApolloService } from '@v3/services/apollo.service';
import { DemoService } from './demo.service';
import { environment } from '@v3/environments/environment';
import { TopicService } from './topic.service';
import { AssessmentService } from './assessment.service';
import { SharedService } from './shared.service';
import { UnlockIndicatorService } from './unlock-indicator.service';

export interface TaskBase {
  id: number;
  assessmentType: string;
  contextId: number;
  deadline: string;
  isLocked: boolean;
  isTeam: boolean;
  name: string;
  status: string;
  type: string;
}

export interface ActivityBase {
  id: number;
  name: string;
  description?: string;
  tasks: Array<TaskBase>;
}

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
  assessmentType?: string;
}

@Injectable({
  providedIn: 'root'
})

export class ActivityService {
  private _activity$ = new BehaviorSubject<Activity>(null);
  activity$ = this._activity$.pipe(shareReplay(1));
  private _currentTask$ = new BehaviorSubject<Task>(null);
  currentTask$ = this._currentTask$.pipe(shareReplay(1));

  private activity: Activity;

  constructor(
    private demo: DemoService,
    private utils: UtilsService,
    public storage: BrowserStorageService,
    private router: Router,
    private notification: NotificationsService,
    private apolloService: ApolloService,
    private topic: TopicService,
    private assessment: AssessmentService,
    private sharedService: SharedService,
    private unlockIndicatorService: UnlockIndicatorService,
  ) {}

  public clearActivity(): void {
    this._activity$.next(null);
  }

  getActivityBase(activityId: number | string, options?: {}): Observable<{
    data: {
      activity: ActivityBase
    }
  }> {
    return this.apolloService.graphQLFetch(
      `query getActivity($id: Int!) {
        activity(id:$id){
          id name description tasks{
            id name type isLocked isTeam deadline contextId assessmentType status{
              status isLocked submitterName submitterImage
            }
          }
        }
      }`,
      {
        variables: {
          id: +activityId
        }
      }
    );
  }

  /**
   * make API call for activity information
   *
   * @param   {number}  id            activity id
   * @param   {boolean}  goToNextTask  true to go to next task
   * @param   {Task}    afterTask     currently targeted task
   *
   * @return  {Subscription}                graphql watch
   */
  public getActivity(id: number, goToNextTask = false, afterTask?: Task, callback?: Function) {
    if (environment.demo) {
      const taskId = afterTask ? afterTask.id : 0;
      return this.demo.activity(taskId).pipe(map(res => this._normaliseActivity(res.data, goToNextTask, afterTask))).subscribe(_res => {
        if (callback instanceof Function) {
          return callback(_res);
        }
        return;
      });
    }
    return this.getActivityBase(id).pipe(
      map(res => this._normaliseActivity(res.data, goToNextTask, afterTask))
    ).subscribe(res => {
      if (callback instanceof Function) {
        return callback(res);
      }
      return;
    });
  }

  /**
   * Handle the activity response data
   * @param data The activity response data
   * @param goToNextTask Whether need to go to the first task (true for desktop view)
   * @param afterTask [Optional] Go to the first task after this task (only used along when goToNextTask is true)
   * @returns
   */
  private _normaliseActivity(data: any, goToNextTask: boolean, afterTask?: Task): Activity {
    if (!data) {
      return null;
    }
    // clone the return data, instead of modifying it
    const result = JSON.parse(JSON.stringify(data.activity));
    result.tasks = result.tasks.map(task => {
      if (task.isLocked) {
        return {
          id: 0,
          type: 'Locked',
          name: 'Locked'
        };
      }
      switch (task.type.toLowerCase()) {
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
            contextId: task.contextId,
            isForTeam: task.isTeam,
            dueDate: task.deadline,
            isOverdue: task.deadline ? this.utils.timeComparer(task.deadline) < 0 : false,
            isDueToday: task.deadline ? this.utils.timeComparer(task.deadline, { compareDate: true }) === 0 : false,
            status: task.status.status === 'pending approval' ? 'pending review' : task.status.status,
            isLocked: task.status.isLocked,
            submitter: {
              name: task.status.submitterName,
              image: task.status.submitterImage
            },
            assessmentType: task.assessmentType
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

    this.compareAndUnlockTasks(result);

    this._activity$.next(result);
    this.activity = result;
    if (goToNextTask) {
      this.goToNextTask(afterTask);
    }
    return result;
  }

  private compareAndUnlockTasks(result: any) {
    const currentActivity = this._activity$.getValue();
    if (!currentActivity?.tasks || !result?.tasks) {
      return;
    }

    if (currentActivity.id === result.id && currentActivity.tasks.length !== result.tasks.length) {
      const currentTasks = {};
      currentActivity.tasks.map(task => {
        currentTasks[task.id] = task;
      });

      result.tasks.forEach(task => {
        if (currentTasks[task.id] === undefined) {
          this.unlockIndicatorService.unlockTask(null, result.id, task.id);
        }
      });
    }
  }

  /**
   * Go to the first unfinished task inside this activity,
   * or go to the next task after a specific task
   * @param tasks The list of tasks
   * @param afterTask Find the next task after this task
   */
  calculateNextTask(tasks: Task[], afterTask?: Task) {
    // find the first accessible task that is not "done" or "pending review"
    let skipTask: boolean = !!afterTask;
    let nextTask: Task;
    let hasUnfinishedTask = false; // check if there is any unfinished task
    for (const task of tasks) {
      // if we need to find the first task after a specific task,
      // loop through the tasks array until we find this specific task
      if (skipTask) {
        if (afterTask.id === task.id && afterTask.type === task.type) {
          skipTask = false;
        }
        if (!['done', 'pending review'].includes(task.status)) {
          // flag to popup ActivityCompletePopUpComponent modal whenever
          // there is any unfinished task
          hasUnfinishedTask = true;
        }
        continue;
      }

      // if the accessible task is not locked (individual assessment)
      if (
        task.type !== 'Locked' && !task.isLocked && // not locked
        !(task.isForTeam && !this.storage.getUser().teamId) && // not a team assessment
        !(task.assessmentType === 'team360' && !this.storage.getUser().teamId) // not a team 360 assessment
      ) {
        // get the next task after a specific task
        if (afterTask) {
          nextTask = task;
          break;
        }

        // find the first unfinished task
        if (!['done', 'pending review'].includes(task.status)) {
          nextTask = task;
          break;
        }
      }
    }

    // if there is no next task
    if (this.utils.isEmpty(nextTask)) {
      if (afterTask) {
        this.assessment.getAssessment(
          afterTask.id,
          'assessment',
          this.activity.id,
          afterTask.contextId
        );
        return this._activityCompleted(hasUnfinishedTask);
      }
      nextTask = tasks[0]; // go to the first task
    }

    if (!this.utils.isEmpty(nextTask)) {
      return this.goToTask(nextTask);
    }
  }

  // obtain latest activity to decide next task
  goToNextTask(afterTask?: Task) {
    return this.getActivity(this._activity$.getValue().id, false, null, (res: Activity) => {
      let tasks = res.tasks;
      if (this.utils.isEmpty(tasks) || tasks.length === 0) {
        tasks = [];
      }
      return this.calculateNextTask(tasks, afterTask);
    });
  }

  private _activityCompleted(showPopup: boolean) {
    // check if we need to redirect user to external url
    const referrer = this.storage.getReferrer();
    if (this.utils.has(referrer, 'activityTaskUrl')) {
      this.utils.redirectToUrl(referrer.activityTaskUrl);
      return ;
    }

    if (showPopup) {
      // pop up activity completed modal
      return this.notification.activityCompletePopUp(this.activity.id, false);
    }
    return this.router.navigate(['v3', 'home']);
  }

  async goToTask(task: Task, getData = true): Promise<void | Subscription | boolean> {
    // update teamId
    await this.sharedService.getTeamInfo().toPromise();

    this._currentTask$.next(task);

    this.unlockIndicatorService.removeTask(null, null, task.id);
    if (!getData) {
      return ;
    }
    switch (task.type) {
      case 'Assessment':
        if (this.utils.isMobile()) {
          return this.router.navigate([
            'assessment-mobile',
            'assessment',
            this.activity.id,
            task.contextId,
            task.id
          ]);
        }
        return this.assessment.getAssessment(task.id, 'assessment', this.activity.id, task.contextId);
      case 'Topic':
        if (this.utils.isMobile()) {
          return this.router.navigate(['topic-mobile', this.activity.id, task.id]);
        }
        return this.topic.getTopic(task.id);
    }
  }


  /**
   * @name nonTeamActivity
   * @description check if the activity is accessible by current
   *    user (team or individual assessment).
   *    When milestone contain only team assessment, only participant from a team
   *    can access the activities.
   *
   * @param   {number<boolean>}   activityId
   *
   * @return  {Promise<boolean>}  false when inaccessible, otherwise true
   */
  async nonTeamActivity(tasks?: Task[]): Promise<boolean> {
    const teamStatus = await this.sharedService.getTeamInfo().toPromise();
    if (teamStatus?.data?.user?.teams.length > 0) {
      return true;
    }

    const nonTeamAsmt = (tasks || [])
      .filter((task: Task) => task.isForTeam !== true);

    return nonTeamAsmt.length > 0;
  }
}
