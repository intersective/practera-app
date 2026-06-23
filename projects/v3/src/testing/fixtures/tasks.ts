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
                {
                    "id": 18620,
                    "name": "Introduction to the ON Accelerator testing",
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
                {
                    "id": 18621,
                    "name": "Wicked problems, global opportunity",
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
                {
                    "id": 18622,
                    "name": "The ON program experience",
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
                {
                    "id": 12369,
                    "name": "Group Moderated Feedback 1",
                    "type": "assessment",
                    "isLocked": false,
                    "isTeam": true,
                    "deadline": "2022-05-30 00:00:00",
                    "contextId": 17739,
                    "status": {
                        "status": "pending review",
                        "isLocked": false,
                        "submitterName": "expert_008_v3",
                        "submitterImage": "https://www.gravatar.com/avatar/2704bb8c2aa44f2c049ad5920f2527bf?d=https%3A%2F%2Fmy.practera.com%2Fimg%2Fuser-512.png&s=50",
                        "__typename": "TaskStatus"
                    },
                    "__typename": "Task"
                },
                {
                    "id": 12370,
                    "name": "Individual Moderated Assessment 1",
                    "type": "assessment",
                    "isLocked": false,
                    "isTeam": false,
                    "deadline": null,
                    "contextId": 17740,
                    "status": {
                        "status": "in progress",
                        "isLocked": false,
                        "submitterName": "learner 008 v3",
                        "submitterImage": "https://cdn.filestackcontent.com/Pj2pKuJ7QQa6IRQ7GXrU",
                        "__typename": "TaskStatus"
                    },
                    "__typename": "Task"
                },
                {
                    "id": 13083,
                    "name": "New individual assessment CORE-5496",
                    "type": "assessment",
                    "isLocked": false,
                    "isTeam": false,
                    "deadline": "2022-08-26 11:00:00",
                    "contextId": 19396,
                    "status": {
                        "status": "",
                        "isLocked": null,
                        "submitterName": null,
                        "submitterImage": null,
                        "__typename": "TaskStatus"
                    },
                    "__typename": "Task"
                },
                {
                    "id": 13082,
                    "name": "New group assessment CORE-5496",
                    "type": "assessment",
                    "isLocked": false,
                    "isTeam": true,
                    "deadline": "2022-09-01 22:00:00",
                    "contextId": 19395,
                    "status": {
                        "status": "",
                        "isLocked": null,
                        "submitterName": null,
                        "submitterImage": null,
                        "__typename": "TaskStatus"
                    },
                    "__typename": "Task"
                }
            ],
            "__typename": "Activity"
        }
    }
};

export const NormalisedTaskFixture = {
  id: 1,
  type: 'Topic',
  name: 'Test Topic',
  status: '',
  // contextId?: number,
  // isForTeam?: boolean,
  // dueDate?: string,
  // isOverdue?: boolean,
  // isDueToday?: boolean,
  // isLocked?: boolean,
  // submitter?: {
  //   name: string,
  //   image: string,
  // },
};

export const TaskFixture = Activity;
