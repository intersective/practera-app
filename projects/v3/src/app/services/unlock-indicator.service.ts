import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { BrowserStorageService } from './storage.service';
import type { Activity } from './activity.service';
import type { NotificationsService } from './notifications.service';

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
  private _unlockedTasksSubject = new BehaviorSubject<UnlockedTask[]>([]);
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
   * Clear all tasks related to a particular activity (explicit)
   * @param activityId
   */
  clearByActivityId(activityId: number): UnlockedTask[] {
    const current = this._unlockedTasksSubject.getValue();
    const cleared = current.filter(t => t.activityId === activityId);
    const latest = current.filter(t => t.activityId !== activityId);
    this.storageService.set('unlockedTasks', latest);
    this._unlockedTasksSubject.next(latest);
    return cleared;
  }

  /**
   * Enhanced clearing that handles duplicate TodoItems for same logical unlock
   * Returns both cleared localStorage entries AND all duplicate TodoItems that need API marking
   */
  clearByActivityIdWithDuplicates(activityId: number, currentTodoItems: {id: number, identifier: string}[]): {
    clearedUnlocks: UnlockedTask[],
    duplicatesToMark: {id: number, identifier: string}[],
    cascadeMilestones: {milestoneId: number, duplicatesToMark: {id: number, identifier: string}[]}[]
  } {
    const current = this._unlockedTasksSubject.getValue();
    const activityUnlocks = current.filter(t => t.activityId === activityId);

    // Find all duplicate TodoItems for each unlocked task
    let allDuplicatesToMark: {id: number, identifier: string}[] = [];

    activityUnlocks.forEach(unlockedTask => {
      const duplicates = this.findDuplicateTodoItems(currentTodoItems, unlockedTask);
      allDuplicatesToMark.push(...duplicates);
    });

    // Remove duplicates from the list
    allDuplicatesToMark = allDuplicatesToMark.filter((item, index, self) =>
      index === self.findIndex(t => t.id === item.id)
    );

    // Clear from localStorage
    const latest = current.filter(t => t.activityId !== activityId);
    this.storageService.set('unlockedTasks', latest);
    this._unlockedTasksSubject.next(latest);

    // Check for cascade milestone clearing
    const cascadeMilestones: {milestoneId: number, duplicatesToMark: {id: number, identifier: string}[]}[] = [];
    const affectedMilestones = new Set(activityUnlocks.map(t => t.milestoneId).filter(Boolean));

    affectedMilestones.forEach(milestoneId => {
      if (this.isMilestoneClearable(milestoneId)) {
        const milestoneResult = this.clearByMilestoneIdWithDuplicates(milestoneId, currentTodoItems);
        cascadeMilestones.push({
          milestoneId: milestoneId,
          duplicatesToMark: milestoneResult.duplicatesToMark
        });
      }
    });

    return {
      clearedUnlocks: activityUnlocks,
      duplicatesToMark: allDuplicatesToMark,
      cascadeMilestones: cascadeMilestones
    };
  }

  /**
   * Clear all tasks related to a particular milestone (explicit)
   * @param milestoneId
   */
  clearByMilestoneId(milestoneId: number): UnlockedTask[] {
    const current = this._unlockedTasksSubject.getValue();
    const cleared = current.filter(t => t.milestoneId === milestoneId);
    const latest = current.filter(t => t.milestoneId !== milestoneId);
    this.storageService.set('unlockedTasks', latest);
    this._unlockedTasksSubject.next(latest);
    return cleared;
  }

  /**
   * Enhanced milestone clearing that handles duplicate TodoItems
   */
  clearByMilestoneIdWithDuplicates(milestoneId: number, currentTodoItems: {id: number, identifier: string}[]): {
    clearedUnlocks: UnlockedTask[],
    duplicatesToMark: {id: number, identifier: string}[]
  } {
    const current = this._unlockedTasksSubject.getValue();
    const milestoneUnlocks = current.filter(t => t.milestoneId === milestoneId);

    // Find all duplicate TodoItems for each unlocked task
    let allDuplicatesToMark: {id: number, identifier: string}[] = [];

    milestoneUnlocks.forEach(unlockedTask => {
      const duplicates = this.findDuplicateTodoItems(currentTodoItems, unlockedTask);
      allDuplicatesToMark.push(...duplicates);
    });

    // Remove duplicates from the list
    allDuplicatesToMark = allDuplicatesToMark.filter((item, index, self) =>
      index === self.findIndex(t => t.id === item.id)
    );

    // Clear from localStorage
    const latest = current.filter(t => t.milestoneId !== milestoneId);
    this.storageService.set('unlockedTasks', latest);
    this._unlockedTasksSubject.next(latest);

    return {
      clearedUnlocks: milestoneUnlocks,
      duplicatesToMark: allDuplicatesToMark
    };
  }

  /**
   * Find related unlock indicators by entity type and id for robust cleanup
   * This method handles inaccurate data by using fuzzy matching
   */
  findRelatedIndicators(entityType: 'activity' | 'milestone' | 'task', entityId: number): UnlockedTask[] {
    const current = this._unlockedTasksSubject.getValue();

    switch (entityType) {
      case 'activity':
        // Find by activityId OR taskId that belongs to tasks in this activity
        return current.filter(t =>
          t.activityId === entityId ||
          (t.taskId && this._isTaskInActivity(t.taskId, entityId))
        );

      case 'milestone':
        // Find by milestoneId OR activityId/taskId that belongs to this milestone
        return current.filter(t =>
          t.milestoneId === entityId ||
          (t.activityId && this._isActivityInMilestone(t.activityId, entityId)) ||
          (t.taskId && this._isTaskInMilestone(t.taskId, entityId))
        );

      case 'task':
        // Find by taskId OR entries that should reference this task
        return current.filter(t =>
          t.taskId === entityId ||
          (t.id && this._isRelatedToTask(t, entityId))
        );

      default:
        return [];
    }
  }

  /**
   * Clear indicators with robust matching for inaccurate data
   */
  clearRelatedIndicators(entityType: 'activity' | 'milestone' | 'task', entityId: number): UnlockedTask[] {
    const current = this._unlockedTasksSubject.getValue();
    const toRemove = this.findRelatedIndicators(entityType, entityId);
    const latest = current.filter(t => !toRemove.includes(t));

    this.storageService.set('unlockedTasks', latest);
    this._unlockedTasksSubject.next(latest);

    return toRemove;
  }

  /**
   * Clean up orphaned unlock indicators that no longer exist in current TodoItem API response
   * This handles cases where localStorage has stale data that can't be marked as done via API
   */
  cleanupOrphanedIndicators(currentTodoItems: {id: number, identifier: string}[]): UnlockedTask[] {
    const current = this._unlockedTasksSubject.getValue();

    const validIds = new Set(currentTodoItems.map(item => item.id));
    const validIdentifiers = new Set(currentTodoItems.map(item => item.identifier));

    // Find orphaned entries that don't exist in current API response
    const orphaned = current.filter(unlockedTask => {
      // Check if this unlock indicator still exists in current TodoItem API response
      const existsById = validIds.has(unlockedTask.id);
      const existsByIdentifier = validIdentifiers.has(unlockedTask.identifier);

      // If neither ID nor identifier exists in current API, it's orphaned
      return !existsById && !existsByIdentifier;
    });

    if (orphaned.length > 0) {
      // Remove orphaned entries from localStorage
      const cleaned = current.filter(t => !orphaned.includes(t));
      this.storageService.set('unlockedTasks', cleaned);
      this._unlockedTasksSubject.next(cleaned);

      // eslint-disable-next-line no-console
      console.log(`Cleaned up ${orphaned.length} orphaned unlock indicators:`, orphaned);
    }

    return orphaned;
  }

  /**
   * Find and return all duplicate TodoItems for the same logical unlock
   * This handles cases where server creates multiple TodoItems for same unlocked item
   */
  findDuplicateTodoItems(currentTodoItems: {id: number, identifier: string}[], unlockedTask: UnlockedTask): {id: number, identifier: string}[] {
    // Group TodoItems by base identifier (without unique suffixes)
    const baseIdentifier = unlockedTask.identifier.replace(/-\d+$/, ''); // Remove trailing numbers if any

    // Find all TodoItems with similar identifiers or same logical unlock
    return currentTodoItems.filter(item => {
      // Match by exact identifier
      if (item.identifier === unlockedTask.identifier) return true;

      // Match by base identifier pattern (e.g., "NewItem-17432" matches "NewItem-17432-1", "NewItem-17432-2")
      const itemBaseIdentifier = item.identifier.replace(/-\d+$/, '');
      if (itemBaseIdentifier === baseIdentifier) return true;

      // Match by identifier prefix for same unlock event
      if (item.identifier.startsWith(baseIdentifier)) return true;

      return false;
    });
  }

  // fuzzy matching of unlock indicator todoItems
  private _isTaskInActivity(taskId: number, activityId: number): boolean {
    // Since we can't directly access the current activity synchronously,
    // we'll rely on the relationships stored in unlocked tasks (localstorage)
    const tasks = this._unlockedTasksSubject.getValue();

    // 1st: Check if direct relationship exists
    const hasDirectRelationship = tasks.some(t => t.taskId === taskId && t.activityId === activityId);
    if (hasDirectRelationship) {
      return true;
    }

    // 2nd approach: check if there are any tasks from this activity
    // and if this taskId appears in the same activity context
    const tasksInActivity = tasks.filter(t => t.activityId === activityId);
    return tasksInActivity.some(t => t.taskId === taskId);
  }

  private _isActivityInMilestone(activityId: number, milestoneId: number): boolean {
    const existingTasks = this._unlockedTasksSubject.getValue();
    return existingTasks.some(t => t.activityId === activityId && t.milestoneId === milestoneId);
  }

  private _isTaskInMilestone(taskId: number, milestoneId: number): boolean {
    const existingTasks = this._unlockedTasksSubject.getValue();

    // Method 1: Direct task-milestone relationship (if it exists)
    const directRelationship = existingTasks.some(t => t.taskId === taskId && t.milestoneId === milestoneId);
    if (directRelationship) {
      return true;
    }

    // Method 2: Task belongs to an activity that belongs to this milestone
    // Find tasks that have all three: taskId, activityId, and milestoneId
    const taskWithFullHierarchy = existingTasks.find(t =>
      t.taskId === taskId && t.activityId !== undefined && t.milestoneId === milestoneId
    );

    return !!taskWithFullHierarchy;
  }

  private _isRelatedToTask(unlockedTask: UnlockedTask, taskId: number): boolean {
    // Check if the unlocked task is somehow related to the given taskId
    // This could check identifier patterns, meta data, etc.
    return unlockedTask.identifier?.includes(`Task-${taskId}`) ||
           unlockedTask.meta?.task_id === taskId;
  }

  /**
   * Mark multiple duplicated TodoItems as done for clearing results
   */
  markDuplicatesAsDone(
    result: {
      duplicatesToMark: {id: number, identifier: string}[],
      cascadeMilestones?: {milestoneId: number, duplicatesToMark: {id: number, identifier: string}[]}[],
      clearedUnlocks?: UnlockedTask[]
    },
    notificationsService: NotificationsService, // pass in service to avoid circular dependency
    context: string = 'activity'
  ): void {
    // mark duplicated TodoItems as done (bulk operation)
    if (result.duplicatesToMark.length > 0) {
      const markingOps = notificationsService.markMultipleTodoItemsAsDone(result.duplicatesToMark);
      markingOps.forEach(op => op.pipe(first()).subscribe({
        // eslint-disable-next-line no-console
        next: (response) => console.log(`Marked duplicate ${context} TodoItem as done:`, response),
        // eslint-disable-next-line no-console
        error: (error) => console.error(`Failed to mark ${context} TodoItem as done:`, error)
      }));
    }

    // cascade to milestone clearing
    result.cascadeMilestones?.forEach(milestoneData => {
      if (milestoneData.duplicatesToMark.length > 0) {
        // eslint-disable-next-line no-console
        console.log(`Cascade clearing milestone ${milestoneData.milestoneId} with ${milestoneData.duplicatesToMark.length} duplicates`);
        const milestoneMarkingOps = notificationsService.markMultipleTodoItemsAsDone(milestoneData.duplicatesToMark);
        milestoneMarkingOps.forEach(op => op.pipe(first()).subscribe({
          // eslint-disable-next-line no-console
          next: (response) => console.log('Marked cascade milestone TodoItem as done:', response),
          // eslint-disable-next-line no-console
          error: (error) => console.error('Failed to mark cascade milestone TodoItem as done:', error)
        }));
      }
    });

    // Fallback: mark cleared localStorage items as done (for backward compatibility)
    result.clearedUnlocks?.forEach(todo => {
      notificationsService.markTodoItemAsDone(todo).pipe(first()).subscribe({
        // eslint-disable-next-line no-console
        next: (response) => console.log('Marked fallback TodoItem as done:', response),
        // eslint-disable-next-line no-console
        error: (error) => console.error('Failed to mark fallback TodoItem as done:', error)
      });
    });
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

  // transform and deduplicate the data
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

    // Convert to array
    return Array.from(uniqueEntries.values());
  }
}
