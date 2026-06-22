import { TestBed } from "@angular/core/testing";
import { BrowserStorageService } from "@v3/services/storage.service";

import {
  UnlockedTask,
  UnlockIndicatorService,
} from "./unlock-indicator.service";
import { of, throwError } from "rxjs";

describe("UnlockIndicatorService", () => {
  let service: UnlockIndicatorService;
  let storageService: jasmine.SpyObj<BrowserStorageService>;

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj("BrowserStorageService", [
      "get",
      "set",
      "remove",
    ]);
    TestBed.configureTestingModule({
      providers: [
        UnlockIndicatorService,
        { provide: BrowserStorageService, useValue: storageSpy },
      ],
    });
    service = TestBed.inject(UnlockIndicatorService);
    storageService = TestBed.inject(
      BrowserStorageService
    ) as jasmine.SpyObj<BrowserStorageService>;
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  function setTasks(tasks: UnlockedTask[]): void {
    service["_unlockedTasksSubject"].next(tasks);
  }

  describe("stored state and basic queries", () => {
    it("should restore stored tasks when constructed", () => {
      const stored = [{ taskId: 1, activityId: 2 }];
      const storage = jasmine.createSpyObj<BrowserStorageService>("BrowserStorageService", ["get"]);
      storage.get.and.returnValue(stored);

      const restoredService = new UnlockIndicatorService(storage);

      expect(restoredService.allUnlockedTasks()).toEqual(stored);
      expect(storage.get).toHaveBeenCalledWith("unlockedTasks");
    });

    it("should filter tasks by activity and milestone", () => {
      setTasks([
        { taskId: 1, activityId: 10, milestoneId: 100 },
        { taskId: 2, activityId: 20, milestoneId: 100 },
        { taskId: 3, activityId: 10, milestoneId: 200 },
      ]);

      expect(service.getTasksByActivityId(10).map(task => task.taskId)).toEqual([1, 3]);
      expect(service.getTasksByMilestoneId(100).map(task => task.taskId)).toEqual([1, 2]);
    });

    it("should report activity and milestone clearability", () => {
      setTasks([
        { activityId: 10 },
        { milestoneId: 100 },
      ]);

      expect(service.isActivityClearable(10)).toBeTrue();
      expect(service.isMilestoneClearable(100)).toBeTrue();

      setTasks([
        { activityId: 10, taskId: 1 },
        { milestoneId: 100, activityId: 10 },
      ]);

      expect(service.isActivityClearable(10)).toBeFalse();
      expect(service.isMilestoneClearable(100)).toBeFalse();
    });

    it("should clear every task from storage and the observable state", () => {
      setTasks([{ taskId: 1 }]);

      service.clearAllTasks();

      expect(storageService.remove).toHaveBeenCalledWith("unlockedTasks");
      expect(service.allUnlockedTasks()).toEqual([]);
    });

    it("should clear and return entries for one activity", () => {
      const activityTasks = [{ id: 1, activityId: 10 }, { id: 2, activityId: 10 }];
      const remaining = { id: 3, activityId: 20 };
      setTasks([...activityTasks, remaining]);

      expect(service.clearByActivityId(10)).toEqual(activityTasks);
      expect(service.allUnlockedTasks()).toEqual([remaining]);
      expect(storageService.set).toHaveBeenCalledWith("unlockedTasks", [remaining]);
    });

    it("should clear and return entries for one milestone", () => {
      const milestoneTasks = [{ id: 1, milestoneId: 10 }, { id: 2, milestoneId: 10 }];
      const remaining = { id: 3, milestoneId: 20 };
      setTasks([...milestoneTasks, remaining]);

      expect(service.clearByMilestoneId(10)).toEqual(milestoneTasks);
      expect(service.allUnlockedTasks()).toEqual([remaining]);
      expect(storageService.set).toHaveBeenCalledWith("unlockedTasks", [remaining]);
    });
  });

  describe("duplicate and orphan cleanup", () => {
    it("should find exact, suffixed, and prefixed duplicate identifiers", () => {
      const todoItems = [
        { id: 1, identifier: "Task-30" },
        { id: 2, identifier: "Task-30-1" },
        { id: 3, identifier: "Task-30-extra" },
        { id: 4, identifier: "Other-40" },
      ];

      expect(service.findDuplicateTodoItems(todoItems, { identifier: "Task-30" }))
        .toEqual(todoItems.slice(0, 3));
    });

    it("should clear milestone entries and deduplicate TodoItems to mark", () => {
      const unlocks = [
        { id: 1, milestoneId: 10, identifier: "Milestone-10" },
        { id: 2, milestoneId: 10, identifier: "Milestone-10-1" },
        { id: 3, milestoneId: 20, identifier: "Milestone-20" },
      ];
      const todoItems = [
        { id: 11, identifier: "Milestone-10" },
        { id: 12, identifier: "Milestone-10-2" },
      ];
      setTasks(unlocks);

      const result = service.clearByMilestoneIdWithDuplicates(10, todoItems);

      expect(result.clearedUnlocks).toEqual(unlocks.slice(0, 2));
      expect(result.duplicatesToMark).toEqual(todoItems);
      expect(service.allUnlockedTasks()).toEqual([unlocks[2]]);
    });

    it("should cascade activity cleanup to a now-clearable milestone", () => {
      const unlocks = [
        { id: 1, milestoneId: 10, identifier: "Milestone-10" },
        { id: 2, milestoneId: 10, activityId: 20, identifier: "Activity-20" },
        { id: 3, milestoneId: 10, activityId: 20, taskId: 30, identifier: "Task-30" },
        { id: 4, milestoneId: 99, identifier: "Milestone-99" },
      ];
      const todoItems = [
        { id: 11, identifier: "Activity-20" },
        { id: 12, identifier: "Task-30" },
        { id: 13, identifier: "Milestone-10" },
      ];
      setTasks(unlocks);

      const result = service.clearByActivityIdWithDuplicates(20, todoItems);

      expect(result.clearedUnlocks).toEqual(unlocks.slice(1, 3));
      expect(result.duplicatesToMark).toEqual(todoItems.slice(0, 2));
      expect(result.cascadeMilestones).toEqual([{
        milestoneId: 10,
        duplicatesToMark: [todoItems[2]],
      }]);
      expect(service.allUnlockedTasks()).toEqual([unlocks[3]]);
    });

    it("should remove orphaned indicators while retaining API-backed entries", () => {
      const orphan = { id: 1, identifier: "orphan" };
      const validById = { id: 2, identifier: "old-id" };
      const validByIdentifier = { id: 3, identifier: "still-present" };
      setTasks([orphan, validById, validByIdentifier]);
      spyOn(console, "log");

      const result = service.cleanupOrphanedIndicators([
        { id: 2, identifier: "new-id" },
        { id: 999, identifier: "still-present" },
      ]);

      expect(result).toEqual([orphan]);
      expect(service.allUnlockedTasks()).toEqual([validById, validByIdentifier]);
      expect(storageService.set).toHaveBeenCalled();
    });

    it("should not write storage when there are no orphaned indicators", () => {
      setTasks([{ id: 1, identifier: "valid" }]);

      expect(service.cleanupOrphanedIndicators([{ id: 1, identifier: "valid" }])).toEqual([]);
      expect(storageService.set).not.toHaveBeenCalled();
    });
  });

  describe("related indicator matching", () => {
    beforeEach(() => {
      setTasks([
        { id: 1, milestoneId: 100, identifier: "Milestone-100" },
        { id: 2, milestoneId: 100, activityId: 20, identifier: "Activity-20" },
        { id: 3, milestoneId: 100, activityId: 20, taskId: 30, identifier: "Task-30" },
        { id: 4, taskId: 40, identifier: "Task-40" },
        { id: 5, identifier: "Related-Task-50" },
        { id: 6, identifier: "meta", meta: { task_id: 50, task_type: "topic" } },
      ]);
    });

    it("should match activity relationships directly and through task hierarchy", () => {
      expect(service.findRelatedIndicators("activity", 20).map(task => task.id)).toEqual([2, 3]);
    });

    it("should match milestone relationships across its hierarchy", () => {
      expect(service.findRelatedIndicators("milestone", 100).map(task => task.id)).toEqual([1, 2, 3]);
    });

    it("should match task ids, identifier patterns, and metadata", () => {
      expect(service.findRelatedIndicators("task", 50).map(task => task.id)).toEqual([5, 6]);
      expect(service.findRelatedIndicators("task", 40).map(task => task.id)).toEqual([4]);
    });

    it("should return no matches for an unsupported entity type", () => {
      expect(service.findRelatedIndicators("unknown" as any, 1)).toEqual([]);
    });

    it("should persist the remaining state when related indicators are cleared", () => {
      const removed = service.clearRelatedIndicators("activity", 20);

      expect(removed.map(task => task.id)).toEqual([2, 3]);
      expect(service.allUnlockedTasks().map(task => task.id)).toEqual([1, 4, 5, 6]);
      expect(storageService.set).toHaveBeenCalledWith("unlockedTasks", service.allUnlockedTasks());
    });
  });

  describe("activity mapping and transformations", () => {
    it("should return unlocks belonging to an activity task list", () => {
      setTasks([{ taskId: 1 }, { taskId: 2 }, { taskId: 3 }]);

      expect(service.getTasksByActivity({ tasks: [{ id: 1 }, { id: 3 }] } as any))
        .toEqual([{ taskId: 1 }, { taskId: 3 }]);
    });

    it("should reject activities without tasks", () => {
      expect(() => service.getTasksByActivity({ tasks: [] } as any))
        .toThrowError("No tasks found in the activity");
    });

    it("should append unique unlocks and discard duplicate hierarchy entries", () => {
      const existing = { milestoneId: 1, activityId: 2, taskId: 3, identifier: "old" };
      const duplicate = { ...existing, identifier: "new" };
      const added = { milestoneId: 1, activityId: 2, taskId: 4 };
      setTasks([existing]);

      service.unlockTasks([duplicate, added]);

      expect(service.allUnlockedTasks()).toEqual([existing, added]);
      expect(storageService.set).toHaveBeenCalledWith("unlockedTasks", [existing, added]);
    });

    it("should transform supported models and deduplicate model/id pairs", () => {
      expect(service.transformAndDeduplicate([
        { model: "Milestone", model_id: 1 },
        { model: "Milestone", model_id: 1 },
        { model: "Activity", model_id: 2 },
        { model: "Task", model_id: 3 },
      ])).toEqual([
        { milestoneId: 1, activityId: undefined, taskId: undefined },
        { milestoneId: undefined, activityId: 2, taskId: undefined },
        { milestoneId: undefined, activityId: undefined, taskId: 3 },
      ]);
    });
  });

  describe("markDuplicatesAsDone", () => {
    it("should mark direct, cascaded, and fallback TodoItems", () => {
      const notifications = jasmine.createSpyObj("NotificationsService", [
        "markMultipleTodoItemsAsDone",
        "markTodoItemAsDone",
      ]);
      notifications.markMultipleTodoItemsAsDone.and.returnValues(
        [of({ success: "direct" })],
        [of({ success: "cascade" })],
      );
      notifications.markTodoItemAsDone.and.returnValue(of({ success: "fallback" }));
      spyOn(console, "log");

      service.markDuplicatesAsDone({
        duplicatesToMark: [{ id: 1, identifier: "Activity-1" }],
        cascadeMilestones: [{
          milestoneId: 10,
          duplicatesToMark: [{ id: 2, identifier: "Milestone-10" }],
        }],
        clearedUnlocks: [{ id: 3, identifier: "Task-3" }],
      }, notifications as any);

      expect(notifications.markMultipleTodoItemsAsDone).toHaveBeenCalledTimes(2);
      expect(notifications.markTodoItemAsDone).toHaveBeenCalledWith({ id: 3, identifier: "Task-3" });
    });

    it("should handle marking errors without throwing", () => {
      const notifications = jasmine.createSpyObj("NotificationsService", [
        "markMultipleTodoItemsAsDone",
        "markTodoItemAsDone",
      ]);
      notifications.markMultipleTodoItemsAsDone.and.returnValues(
        [throwError(() => new Error("direct"))],
        [throwError(() => new Error("cascade"))],
      );
      notifications.markTodoItemAsDone.and.returnValue(throwError(() => new Error("fallback")));
      spyOn(console, "log");
      spyOn(console, "error");

      expect(() => service.markDuplicatesAsDone({
        duplicatesToMark: [{ id: 1, identifier: "Activity-1" }],
        cascadeMilestones: [{
          milestoneId: 10,
          duplicatesToMark: [{ id: 2, identifier: "Milestone-10" }],
        }],
        clearedUnlocks: [{ id: 3, identifier: "Task-3" }],
      }, notifications as any)).not.toThrow();

      expect(console.error).toHaveBeenCalledTimes(3);
    });
  });

  describe("removeTasks", () => {
    it("should remove a specific task by taskId", () => {
      const initialTasks: UnlockedTask[] = [
        { id: 1, identifier: "task1", taskId: 101 },
        { id: 2, identifier: "task2", taskId: 102 },
      ];
      storageService.get.and.returnValue(initialTasks);
      service["_unlockedTasksSubject"].next(initialTasks);

      const removedTasks = service.removeTasks(101);

      expect(removedTasks.length).toBe(1);
      expect(removedTasks[0].taskId).toBe(101);
      expect(service.allUnlockedTasks().length).toBe(1);
      expect(service.allUnlockedTasks()[0].taskId).toBe(102);
      expect(storageService.set).toHaveBeenCalledWith("unlockedTasks", [
        { id: 2, identifier: "task2", taskId: 102 },
      ]);
    });

    it("should remove the associated activityId if no other tasks are under it", () => {
      const initialTasks: UnlockedTask[] = [
        { id: 1, identifier: "task1", taskId: 101, activityId: 201 },
        { id: 2, identifier: "task2", taskId: 102, activityId: 202 },
      ];
      storageService.get.and.returnValue(initialTasks);
      service["_unlockedTasksSubject"].next(initialTasks);

      const removedTasks = service.removeTasks(101);

      expect(removedTasks.length).toBe(1);
      expect(removedTasks[0].taskId).toBe(101);
      expect(service.allUnlockedTasks().length).toBe(1);
      expect(service.allUnlockedTasks()[0].taskId).toBe(102);
      expect(service.allUnlockedTasks()[0].activityId).toBe(202);
      expect(storageService.set).toHaveBeenCalledWith("unlockedTasks", [
        { id: 2, identifier: "task2", taskId: 102, activityId: 202 },
      ]);
    });

    it("should remove the associated milestoneId if no other tasks or activities are under it", () => {
      const initialTasks: UnlockedTask[] = [
        {
          id: 1,
          identifier: "task1",
          taskId: 101,
          activityId: 201,
          milestoneId: 301,
        },
        {
          id: 2,
          identifier: "task2",
          taskId: 102,
          activityId: 202,
          milestoneId: 302,
        },
      ];
      storageService.get.and.returnValue(initialTasks);
      service["_unlockedTasksSubject"].next(initialTasks);

      const removedTasks = service.removeTasks(101);

      expect(removedTasks.length).toBe(1);
      expect(removedTasks[0].taskId).toBe(101);
      expect(service.allUnlockedTasks().length).toBe(1);
      expect(service.allUnlockedTasks()[0].taskId).toBe(102);
      expect(service.allUnlockedTasks()[0].milestoneId).toBe(302);
      expect(storageService.set).toHaveBeenCalledWith("unlockedTasks", [
        {
          id: 2,
          identifier: "task2",
          taskId: 102,
          activityId: 202,
          milestoneId: 302,
        },
      ]);
    });

    it("should update the storage and the BehaviorSubject correctly", () => {
      const initialTasks: UnlockedTask[] = [
        { id: 1, identifier: "task1", taskId: 101 },
        { id: 2, identifier: "task2", taskId: 102 },
      ];
      storageService.get.and.returnValue(initialTasks);
      service["_unlockedTasksSubject"].next(initialTasks);

      service.removeTasks(101);

      expect(service.allUnlockedTasks().length).toBe(1);
      expect(service.allUnlockedTasks()[0].taskId).toBe(102);
      expect(storageService.set).toHaveBeenCalledWith("unlockedTasks", [
        { id: 2, identifier: "task2", taskId: 102 },
      ]);
    });
  });
});
