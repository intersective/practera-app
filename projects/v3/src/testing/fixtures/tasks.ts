// filepath: /Users/chaw/Workspaces/www/intersective/app-ionic7/projects/v3/src/testing/fixtures/tasks.ts
import { Activity, Task } from '@v3/app/services/activity.service';
import { UnlockConditionMeta } from '@v3/app/services/home.service';

const Activity = {
    "data": {
        "activity": {
            "id": 11634,
            "name": "Introduction to ON",
            "description": "In this activity, you will see an Introduction to the ON Accelerator, understand how teams work in the program, and how they translate challenges into opportunities. It provides the relevant background and context information to get you ready for this program.",
            "tasks": [
                {
                    "id": 36971,
                    "name": "Canva bells the cat on private assets",
                    "type": "topic",
                    "isLocked": false,
                    "isTeam": false,
                    "deadline": null,
                    "contextId": null,
                    "status": {
                        "status": "done",
                        "isLocked": null,
                        "submitterName": null,
                        "submitterImage": null,
                        "__typename": "TaskStatus"
                    },
                    "__typename": "Task"
                },
              // remaining tasks...
            ],
        // Adding unlockConditions to fix the error
        "unlockConditions": [],
            "__typename": "Activity"
        }
    }
};

// This is used in normalizing a task for testing
export const NormalisedTaskFixture: Task = {
  id: 1,
  type: 'Topic',
  name: 'Test Topic',
  status: '',
  // Optional fields
  contextId: null,
  isForTeam: false,
  dueDate: null,
  isOverdue: false,
  isDueToday: false,
  isLocked: false,
  submitter: null,
  assessmentType: null,
};

// Creating a proper Activity object that includes the required unlockConditions property
export const NormalizedActivityFixture: Activity = {
  id: 1,
  name: 'Test Activity',
  description: 'Activity Description',
  tasks: [NormalisedTaskFixture],
  unlockConditions: [
    {
      name: 'test condition',
      action: 'test action',
      meta: {} as UnlockConditionMeta
    }
  ]
};

export const TaskFixture = Activity;
