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

  get activity() {
    return {
      id: 1,
      name: "This is the activity name",
      description: 'This is the description of the activity',
      tasks: [
        {
          id: 1,
          name: "1st topic",
          type: "topic",
          status: "done",
        },
        {
          id: 2,
          name: "2nd topic",
          type: "topic",
          status: "",
        },
        {
          id: 21,
          name: "in progress feedback",
          type: "assessment",
          isLocked: false,
          isForTeam: true,
          isOverdue: false,
          isDueToday: false,
          dueDate: null,
          contextId: 16881,
          status: "in progress",
        },
        {
          id: 22,
          name: "duedate feedback",
          type: "assessment",
          isLocked: false,
          isForTeam: true,
          isOverdue: false,
          isDueToday: false,
          dueDate: '2022-03-05 15:00:00',
          contextId: 16881,
          status: "",
        },
        {
          id: 23,
          name: "due today feedback",
          type: "assessment",
          isLocked: false,
          isForTeam: true,
          isOverdue: false,
          isDueToday: true,
          dueDate: '2022-03-05 15:00:00',
          contextId: 16881,
          status: "",
        },
        {
          id: 24,
          name: "overdue feedback",
          type: "assessment",
          isLocked: false,
          isForTeam: true,
          isOverdue: true,
          isDueToday: false,
          dueDate: '2022-03-05 15:00:00',
          contextId: 16881,
          status: "",
        },
        {
          id: 31,
          name: "pending review feedback",
          type: "assessment",
          isLocked: false,
          isForTeam: true,
          isOverdue: false,
          isDueToday: true,
          dueDate: '2022-03-03 15:00:00',
          contextId: 16881,
          status: "pending review",
        },
        {
          id: 32,
          name: "feedback available feedback",
          type: "assessment",
          isLocked: false,
          isForTeam: true,
          isOverdue: false,
          isDueToday: false,
          dueDate: '2022-03-05 15:00:00',
          contextId: 16881,
          status: "feedback available",
        },
        {
          id: 33,
          name: "done feedback",
          type: "assessment",
          isLocked: false,
          isForTeam: true,
          isOverdue: false,
          isDueToday: false,
          dueDate: '2022-03-05 15:00:00',
          contextId: 16881,
          status: "done",
        },
        {
          id: 4,
          type: 'Locked',
          name: 'Locked'
        }
      ]
    };
  }

  get programs() {
    return [
      {
        enrolment: {
          contact_number: null
        },
        program: {
          id: 1,
          experience_id: 1,
          name: 'Global Trade Accelerator - 01',
          config: {
            theme_color: '#2bbfd4',
            card_style: 'waves-light.png',
            review_rating: true,
            truncate_description: true
          }
        },
        project: {
          id: 1,
          lead_image: 'https://cdn.filestackcontent.com/urFIZW6TuC9lujp0N3PD'
        },
        timeline: {
          id: 1
        },
        experience: {
          id: 1,
          config: {
            primary_color: '#2bc1d9',
            secondary_color: '#9fc5e8',
            email_template: 'email_1',
            card_url: 'https://cdn.filestackcontent.com/uYxes8YBS2elXV0m2yjA',
            manual_url: 'https://www.filepicker.io/api/file/lNQp4sFcTjGj2ojOm1fR',
            design_url: 'https://www.filepicker.io/api/file/VuL71nOUSiM9NoNuEIhS',
            overview_url: 'https://vimeo.com/325554048'
          },
          lead_url: 'https://cdn.filestackcontent.com/urFIZW6TuC9lujp0N3PD',
          support_email: 'help@practera.com'
        }
      },
      {
        enrolment: {
          contact_number: null
        },
        program: {
          id: 2,
          experience_id: 1,
          name: 'Global Trade Accelerator - 02',
          config: {
            theme_color: '#2bbfd4',
            card_style: 'waves-light.png',
            review_rating: true,
            truncate_description: true
          }
        },
        project: {
          id: 2,
          lead_image: null
        },
        timeline: {
          id: 1
        },
        experience: {
          id: 1,
          config: {
            primary_color: '#2bc1d9',
            secondary_color: '#9fc5e8',
            email_template: 'email_1',
            card_url: 'https://cdn.filestackcontent.com/uYxes8YBS2elXV0m2yjA',
            manual_url: 'https://www.filepicker.io/api/file/lNQp4sFcTjGj2ojOm1fR',
            design_url: 'https://www.filepicker.io/api/file/VuL71nOUSiM9NoNuEIhS',
            overview_url: 'https://vimeo.com/325554048'
          },
          lead_url: 'https://www.filepicker.io/api/file/ASbKEZs7R0yt4sGEfSMs',
          support_email: 'help@practera.com'
        }
      },
      {
        enrolment: {
          contact_number: null
        },
        program: {
          id: 3,
          experience_id: 1,
          name: 'Global Trade Accelerator - 03',
          config: {
            theme_color: '#2bbfd4',
            card_style: 'waves-light.png',
            review_rating: true,
            truncate_description: true
          }
        },
        project: {
          id: 3,
          lead_image: 'https://cdn.filestackcontent.com/EF0cRcRUuvKqg8r4X0Hg'
        },
        timeline: {
          id: 1
        },
        experience: {
          id: 1,
          config: {
            primary_color: '#2bc1d9',
            secondary_color: '#9fc5e8',
            email_template: 'email_1',
            card_url: 'https://cdn.filestackcontent.com/uYxes8YBS2elXV0m2yjA',
            manual_url: 'https://www.filepicker.io/api/file/lNQp4sFcTjGj2ojOm1fR',
            design_url: 'https://www.filepicker.io/api/file/VuL71nOUSiM9NoNuEIhS',
            overview_url: 'https://vimeo.com/325554048'
          },
          lead_url: 'https://cdn.filestackcontent.com/EF0cRcRUuvKqg8r4X0Hg',
          support_email: 'help@practera.com'
        }
      }
    ]
  }

  get projectsProgress() {
    return [
      {
        id: 1,
        progress: 0.4,
        todoItems: 4
      },
      {
        id: 2,
        progress: 0,
        todoItems: 1
      },
      {
        id: 3,
        progress: 0.8,
        todoItems: 0
      }
    ]
  }

  get myInfo() {
    return {
      name: 'test user',
      email: 'test@abcd.com',
      image: 'https://swapnil2597.github.io/assets/img/profile.png',
      role: 'participent',
      contactNumber: '',
      userHash: '1234#asdwdd'
    }
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
