import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BrowserStorageService } from './storage.service';
import { Activity } from './activity.service';

export interface UnlockedTask {
  id?: number;
  milestoneId?: number;
  activityId?: number;
  taskId?: number;
  identifier?: string;
  meta?: {
    task_id: number;
    task_type: string;
    [key: string]: any;
  };
  taskType?: string; // optional for now
}

export enum UnlockIndicatorModel {
  Milestone = 'milestoneId',
  Activity = 'activityId',
  ActivitySequence = 'taskId',
  Task = 'taskId',
}

@Injectable({
  providedIn: 'root'
})
export class UnlockIndicatorService {
  // Initialize with an empty array
  private _unlockedTasksSubject = new BehaviorSubject<UnlockedTask[]>([]);
  // Expose as an observable for components to subscribe
  public unlockedTasks$ = this._unlockedTasksSubject.asObservable();

  constructor(
    private storageService: BrowserStorageService,
  ) {
    const storedTasks = this.storageService.get('unlockedTasks');
    if (storedTasks) {
      this._unlockedTasksSubject.next(storedTasks);
    }
  }

  getTasksByActivityId(activityId: number): UnlockedTask[] {
    return this._unlockedTasksSubject.getValue().filter(unlocked => unlocked.activityId === activityId);
  }

  isActivityClearable(activityId: number): boolean {
    const activities = this.getTasksByActivityId(activityId);
    const hasUnlockedTasks = activities.some(task => task.taskId !== undefined);
    if (hasUnlockedTasks === true) {
      return false;
    }

    return true;
  }


  /**
   * a unlockedTask has format { milestoneId, activityId, taskId }
   * so this will extract unlockedTask[] with milestoneId
   *
   * @param   {number}   milestoneId
   *
   * @return  {boolean}     false: not all unlocked tasks are viewed,
   *                        true: all unlocked tasks are viewed (ready for clearing milestone)
   */
  isMilestoneClearable(milestoneId: number): boolean {
    const milestones = this.getTasksByMilestoneId(milestoneId);
    const hasUnlockedActivities = milestones.some(task => task.activityId !== undefined);
    const hasUnlockedTasks = milestones.some(task => task.taskId !== undefined);
    if (hasUnlockedActivities || hasUnlockedTasks) {
      return false;
    }
    return true;
  }

  // clear all tasks (for experience switching)
  clearAllTasks() {
    this.storageService.remove('unlockedTasks');
    this._unlockedTasksSubject.next([]);
  }

  allUnlockedTasks(): UnlockedTask[] {
    return this._unlockedTasksSubject.getValue();
  }

  /**
   * Clear all tasks related to a particular activity
   *
   * @param   {number[]}        id  can either be activityId or milestoneId
   *
   * @return  {UnlockedTask[]}      unlocked tasks that were cleared
   */
  clearActivity(id: number): UnlockedTask[] {
    const currentTasks = this._unlockedTasksSubject.getValue();

    const clearedActivities = currentTasks.filter(task => task.activityId === id || task.milestoneId === id);
    const latestTasks = currentTasks.filter(task => task.activityId !== id && task.milestoneId !== id);

    this.storageService.set('unlockedTasks', latestTasks);
    this._unlockedTasksSubject.next(latestTasks);

    return clearedActivities;
  }

  getTasksByMilestoneId(milestoneId: number): UnlockedTask[] {
    return this._unlockedTasksSubject.getValue().filter(unlocked => unlocked.milestoneId === milestoneId);
  }

  getTasksByActivity(activity: Activity) {
    const tasks = activity.tasks || [];
    if (tasks.length === 0) {
      throw new Error('No tasks found in the activity');
    }
    const tasksId = tasks.map(task => task.id);
    return this._unlockedTasksSubject.getValue().filter(unlocked => tasksId.includes(unlocked.taskId));
  }

  // combine the stored tasks with the new data and store it
  unlockTasks(data: UnlockedTask[]) {
    const currentTasks = this._unlockedTasksSubject.getValue();
    const latestTasks = [...currentTasks, ...data];
    // Deduplicate the tasks
    const uniquelatestTasks = latestTasks.filter((task, index, self) =>
      index === self.findIndex((t) => (
        t.milestoneId === task.milestoneId &&
        t.activityId === task.activityId &&
        t.taskId === task.taskId
      ))
    );

    this.storageService.set('unlockedTasks', uniquelatestTasks);
    this._unlockedTasksSubject.next(uniquelatestTasks);
  }

  // Method to remove an accessed tasks
  // (some tasks are repeatable due to unlock from different level of trigger eg. by milestone, activity, task)
  // removeTasks(taskId?: number): UnlockedTask[] {
  //   const currentTasks = this._unlockedTasksSubject.getValue();
  //   const removedTask = currentTasks.filter(task => task.taskId === taskId);
  //   const latestTasks = currentTasks.filter(task => task.taskId !== taskId);
  //   this.storageService.set('unlockedTasks', latestTasks);
  //   this._unlockedTasksSubject.next(latestTasks);
  //   return removedTask;
  // }
  removeTasks(taskId?: number): UnlockedTask[] {
    const currentTasks = this._unlockedTasksSubject.getValue();

    // cascading removal of tasks, activities, milestones
    // Step 1: Remove the specific taskId
    const removedTasks = currentTasks.filter(task => task.taskId === taskId);
    let latestTasks = currentTasks.filter(task => task.taskId !== taskId);

    // Step 2: Identify the activityId associated with the removed taskId
    // Check if any other tasks are under this activityId
    if (removedTasks.length > 0) {
      const activityId = removedTasks[0].activityId;
      const hasOtherTasksInActivity = latestTasks.some(
        (task) => task.activityId === activityId && task.taskId !== undefined
      );

      // If no more tasks under this activityId, remove the activityId
      // Step 3: Identify the milestoneId associated with the removed activityId
      if (!hasOtherTasksInActivity) {
        latestTasks = latestTasks.filter(
          (task) => task.activityId !== activityId
        );
        const milestoneId = removedTasks[0].milestoneId;

        // Check if any other activities or tasks are under this milestoneId
        const hasOtherTasksInMilestone = latestTasks.some(
          (task) =>
            task.milestoneId === milestoneId &&
            (task.activityId !== undefined || task.taskId !== undefined)
        );

        // If no more tasks or activities under this milestoneId, remove the milestoneId
        if (!hasOtherTasksInMilestone) {
          latestTasks = latestTasks.filter(
            (task) => task.milestoneId !== milestoneId
          );
        }
      }
    }

    // Step 4: Save updated tasks and update the subject
    this.storageService.set('unlockedTasks', latestTasks);
    this._unlockedTasksSubject.next(latestTasks);

    return removedTasks;
  }

  // Method to transform and deduplicate the data
  transformAndDeduplicate(data) {
    const uniqueEntries = new Map();

    data.forEach(item => {
      // Construct a unique key for each combination of milestoneId and activityId
      const key = `${item.model}_${item.model_id}`;
      if (!uniqueEntries.has(key)) {
        uniqueEntries.set(key, {
          milestoneId: item.model === "Milestone" ? item.model_id : undefined,
          activityId: item.model === "Activity" ? item.model_id : undefined,
          taskId: item.model === "Task" ? item.model_id : undefined,
        });
      }
    });

    // Convert the map values to an array
    return Array.from(uniqueEntries.values());
  }
}
