import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BrowserStorageService } from './storage.service';

export interface UnlockedTask {
  milestoneId?: number;
  activityId?: number;
  taskId?: number;
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

  unlockTasks(data: UnlockedTask[]) {
    const currentTasks = this.unlockedTasksSubject.getValue();
    const latestTasks = [...currentTasks, ...data];

    this.storageService.set('unlockedTasks', latestTasks);
    this.unlockedTasksSubject.next(latestTasks);
  }

  // Method to add a new unlocked task
  unlockTask(milestoneId: number, activityId: number, taskId: number) {
    const currentTasks = this.unlockedTasksSubject.getValue();
    const latestTasks = [...currentTasks, { milestoneId, activityId, taskId }];
    
    this.storageService.set('unlockedTasks', latestTasks);
    this.unlockedTasksSubject.next(latestTasks);
  }

  // Method to remove an accessed task
  removeTask(milestoneId?: number, activityId?: number, taskId?: number) {
    let currentTasks = this.unlockedTasksSubject.getValue();

    if (currentTasks.some(task => task.taskId === taskId)) {
      currentTasks = currentTasks.filter(task => task.taskId !== taskId);
    }

    this.storageService.set('unlockedTasks', currentTasks);
    this.unlockedTasksSubject.next(currentTasks);
  }

  // Method to reset the unlocked tasks
  resetTasks() {
    this.storageService.set('unlockedTasks', []);
    this.unlockedTasksSubject.next([]);
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
