import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, firstValueFrom, Observable, of, Subscription } from 'rxjs';
import { first, map, shareReplay, tap } from 'rxjs/operators';
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
import { UnlockConditionMeta } from './home.service';
import { H5pContent } from './topic.service';

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
  isLocked?: boolean;
  tasks: Array<TaskBase>;
}

export interface Activity {
  id: number;
  name: string;
  description?: string;
  tasks: Array<Task>;
  isLocked?: boolean;
  unlockConditions: Array<{
    name: string;
    action: string;
    meta: UnlockConditionMeta;
  }>;
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
  h5p?: H5pContent;
  todoGroup?: TodoGroupData;
}

export interface TodoTaskItem {
  id: number;
  title: string;
  description?: string;
  estimatedHours?: number;
  dueDate?: string;
  status: string;
  assigneeId?: number;
  completedAt?: string;
  completedBy?: number;
  assignmentHistory: { userId: number; action: string; fromUserId?: number; at: string }[];
  praise: number[];
  praiseCount: number;
  isAdminDefined: boolean;
  createdBy?: number;
  order?: number;
}

export interface TodoGroupData {
  id: number;
  title: string;
  description?: string;
  allowMemberAdditions: boolean;
  estimatedTotalHours?: number;
  items: TodoTaskItem[];
}

@Injectable({
  providedIn: 'root'
})

export class ActivityService {
  private _activity$ = new BehaviorSubject<Activity>(null);
  activity$ = this._activity$.pipe(tap(activity => this.activity = activity), shareReplay(1));
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

  public refreshActivity(data?): void {
    this._activity$.next(data || this._activity$.getValue());
  }

  getActivityBase(activityId: number | string, options?: {}): Observable<{
    data: {
      activity: ActivityBase
    }
  }> {
    return this.apolloService.graphQLFetch(
      `query getActivity($id: Int!) {
        activity(id:$id){
          id name description isLocked tasks {
            id name type isLocked isTeam deadline contextId assessmentType status {
              status isLocked submitterName submitterImage
            }
            todoGroup {
              id title description allowMemberAdditions estimatedTotalHours
              items {
                id title description estimatedHours dueDate status
                assigneeId completedAt completedBy praiseCount isAdminDefined createdBy order
                praise assignmentHistory { userId action fromUserId at }
              }
            }
          }
          unlockConditions {
            name action
            meta {
              activityId
              assessmentId
              topicId
              contextId
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
  public getActivity(
    id: number, goToNextTask = false, afterTask?: Task, callback?: Function
  ) {
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
      map(res => this._normaliseActivity(res.data, goToNextTask, afterTask)),
      catchError(async err => {
        console.error('Error fetching activity:', err);
        await this.notification.alert({
          message: $localize`Unable to fetch activity data. Please try again later.`,
          buttons: [
            {
              text: $localize`OK`,
              role: 'cancel',
              handler: () => {
                this.router.navigate(['v3', 'home']);
              }
            }
          ]
        })
        return of(null);
      })
    ).subscribe(_res => {
      if (callback instanceof Function) {
        return callback(_res);
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
    const result = { ...data.activity };
    const tasks = result?.tasks?.filter(task => task.id !== null) // filter out null task
    .map(task => {
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
          const taskStatus = task.status;
          return {
            id: task.id,
            name: task.name,
            type: 'Assessment',
            contextId: task.contextId,
            isForTeam: task.isTeam,
            dueDate: task.deadline,
            isOverdue: task.deadline ? this.utils.timeComparer(task.deadline) < 0 : false,
            isDueToday: task.deadline ? this.utils.timeComparer(task.deadline, { compareDate: true }) === 0 : false,
            status: taskStatus?.status === 'pending approval' ? 'pending review' : taskStatus?.status,
            isLocked: taskStatus?.isLocked,
            submitter: {
              name: taskStatus?.submitterName,
              image: taskStatus?.submitterImage
            },
            assessmentType: task.assessmentType
          };

        case 'simulation':
          return {
            id: task.id,
            name: task.name,
            type: 'Simulation',
            contextId: task.contextId,
            status: task.status?.status,
          };
        case 'todo':
          return {
            id: task.id,
            name: task.name,
            type: 'Todo',
            todoGroup: task.todoGroup ?? null,
            status: task.status?.status,
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

    result.tasks = tasks;

    this._activity$.next(result);
    if (goToNextTask === true) {
      this.goToNextTask(afterTask);
    }
    return result;
  }

  /**
   * Go to the first unfinished task inside this activity,
   * or go to the next task after a specific task
   * @param tasks the list of tasks
   * @param afterTask find the next task after this task
   * @param activityId the activity id for task navigation
   */
  calculateNextTask(tasks: Task[], afterTask?: Task, activityId?: number, callback?: Function) {
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
        const finalActivityId = activityId || this._activity$.getValue()?.id;

        return this.assessment.fetchAssessment(
          afterTask.id,
          'assessment',
          finalActivityId,
          afterTask.contextId
        ).subscribe({
          next: () => {
            return this._activityCompleted(hasUnfinishedTask);
          },
          error: (err) => {
            console.error('Error fetching assessment::', err);
            return this._activityCompleted(hasUnfinishedTask);
          },
          complete: () => {
            if (callback instanceof Function) {
              return callback();
            }
          }
        });
      }
      nextTask = tasks[0]; // go to the first task
    } else if (!this.utils.isEmpty(nextTask)) {
      this.goToTask(nextTask, activityId);
    }

    if (callback instanceof Function) {
      return callback();
    }
  }

  // obtain latest activity to decide next task
  goToNextTask(afterTask?: Task, callback?: Function) {
    const activityId = this._activity$.getValue().id;

    return this.getActivity(activityId, false, null, (res: Activity) => {
      let tasks = res.tasks;
      if (this.utils.isEmpty(tasks) || tasks.length === 0) {
        tasks = [];
      }

      return this.calculateNextTask(tasks, afterTask, activityId, callback);
    });
  }

  private _activityCompleted(showPopup: boolean) {
    // check if we need to redirect user to external url
    const referrer = this.storage.getReferrer();
    if (this.utils.has(referrer, 'activityTaskUrl')) {
      this.utils.redirectToUrl(referrer.activityTaskUrl);
      return;
    }

    if (showPopup) {
      // pop up activity completed modal
      return this.notification.activityCompletePopUp(this.activity.id, false);
    }
    return this.router.navigate(['v3', 'home']);
  }

  /**
   * Navigate to and prepare a given task (assessment or topic).
   *
   * This method handles an overloaded second parameter for backward compatibility:
   * if `activityIdOrGetData` is a boolean, it is treated as `getData` and the current
   * activity id is resolved from `this.activity` or `this._activity$`. Otherwise it
   * is treated as an `activityId` (number) and falls back to the current activity id
   * when not provided.
   *
   * Workflow and side effects:
   * - Ensures team information is loaded via `sharedService.getTeamInfo()`.
   * - Sets the current task subject observable (`this._currentTask$`).
   * - Clears the task from the unlock indicator and marks any cleared tasks as done
   *   via `notification.markTodoItemAsDone`.
   * - If `getData` is false, the method returns early (no further task navigation/fetch).
   * - Sets the page title to the task name.
   * - For task.type === 'Assessment':
   *   - On mobile: navigates to the mobile assessment route and returns the router navigation result.
   *   - On desktop: fetches the activity base, normalises it, fetches the assessment data,
   *     and stores a last-visited assessment URL in storage.
   * - For task.type === 'Topic':
   *   - On mobile: navigates to the mobile topic route and returns the router navigation result.
   *   - On desktop: stores a last-visited URL and triggers loading of the topic via `topic.getTopic`.
   * - For task.type === 'Simulation':
   *   - On desktop: fetches H5P content URLs and attaches them to the current task.
   *
   * Notes:
   * - This method produces several side effects (navigation, storage updates, observable updates,
   *   HTTP/observable fetches and subscriptions).
   * - Errors encountered while fetching activity/assessment on the desktop assessment flow
   *   are rethrown as an Error.
   *
   * @param task - The Task to navigate to and/or fetch data for.
   * @param activityIdOrGetData - Either the numeric activity id to use, or a boolean used
   *                              for backward compatibility to indicate `getData`.
   * @param getData - Whether to fetch related data and perform the route-specific workflow.
   *                  Defaults to true.
   * @returns A Promise that resolves to:
   *  - boolean when a Router.navigate call is returned (navigation result),
   *  - void when the method completes without returning a navigation result,
   *  - or a Subscription in cases where an observable subscription might be returned by legacy code paths.
   * @throws Error When desktop assessment fetching fails (the underlying error is wrapped/rethrown).
   */
  async goToTask(task: Task, activityIdOrGetData?: number | boolean, getData = true): Promise<void | Subscription | boolean> {
    // handle overloaded parameters for backward compatibility
    let activityId: number;
    if (typeof activityIdOrGetData === 'boolean') {
      getData = activityIdOrGetData;
      activityId = this.activity?.id || this._activity$.getValue()?.id;
    } else {
      activityId = activityIdOrGetData || this.activity?.id || this._activity$.getValue()?.id;
    }

    // update teamId
    await this.sharedService.getTeamInfo().toPromise();

    this._currentTask$.next(task);

    // clear the task from the unlock indicator
    const cleared = this.unlockIndicatorService.removeTasks(task.id);
    cleared.forEach(clearedTask => {
      this.notification.markTodoItemAsDone(clearedTask).pipe(first()).subscribe();
    });

    if (!getData) {
      return ;
    }

    this.utils.setPageTitle(task.name);
    switch (task.type) {
      case 'Assessment':
        if (this.utils.isMobile()) {
          return this.router.navigate([
            'assessment-mobile',
            'assessment',
            activityId,
            task.contextId,
            task.id
          ]);
        }

        try {
          const activity = await firstValueFrom(
            this.getActivityBase(activityId).pipe(
              map(res => this._normaliseActivity(res.data, false))
            )
          );

          await firstValueFrom(
            this.assessment.fetchAssessment(task.id, 'assessment', activity.id, task.contextId)
          );

          // store last visited assessment url during visit
          this.storage.lastVisited('assessmentUrl', [
            '/v3',
            'activity-desktop',
            task.contextId,
            activityId,
            task.id
          ].join('/'));
        } catch (error) {
          throw new Error(error);
        }
        break;

      case 'Topic':
        if (this.utils.isMobile()) {
          return this.router.navigate(['topic-mobile', activityId, task.id]);
        }
        this.storage.lastVisited('assessmentUrl', [
          '/v3',
          'activity-desktop',
          activityId,
          task.id
        ].join('/'));
        this.topic.getTopic(activityId, task.id);
        break;

      case 'Simulation':
        if (this.utils.isMobile()) {
          console.warn('Simulation tasks are not yet supported on mobile.');
          return;
        }
        try {
          const h5p = await firstValueFrom(this.topic.fetchSimulation(task.id));
          this._currentTask$.next({ ...task, h5p });
        } catch (error) {
          throw new Error(error);
        }
        break;

      case 'Todo':
        // For desktop, the task data (todoGroup) is already embedded in the task object.
        // The activity-desktop page renders app-todo-task inline.
        // For mobile, navigate to the dedicated todo-task-mobile route.
        if (this.utils.isMobile()) {
          return this.router.navigate(['todo-task-mobile', activityId, task.id]);
        }
        // Desktop: todoGroup data already present via GraphQL query — no additional fetch needed.
        break;
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
