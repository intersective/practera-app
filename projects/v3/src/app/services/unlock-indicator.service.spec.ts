import { TestBed } from "@angular/core/testing";
import { BrowserStorageService } from "@v3/services/storage.service";

import {
  UnlockedTask,
  UnlockIndicatorService,
} from "./unlock-indicator.service";

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

  describe("removeTasks", () => {
    it("should remove a specific task by taskId", () => {
      const initialTasks: UnlockedTask[] = [
        { id: 1, identifier: "task1", taskId: 101 },
        { id: 2, identifier: "task2", taskId: 102 },
      ];
      storageService.get.and.returnValue(initialTasks);
      service["_unlockedTasksSubject$"].next(initialTasks);

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
      service["_unlockedTasksSubject$"].next(initialTasks);

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
      service["_unlockedTasksSubject$"].next(initialTasks);

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
      service["_unlockedTasksSubject$"].next(initialTasks);

      service.removeTasks(101);

      expect(service.allUnlockedTasks().length).toBe(1);
      expect(service.allUnlockedTasks()[0].taskId).toBe(102);
      expect(storageService.set).toHaveBeenCalledWith("unlockedTasks", [
        { id: 2, identifier: "task2", taskId: 102 },
      ]);
    });
  });
});
