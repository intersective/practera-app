import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DemoService {


  image = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2252&q=80';

  description = `Practera is the leading platform to power high quality experiential learning programs.<br/><br/>Deliver experiential learning programs at larger scale and lower cost<br/>Customisable platform to author, launch & manage programs<br/>Connect students to industry projects, internships & experiences<br/>Expert course design, configuration and deployment services<br/><br/>Deliver experiential learning programs at larger scale and lower cost<br/>Customisable platform to author, launch & manage programs<br/>Connect students to industry projects, internships & experiences<br/>Expert course design, configuration and deployment services<br/><br/>Deliver experiential learning programs at larger scale and lower cost<br/>Customisable platform to author, launch & manage programs<br/>Connect students to industry projects, internships & experiences<br/>Expert course design, configuration and deployment services<br/><br/>Deliver experiential learning programs at larger scale and lower cost<br/>Customisable platform to author, launch & manage programs<br/>Connect students to industry projects, internships & experiences<br/>Expert course design, configuration and deployment services`;

  constructor() { }

  get experience() {
    return {
      image: this.image,
      name: 'Welcome to the Global Trade Accelerator',
      description: this.description
    }
  }

  get milestones() {
    return [
      {
        id: 1,
        name: 'Get Started',
        isLocked: false,
        description: 'This contain some starting activities',
        activities: [
          {
            id: 11,
            name: 'Welcome to the Global Trade Accelerator',
            isLocked: false,
            leadImage: this.image
          },
          {
            id: 12,
            name: 'Introduction to Experiential Learning',
            isLocked: false,
            leadImage: this.image
          },
          {
            id: 13,
            name: 'The First Client Meeting',
            isLocked: false,
            leadImage: this.image
          }
        ]
      },
      {
        id: 2,
        name: 'Second Section',
        isLocked: false,
        description: 'This contain some other activities',
        activities: [
          {
            id: 21,
            name: 'The Second Client Meeting',
            isLocked: false,
            leadImage: this.image
          },
          {
            id: 22,
            name: 'This is a locked activity',
            isLocked: true,
            leadImage: this.image
          }
        ]
      },
      {
        id: 3,
        name: 'Third Section',
        isLocked: true,
        description: 'This contain some more activities'
      }
    ]
  }

  get projectProgress() {
    return {
      progress: 0.65,
      milestones: [
        {
          id: 1,
          activities: [
            {
              id: 11,
              progress: 1
            },
            {
              id: 12,
              progress: 0.8
            },
            {
              id: 13,
              progress: 0
            }
          ]
        },
        {
          id: 2,
          activities: [
            {
              id: 21,
              progress: 0.5
            },
            {
              id: 22,
              progress: 0
            }
          ]
        }
      ]
    }
  }

  get achievements() {
    return Array(5).fill(1).map((v, i) => ({
      id: i + 1,
      name: `Badge${ i + 1 }`,
      description: `Badge description${ i + 1 }`,
      image: 'https://www.filepicker.io/api/file/Pt5V84aSTvyYEil1bttc',
      points: Math.floor(Math.random() * 1000),
      isEarned: i < 3,
      earnedDate: '2021-10-04 05:44:49'
    }));
  }

  get notifications() {
    return [
      {
        id: 1,
        title: 'notification 1',
      },
    ];
  }

  assessment() {
    return of({
      "data": {
        "assessment": {
          "name": "Here is a sample feedback loop - automated from start to finish",
          "type": "moderated",
          "description": "Enrol a test expert and a learner user, put them into a team and see the magic happen! Login as the learner, submit the assessment and complete the feedback loop by impersonating the expert!",
          "dueDate": null,
          "isTeam": true,
          "pulseCheck": true,
          "groups": [
            {
              "name": "Question group 1",
              "description": "",
              "questions": [
                {
                  "id": 89437,
                  "name": "Multiple choice example",
                  "description": "",
                  "type": "oneof",
                  "isRequired": false,
                  "hasComment": false,
                  "audience": [
                    "reviewer",
                    "submitter"
                  ],
                  "fileType": null,
                  "choices": [
                    {
                      "id": 285795,
                      "name": "Choice 1",
                      "explanation": null,
                      "description": "",
                      "__typename": "AssessmentChoice"
                    },
                    {
                      "id": 285796,
                      "name": "Choice 2",
                      "explanation": null,
                      "description": "",
                      "__typename": "AssessmentChoice"
                    },
                    {
                      "id": 285797,
                      "name": "Choice 3",
                      "explanation": null,
                      "description": "",
                      "__typename": "AssessmentChoice"
                    }
                  ],
                  "teamMembers": null,
                  "__typename": "AssessmentQuestion"
                },
                {
                  "id": 89438,
                  "name": "upload any file here to test the loop",
                  "description": "",
                  "type": "file",
                  "isRequired": true,
                  "hasComment": false,
                  "audience": [
                    "submitter"
                  ],
                  "fileType": "any",
                  "choices": null,
                  "teamMembers": null,
                  "__typename": "AssessmentQuestion"
                }
              ],
              "__typename": "AssessmentGroup"
            }
          ],
          "submissions": [],
          "__typename": "Assessment"
        }
      }
    });
  }
}
