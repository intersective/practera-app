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
  private unlockedTasksSubject = new BehaviorSubject<UnlockedTask[]>([]);
  // Expose as an observable for components to subscribe
  public unlockedTasks$ = this.unlockedTasksSubject.asObservable();

  constructor(
    private storageService: BrowserStorageService,
  ) {
    const storedTasks = this.storageService.get('unlockedTasks');
    if (storedTasks) {
      this.unlockedTasksSubject.next(storedTasks);
    }
  }

  allUnlockedTasks(): UnlockedTask[] {
    return this.unlockedTasksSubject.getValue();
  }

  clearActivity(id) {
    const currentTasks = this.unlockedTasksSubject.getValue();
    const clearedActivity = currentTasks.filter(task => task.activityId === id);
    const latestTasks = currentTasks.filter(task => task.activityId !== id);
    this.storageService.set('unlockedTasks', latestTasks);
    this.unlockedTasksSubject.next(latestTasks);
    return clearedActivity;
  }

  getTasksBy(activity: Activity) {
    const tasks = activity.tasks;
    const tasksId = tasks.map(task => task.id);
    return this.unlockedTasksSubject.getValue().filter(unlocked => tasksId.includes(unlocked.taskId));
  }

  // check if the provided activity has matching newly unlocked task id
  hasNewTask(activity: Activity): boolean {
    const tasks = activity.tasks;
    const tasksId = tasks.map(task => task.id);
    return this.unlockedTasksSubject.getValue().some(unlocked => tasksId.includes(unlocked.taskId));
  }

  // combine the stored tasks with the new data and store it
  unlockTasks(data: UnlockedTask[]) {
    const currentTasks = this.unlockedTasksSubject.getValue();
    const latestTasks = [...currentTasks, ...data];

    this.storageService.set('unlockedTasks', latestTasks);
    this.unlockedTasksSubject.next(latestTasks);
  }

  // Method to add a new unlocked task (through todoitem meta)
  unlockTask(key: { id: number; identifier:string; milestoneId?: number; activityId?: number; taskId?: number;}) {
    const currentTasks = this.unlockedTasksSubject.getValue();
    const latestTasks = [...currentTasks, key];

    this.storageService.set('unlockedTasks', latestTasks);
    this.unlockedTasksSubject.next(latestTasks);
  }

  // Method to remove an accessed task
  removeTask(taskId?: number): UnlockedTask {
    const currentTasks = this.unlockedTasksSubject.getValue();
    const removedTask = currentTasks.find(task => task.taskId === taskId);
    const latestTasks = currentTasks.filter(task => task.taskId !== taskId);
    this.storageService.set('unlockedTasks', latestTasks);
    this.unlockedTasksSubject.next(latestTasks);
    return removedTask;
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
