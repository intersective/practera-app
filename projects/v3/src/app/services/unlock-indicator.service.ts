import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BrowserStorageService } from './storage.service';
import { Activity } from './activity.service';

export interface UnlockedTask {
  id: number;
  identifier: string;
  milestoneId?: number;
  activityId?: number;
  taskId?: number;
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

    const clearedActivity = currentTasks.filter(task => task.activityId === id || task.milestoneId === id);
    const latestTasks = currentTasks.filter(task => task.activityId !== id && task.milestoneId !== id);

    this.storageService.set('unlockedTasks', latestTasks);
    this._unlockedTasksSubject.next(latestTasks);

    return clearedActivity;
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

  // Merge the saved tasks with the fresh data and preserve it.
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
    this._unlockedTasksSubject.next(latestTasks);
  }

  // Method to remove an accessed tasks
  // (some tasks are repeatable due to unlock from different level of trigger eg. by milestone, activity, task)
  removeTasks(taskId?: number): UnlockedTask[] {
    const currentTasks = this._unlockedTasksSubject.getValue();
    const removedTask = currentTasks.filter(task => task.taskId === taskId);
    const latestTasks = currentTasks.filter(task => task.taskId !== taskId);
    this.storageService.set('unlockedTasks', latestTasks);
    this._unlockedTasksSubject.next(latestTasks);
    return removedTask;
  }

  // Method to transform and deduplicate the data
  transformAndDeduplicateTodoItem(data) {
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
