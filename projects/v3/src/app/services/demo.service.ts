import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DemoService {

  image = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2252&q=80';

  description = `Practera is the leading platform to power high quality experiential learning programs.<br/><br/>Deliver experiential learning programs at larger scale and lower cost<br/>Customisable platform to author, launch & manage programs<br/>Connect students to industry projects, internships & experiences<br/>Expert course design, configuration and deployment services<br/><br/>Deliver experiential learning programs at larger scale and lower cost<br/>Customisable platform to author, launch & manage programs<br/>Connect students to industry projects, internships & experiences<br/>Expert course design, configuration and deployment services<br/><br/>Deliver experiential learning programs at larger scale and lower cost<br/>Customisable platform to author, launch & manage programs<br/>Connect students to industry projects, internships & experiences<br/>Expert course design, configuration and deployment services<br/><br/>Deliver experiential learning programs at larger scale and lower cost<br/>Customisable platform to author, launch & manage programs<br/>Connect students to industry projects, internships & experiences<br/>Expert course design, configuration and deployment services`;

  constructor() { }

  experience() {
    return of({
      data: {
        experience: {
          name: 'Welcome to the Global Trade Accelerator',
          description: this.description,
          leadImage: this.image,
        }
      }
    }).pipe(delay(1000));
  }

  milestones() {
    return of({
      data: {
        milestones: [
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
    }).pipe(delay(1000));
  }

  projectProgress() {
    return of({
      data: {
        project: {
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
    }).pipe(delay(1000));
  }

  get achievements() {
    return {
      data: Array(5).fill(1).map((v, i) => ({
        id: i + 1,
        name: `Badge${ i + 1 }`,
        description: `Badge description${ i + 1 }`,
        image: 'https://www.filepicker.io/api/file/Pt5V84aSTvyYEil1bttc',
        points: Math.floor(Math.random() * 1000),
        isEarned: i < 3,
        earnedDate: '2021-10-04 05:44:49'
      }))
    };
  }

  get notifications() {
    return [
      {
        id: 1,
        title: 'notification 1',
      },
    ];
  }

  activity(taskId?: number) {
    return of({
      data: {
        activity: {
          id: 1,
          name: "This is the activity name",
          description: 'This is the description of the activity',
          tasks: [
            {
              id: 1,
              name: "1st topic",
              type: 'Topic',
              status: {
                status: "done"
              },
            },
            {
              id: 2,
              name: "2nd topic",
              type: 'Topic',
              status: {
                status: taskId === 2 ? 'done' : ""
              },
            },
            {
              id: 3,
              name: "3nd topic",
              type: 'Topic',
              status: {
                status: taskId === 3 ? 'done' : ""
              },
            },
            {
              id: 21,
              name: "in progress feedback",
              type: 'Assessment',
              isLocked: false,
              isTeam: false,
              deadline: null,
              contextId: 16881,
              status: {
                status: taskId === 21 ? 'done' : "in progress"
              },
            },
            {
              id: 22,
              name: "duedate feedback",
              type: 'Assessment',
              isLocked: false,
              isTeam: false,
              deadline: '2122-03-05 15:00:00',
              contextId: 16881,
              status: {
                status: taskId === 22 ? 'done' : ""
              },
            },
            {
              id: 23,
              name: "due today feedback",
              type: 'Assessment',
              isLocked: false,
              isTeam: false,
              deadline: (new Date()).toISOString(),
              contextId: 16881,
              status: {
                status: taskId === 23 ? 'done' : ""
              },
            },
            {
              id: 24,
              name: "overdue feedback",
              type: 'Assessment',
              isLocked: false,
              isTeam: false,
              deadline: '2022-03-05 15:00:00',
              contextId: 16881,
              status: {
                status: taskId === 24 ? 'done' : ""
              },
            },
            {
              id: 31,
              name: "pending review feedback",
              type: 'Assessment',
              isLocked: false,
              isTeam: false,
              deadline: '2022-03-03 15:00:00',
              contextId: 16881,
              status: {
                status: "pending review"
              },
            },
            {
              id: 32,
              name: "feedback available feedback",
              type: 'Assessment',
              isLocked: false,
              isTeam: false,
              deadline: '2022-03-05 15:00:00',
              contextId: 16881,
              status: {
                status: "feedback available"
              },
            },
            {
              id: 33,
              name: "done quiz",
              type: 'Assessment',
              isLocked: false,
              isTeam: false,
              deadline: '2022-03-05 15:00:00',
              contextId: 16881,
              status: {
                status: "done"
              },
            },
            {
              id: 34,
              name: "team assessment",
              type: 'Assessment',
              isLocked: false,
              isTeam: true,
              deadline: '2022-03-05 15:00:00',
              contextId: 16881,
              status: {
                isLocked: true,
                status: "in progress",
                submitterName: 'James Bond',
                submitterImage: ''
              }
            },
            {
              id: 35,
              name: "done moderated",
              type: 'Assessment',
              isLocked: false,
              isTeam: false,
              deadline: '2022-03-05 15:00:00',
              contextId: 16881,
              status: {
                status: "done"
              },
            },
            {
              id: 4,
              type: 'Locked',
              name: 'Locked',
              isLocked: true,
            },
            {
              "id": 10436,
              "name": "Pulse Check",
              "type": "assessment",
              "isLocked": false,
              "isTeam": true,
              "deadline": null,
              "contextId": 14685,
              "status": {
                "status": "feedback available",
                "isLocked": false,
                "submitterName": "Learner 031",
                "submitterImage": "https://www.gravatar.com/avatar/618510e6ea8323e6408c886f150c5f8d?d=https%3A%2F%2Fmy.practera.com%2Fimg%2Fuser-512.png&s=50",
                "__typename": "TaskStatus"
              },
              "__typename": "Task"
            },
            {
              "id": 11812,
              "name": "All question type",
              "type": "assessment",
              "isLocked": false,
              "isTeam": false,
              "deadline": null,
              "contextId": 16963,
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
              "id": 12304,
              "name": "Full-featured",
              "type": "assessment",
              "isLocked": false,
              "isTeam": false,
              "deadline": null,
              "contextId": 17637,
              "status": {
                "status": "",
                "isLocked": null,
                "submitterName": null,
                "submitterImage": null,
                "__typename": "TaskStatus"
              },
              "__typename": "Task"
            }
          ]
        }
      }
    }).pipe(delay(1000));
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
          name: 'Global Trade Accelerator-abcdefghijklmnopqrstuvwxyz-abcdefghijklmnopqrstuvwxyz-abcdefghijklmnopqrstuvwxyz',
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
          id: 1429
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
          id: 1429
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
          id: 1429
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
      },
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
          id: 1429
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
          id: 1429
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
          id: 1429
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
      },
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
          id: 1429
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
          id: 1429
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
          id: 1429
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
      },
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
          id: 1429
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
          id: 1429
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
          id: 1429
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
      },
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
          id: 1429
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
          id: 1429
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

  assessment(id: number) {
    let response;
    switch (id) {
      case 21: // in progress
        response = {"data":{"assessment":{"id": 21, "name":"2. Moderated - team in-progress submission","type":"moderated","description":null,"dueDate":null,"isTeam":false,"pulseCheck":false,"groups":[{"name":"Report (Draft)","description":"","questions":[{"id":103122,"name":"Your team's report (Draft)","description":"","type":"file","isRequired":true,"hasComment":false,"audience":["submitter"],"fileType":"any","choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"}],"__typename":"AssessmentGroup"},{"name":"Feedback","description":"<span style=\"font-size: 13px;\">Clients: Please review the team's submission and to what extent they have achieved the following outcomes:</span><div><span style=\"font-size: 13px;\">1. Draft Report is professional</span></div><div><span style=\"font-size: 13px;\">2.&nbsp;Draft report aligns to the project brief</span></div><div><span style=\"font-size: 13px;\">3.&nbsp;Draft report has a clear direction</span></div><div><span style=\"font-size: 13px;\">For each outcome select the criteria they have achieved.</span><br></div>","questions":[],"__typename":"AssessmentGroup"}],"submissions":[{"id":36848,"status":"in progress","completed":false,"modified":"2022-03-31 06:48:41","locked":false,"submitter":{"name":"Sharon L000","image":null,"__typename":"User"},"answers":[{"questionId":103122,"answer":{"filename":"GROWPlan.docx","handle":"IzHJTJcSTEaBrKJav8kh","mimetype":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","originalPath":"GROWPlan.docx","size":17315,"source":"local_file_system","url":"https://cdn.filestackcontent.com/IzHJTJcSTEaBrKJav8kh","uploadId":"7ecO9B4iP8G5qpJA","originalFile":{"name":"GROWPlan.docx","type":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","size":17315},"status":"Stored","key":"appv2/test/any/ddfba7a5660fc2c5a43439755e4d6c08/cVV6vbHuSLmeWYmdVk0h_GROWPlan.docx","container":"files.p2-stage.practera.com","workflows":{"3c38ef53-a9d0-4aa4-9234-617d9f03c0de":{"jobid":"7f3b04a8-f2df-4102-8f63-e7afacd6e037"}}},"__typename":"AssessmentSubmissionAnswer"}],"review":null,"__typename":"AssessmentSubmission"}],"__typename":"Assessment"}}};
        break;
      case 22: // due date
        response = {"data":{"assessment":{"id": 22, "name":"1. Moderated - no submission","type":"moderated","description":null,"dueDate":'2122-03-05 15:00:00',"isTeam":true,"pulseCheck":true,"groups":[{"name":"Report (Draft)","description":"","questions":[{"id":103115,"name":"Your team's report (Draft)","description":"","type":"file","isRequired":true,"hasComment":false,"audience":["submitter"],"fileType":"any","choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"}],"__typename":"AssessmentGroup"},{"name":"Feedback","description":"<span style=\"font-size: 13px;\">Clients: Please review the team's submission and to what extent they have achieved the following outcomes:</span><div><span style=\"font-size: 13px;\">1. Draft Report is professional</span></div><div><span style=\"font-size: 13px;\">2.&nbsp;Draft report aligns to the project brief</span></div><div><span style=\"font-size: 13px;\">3.&nbsp;Draft report has a clear direction</span></div><div><span style=\"font-size: 13px;\">For each outcome select the criteria they have achieved.</span><br></div>","questions":[],"__typename":"AssessmentGroup"}],"submissions":[],"__typename":"Assessment"}}};
        break;
      case 23: // due today
        response = {"data":{"assessment":{"id": 23, "name":"1. Moderated - no submission","type":"moderated","description":null,"dueDate": (new Date()).toISOString(),"isTeam":false,"pulseCheck":true,"groups":[{"name":"Report (Draft)","description":"","questions":[{"id":103115,"name":"Your team's report (Draft)","description":"","type":"file","isRequired":false,"hasComment":false,"audience":["submitter"],"fileType":"any","choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"}],"__typename":"AssessmentGroup"},{"name":"Feedback","description":"<span style=\"font-size: 13px;\">Clients: Please review the team's submission and to what extent they have achieved the following outcomes:</span><div><span style=\"font-size: 13px;\">1. Draft Report is professional</span></div><div><span style=\"font-size: 13px;\">2.&nbsp;Draft report aligns to the project brief</span></div><div><span style=\"font-size: 13px;\">3.&nbsp;Draft report has a clear direction</span></div><div><span style=\"font-size: 13px;\">For each outcome select the criteria they have achieved.</span><br></div>","questions":[],"__typename":"AssessmentGroup"}],"submissions":[],"__typename":"Assessment"}}};
        break;
      case 24: // overdue
        response = {"data":{"assessment":{"id": 24, "name":"1. Moderated - no submission","type":"moderated","description":null,"dueDate": '2022-01-01 00:00:00',"isTeam":false,"pulseCheck":true,"groups":[{"name":"Report (Draft)","description":"","questions":[{"id":103115,"name":"Your team's report (Draft)","description":"","type":"file","isRequired":false,"hasComment":false,"audience":["submitter"],"fileType":"any","choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"}],"__typename":"AssessmentGroup"},{"name":"Feedback","description":"<span style=\"font-size: 13px;\">Clients: Please review the team's submission and to what extent they have achieved the following outcomes:</span><div><span style=\"font-size: 13px;\">1. Draft Report is professional</span></div><div><span style=\"font-size: 13px;\">2.&nbsp;Draft report aligns to the project brief</span></div><div><span style=\"font-size: 13px;\">3.&nbsp;Draft report has a clear direction</span></div><div><span style=\"font-size: 13px;\">For each outcome select the criteria they have achieved.</span><br></div>","questions":[],"__typename":"AssessmentGroup"}],"submissions":[],"__typename":"Assessment"}}};
        break;
      case 31: // pending review
        response = {"data":{"assessment":{"id": 31, "name":"4. Moderated submitted, waiting on review","type":"moderated","description":null,"dueDate":null,"isTeam":true,"pulseCheck":true,"groups":[{"name":"Report (Draft)","description":"","questions":[{"id":103142,"name":"Your team's report (Draft)","description":"","type":"file","isRequired":true,"hasComment":false,"audience":["submitter"],"fileType":"any","choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"}],"__typename":"AssessmentGroup"},{"name":"Feedback","description":"<span style=\"font-size: 13px;\">Clients: Please review the team's submission and to what extent they have achieved the following outcomes:</span><div><span style=\"font-size: 13px;\">1. Draft Report is professional</span></div><div><span style=\"font-size: 13px;\">2.&nbsp;Draft report aligns to the project brief</span></div><div><span style=\"font-size: 13px;\">3.&nbsp;Draft report has a clear direction</span></div><div><span style=\"font-size: 13px;\">For each outcome select the criteria they have achieved.</span><br></div>","questions":[],"__typename":"AssessmentGroup"}],"submissions":[{"id":36850,"status":"pending review","completed":false,"modified":"2022-03-31 07:00:40","locked":false,"submitter":{"name":"Sharon L002","image":null,"__typename":"User"},"answers":[{"questionId":103142,"answer":{"filename":"GROWPlan.docx","handle":"7zeK2YDXS2GyqdIWRVKk","mimetype":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","originalPath":"GROWPlan.docx","size":17315,"source":"local_file_system","url":"https://cdn.filestackcontent.com/7zeK2YDXS2GyqdIWRVKk","uploadId":"5iR4jopZuWXlmWLm","originalFile":{"name":"GROWPlan.docx","type":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","size":17315},"status":"Stored","key":"appv2/test/any/385ad07c3752eb087e71fe51a376bc60/f2AfSbUISaWTc9Zs2B8r_GROWPlan.docx","container":"files.p2-stage.practera.com","workflows":{"3c38ef53-a9d0-4aa4-9234-617d9f03c0de":{"jobid":"a8a82630-8b2d-4077-a824-829ed1996acd"}}},"__typename":"AssessmentSubmissionAnswer"}],"review":{"id":5980,"status":"not start","modified":"2022-03-31 07:00:40","reviewer":{"name":"Sharon M002","__typename":"User"},"answers":[],"__typename":"AssessmentSubmissionReview"},"__typename":"AssessmentSubmission"}],"__typename":"Assessment"}}};
        break;
      case 32: // feedback available
        response = {"data":{"assessment":{"id": 32, "name":"5. Moderated, Feedback done, waiting for learner to see feedback","type":"moderated","description":null,"dueDate":null,"isTeam":true,"pulseCheck":true,"groups":[{"name":"Report (Draft)","description":"","questions":[{"id":103149,"name":"Your team's report (Draft)","description":"","type":"file","isRequired":true,"hasComment":false,"audience":["submitter"],"fileType":"any","choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"}],"__typename":"AssessmentGroup"},{"name":"Feedback","description":"<span style=\"font-size: 13px;\">Clients: Please review the team's submission and to what extent they have achieved the following outcomes:</span><div><span style=\"font-size: 13px;\">1. Draft Report is professional</span></div><div><span style=\"font-size: 13px;\">2.&nbsp;Draft report aligns to the project brief</span></div><div><span style=\"font-size: 13px;\">3.&nbsp;Draft report has a clear direction</span></div><div><span style=\"font-size: 13px;\">For each outcome select the criteria they have achieved.</span><br></div>","questions":[{"id":103150,"name":"Optional detailed feedback: Download and annotate the team's Project Report, and re-upload it here","description":"","type":"file","isRequired":false,"hasComment":false,"audience":["reviewer"],"fileType":"any","choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103151,"name":"Outcome 1. Draft report is professional.","description":"Please select all that apply:","type":"multiple","isRequired":true,"hasComment":false,"audience":["reviewer"],"fileType":null,"choices":[{"id":332507,"name":"Draft report has a clear, logical structure","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332508,"name":"Communication is clear, concise and contains few/no spelling or grammatical errors","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332509,"name":"Draft report is visually appealing and, where appropriate, presents key data in supporting charts or infographics","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332510,"name":"None of the above","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103152,"name":"Outcome 2. Draft report aligns to the project brief.","description":"Please select all that apply:","type":"multiple","isRequired":true,"hasComment":false,"audience":["reviewer"],"fileType":null,"choices":[{"id":332511,"name":"Client's problem is clearly defined/stated and within the scope of the project","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332512,"name":"Research is evident and well sourced","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332513,"name":"Key themes/messages are identified from initial research and clearly communicated","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332514,"name":"None of the above","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103153,"name":"Outcome 3. Draft report has a clear direction.","description":"Please select all that apply:","type":"multiple","isRequired":true,"hasComment":false,"audience":["reviewer"],"fileType":null,"choices":[{"id":332515,"name":"Further research areas are clearly identified","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332516,"name":"Draft Report provides a clear pathway to the Final Report, including identification of any gaps or roadblocks","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332517,"name":"None of the above","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103154,"name":"Overall Report Quality (based on your opinion and criteria met):","description":"","type":"oneof","isRequired":true,"hasComment":false,"audience":["reviewer"],"fileType":null,"choices":[{"id":332518,"name":"Outstanding Quality (All criteria have been met)","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332519,"name":"High Quality (Most criteria have been met)","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332520,"name":"Adequate Quality (Some criteria have been met)","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332521,"name":"Low Quality (Few criteria have been met)","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332522,"name":"Poor Quality (No criteria have been met)","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103155,"name":"Please provide detailed feedback on how the team can address any gaps based on the criteria above or any other comments you would like to add:","description":"","type":"text","isRequired":true,"hasComment":false,"audience":["reviewer"],"fileType":null,"choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"}],"__typename":"AssessmentGroup"}],"submissions":[{"id":36851,"status":"published","completed":false,"modified":"2022-03-31 07:07:39","locked":false,"submitter":{"name":"Sharon L003","image":null,"__typename":"User"},"answers":[{"questionId":103149,"answer":{"filename":"GROWPlan.docx","handle":"o3ISfh1iTfacg8ISBb1V","mimetype":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","originalPath":"GROWPlan.docx","size":17315,"source":"local_file_system","url":"https://cdn.filestackcontent.com/o3ISfh1iTfacg8ISBb1V","uploadId":"9RSdN0o9txwGGHJi","originalFile":{"name":"GROWPlan.docx","type":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","size":17315},"status":"Stored","key":"appv2/test/any/7254217d81b43c1d3e0b04fa686c62a3/laDdGGfSpuaLVilDSShg_GROWPlan.docx","container":"files.p2-stage.practera.com","workflows":{"3c38ef53-a9d0-4aa4-9234-617d9f03c0de":{"jobid":"bafce0ca-f1ef-4ee8-8e56-5a34ccafee20"}}},"__typename":"AssessmentSubmissionAnswer"}],"review":{"id":5981,"status":"done","modified":"2022-03-31 07:07:37","reviewer":{"name":"Sharon M003","__typename":"User"},"answers":[{"questionId":103155,"answer":"Testing 5. Feedback done, waiting for learner to see the feedback","comment":"","__typename":"AssessmentReviewAnswer"},{"questionId":103154,"answer":332519,"comment":"","__typename":"AssessmentReviewAnswer"},{"questionId":103153,"answer":[332516,332515],"comment":"","__typename":"AssessmentReviewAnswer"},{"questionId":103152,"answer":[332511,332512,332513],"comment":"","__typename":"AssessmentReviewAnswer"},{"questionId":103151,"answer":[332507,332508],"comment":"","__typename":"AssessmentReviewAnswer"}],"__typename":"AssessmentSubmissionReview"},"__typename":"AssessmentSubmission"}],"__typename":"Assessment"}}};
        break;
      case 33: // done quiz
        response = {"data":{"assessment":{"id": 33, "name":"3. Quiz Submitted","type":"quiz","description":null,"dueDate":null,"isTeam":false,"pulseCheck":true,"groups":[{"name":"Program Declarations","description":"","questions":[{"id":103129,"name":"I understand I need to attend the mandatory Orientation session and need to successfully complete the project in order to receive my certificate (Team meetings will be organised by your team independently)","description":"","type":"oneof","isRequired":true,"hasComment":false,"audience":["reviewer","submitter"],"fileType":null,"choices":[{"id":332450,"name":"Yes","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332451,"name":"No, you MUST contact programs@practera.com to confirm you are still eligible to complete the program","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103130,"name":"I hereby give permission for my images captured during the duration of the Program through video conference tools, photo and digital camera, to be used solely for the purposes of the program's promotional material and publications","description":"","type":"oneof","isRequired":true,"hasComment":false,"audience":["reviewer","submitter"],"fileType":null,"choices":[{"id":332452,"name":"Yes","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332453,"name":"No","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"}],"__typename":"AssessmentGroup"},{"name":"Your details","description":"","questions":[{"id":103131,"name":"Phone number","description":"","type":"text","isRequired":true,"hasComment":false,"audience":["reviewer","submitter"],"fileType":null,"choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103132,"name":"WeChat (optional)","description":"","type":"text","isRequired":false,"hasComment":false,"audience":["reviewer","submitter"],"fileType":null,"choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"}],"__typename":"AssessmentGroup"},{"name":"About you","description":"","questions":[{"id":103133,"name":"Gender","description":"","type":"oneof","isRequired":false,"hasComment":false,"audience":["reviewer","submitter"],"fileType":null,"choices":[{"id":332454,"name":"Female","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332455,"name":"Male","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332456,"name":"Prefer not to disclose","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332457,"name":"Other","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103134,"name":"Domestic or International student","description":"","type":"oneof","isRequired":false,"hasComment":false,"audience":["reviewer","submitter"],"fileType":null,"choices":[{"id":332458,"name":"International","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332459,"name":"Domestic","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103135,"name":"Country or region you most identify with","description":"","type":"oneof","isRequired":false,"hasComment":false,"audience":["reviewer","submitter"],"fileType":null,"choices":[{"id":332460,"name":"Australia/NZ","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332461,"name":"Africa","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332462,"name":"China","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332463,"name":"European Union","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332464,"name":"India","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332465,"name":"Indonesia","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332466,"name":"Japan","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332467,"name":"Korea","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332468,"name":"Malaysia","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332469,"name":"Middle East","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332470,"name":"North America","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332471,"name":"South America","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332472,"name":"South East Asia","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332473,"name":"United Kingdom","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332474,"name":"Vietnam","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332475,"name":"Other","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103136,"name":"If you answered 'Other' to the question above, please provide details below","description":"","type":"text","isRequired":false,"hasComment":false,"audience":["reviewer","submitter"],"fileType":null,"choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103137,"name":"Level of study","description":"","type":"oneof","isRequired":true,"hasComment":false,"audience":["reviewer","submitter"],"fileType":null,"choices":[{"id":332476,"name":"Vocational","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332477,"name":"Undergraduate","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332478,"name":"Postgraduate","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332479,"name":"PhD","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103138,"name":"Area of study","description":"","type":"oneof","isRequired":true,"hasComment":false,"audience":["reviewer","submitter"],"fileType":null,"choices":[{"id":332480,"name":"Art, Design and Architecture","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332481,"name":"Arts & Humanities","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332482,"name":"Business and Economics","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332483,"name":"Education","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332484,"name":"Engineering","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332485,"name":"Information Technology","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332486,"name":"Law","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332487,"name":"Medicine, Nursing and Health Sciences","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332488,"name":"Other","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103139,"name":"If you answered 'Other' to the question above, please provide details below","description":"","type":"text","isRequired":false,"hasComment":false,"audience":["reviewer","submitter"],"fileType":null,"choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103140,"name":"Where are you?","description":"","type":"oneof","isRequired":true,"hasComment":false,"audience":["reviewer","submitter"],"fileType":null,"choices":[{"id":332489,"name":"Onshore - I am physically in Australia","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332490,"name":"Offshore - I am physically in another country right now","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103141,"name":"University LIST MULTIPLE UNIS OR REMOVE IF ONLY 1 UNI PARTICIPATING","description":"","type":"oneof","isRequired":false,"hasComment":false,"audience":["reviewer","submitter"],"fileType":null,"choices":[],"teamMembers":null,"__typename":"AssessmentQuestion"}],"__typename":"AssessmentGroup"}],"submissions":[{"id":36849,"status":"done","completed":true,"modified":"2022-03-31 06:49:08","locked":false,"submitter":{"name":"Sharon L000","image":null,"__typename":"User"},"answers":[{"questionId":103141,"answer":"","__typename":"AssessmentSubmissionAnswer"},{"questionId":103140,"answer":"332490","__typename":"AssessmentSubmissionAnswer"},{"questionId":103139,"answer":"","__typename":"AssessmentSubmissionAnswer"},{"questionId":103138,"answer":"332485","__typename":"AssessmentSubmissionAnswer"},{"questionId":103137,"answer":"332478","__typename":"AssessmentSubmissionAnswer"},{"questionId":103136,"answer":"","__typename":"AssessmentSubmissionAnswer"},{"questionId":103135,"answer":"332464","__typename":"AssessmentSubmissionAnswer"},{"questionId":103134,"answer":"332458","__typename":"AssessmentSubmissionAnswer"},{"questionId":103133,"answer":"332454","__typename":"AssessmentSubmissionAnswer"},{"questionId":103132,"answer":"","__typename":"AssessmentSubmissionAnswer"},{"questionId":103131,"answer":"873843294739","__typename":"AssessmentSubmissionAnswer"},{"questionId":103130,"answer":"332452","__typename":"AssessmentSubmissionAnswer"},{"questionId":103129,"answer":"332450","__typename":"AssessmentSubmissionAnswer"}],"review":null,"__typename":"AssessmentSubmission"}],"__typename":"Assessment"}}};
        break;
      case 34: // team assessment
        response = {"data":{"assessment":{"id": 34, "name":"7. Moderated team - another team member has in-progress( locked for current user)","type":"moderated","description":null,"dueDate":null,"isTeam":true,"pulseCheck":true,"groups":[{"name":"Report (Draft)","description":"","questions":[{"id":103163,"name":"Your team's report (Draft)","description":"","type":"file","isRequired":true,"hasComment":false,"audience":["submitter"],"fileType":"any","choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"}],"__typename":"AssessmentGroup"},{"name":"Feedback","description":"<span style=\"font-size: 13px;\">Clients: Please review the team's submission and to what extent they have achieved the following outcomes:</span><div><span style=\"font-size: 13px;\">1. Draft Report is professional</span></div><div><span style=\"font-size: 13px;\">2.&nbsp;Draft report aligns to the project brief</span></div><div><span style=\"font-size: 13px;\">3.&nbsp;Draft report has a clear direction</span></div><div><span style=\"font-size: 13px;\">For each outcome select the criteria they have achieved.</span><br></div>","questions":[],"__typename":"AssessmentGroup"}],"submissions":[{"id":36853,"status":"in progress","completed":false,"modified":"2022-03-31 07:20:06","locked":true,"submitter":{"name":"Sharon L333","image":null,"__typename":"User"},"answers":[{"questionId":103163,"answer":{"filename":"GROWPlan.docx","handle":"Jj3BwxRHRXaqxrgCb9fK","mimetype":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","originalPath":"GROWPlan.docx","size":17315,"source":"local_file_system","url":"https://cdn.filestackcontent.com/Jj3BwxRHRXaqxrgCb9fK","uploadId":"XXVdUB55ipXp6H2Q","originalFile":{"name":"GROWPlan.docx","type":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","size":17315},"status":"Stored","key":"appv2/test/any/6faad08525beb34ff8254507bae5588d/ZtbHCl9BRF2FzmJMIAk7_GROWPlan.docx","container":"files.p2-stage.practera.com","workflows":{"3c38ef53-a9d0-4aa4-9234-617d9f03c0de":{"jobid":"f05401b0-e09d-4d87-97a3-ff6c56e3e972"}}},"__typename":"AssessmentSubmissionAnswer"}],"review":null,"__typename":"AssessmentSubmission"}],"__typename":"Assessment"}}};
        break;
      case 35: // done moderated
        response = {"data":{"assessment":{"id": 35, "name":"6. Moderated, Feedback done, Learner seen feedback","type":"moderated","description":null,"dueDate":null,"isTeam":true,"pulseCheck":true,"groups":[{"name":"Report (Draft)","description":"","questions":[{"id":103156,"name":"Your team's report (Draft)","description":"","type":"file","isRequired":true,"hasComment":false,"audience":["submitter"],"fileType":"any","choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"}],"__typename":"AssessmentGroup"},{"name":"Feedback","description":"<span style=\"font-size: 13px;\">Clients: Please review the team's submission and to what extent they have achieved the following outcomes:</span><div><span style=\"font-size: 13px;\">1. Draft Report is professional</span></div><div><span style=\"font-size: 13px;\">2.&nbsp;Draft report aligns to the project brief</span></div><div><span style=\"font-size: 13px;\">3.&nbsp;Draft report has a clear direction</span></div><div><span style=\"font-size: 13px;\">For each outcome select the criteria they have achieved.</span><br></div>","questions":[{"id":103157,"name":"Optional detailed feedback: Download and annotate the team's Project Report, and re-upload it here","description":"","type":"file","isRequired":false,"hasComment":false,"audience":["reviewer"],"fileType":"any","choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103158,"name":"Outcome 1. Draft report is professional.","description":"Please select all that apply:","type":"multiple","isRequired":true,"hasComment":false,"audience":["reviewer"],"fileType":null,"choices":[{"id":332523,"name":"Draft report has a clear, logical structure","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332524,"name":"Communication is clear, concise and contains few/no spelling or grammatical errors","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332525,"name":"Draft report is visually appealing and, where appropriate, presents key data in supporting charts or infographics","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332526,"name":"None of the above","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103159,"name":"Outcome 2. Draft report aligns to the project brief.","description":"Please select all that apply:","type":"multiple","isRequired":true,"hasComment":false,"audience":["reviewer"],"fileType":null,"choices":[{"id":332527,"name":"Client's problem is clearly defined/stated and within the scope of the project","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332528,"name":"Research is evident and well sourced","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332529,"name":"Key themes/messages are identified from initial research and clearly communicated","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332530,"name":"None of the above","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103160,"name":"Outcome 3. Draft report has a clear direction.","description":"Please select all that apply:","type":"multiple","isRequired":true,"hasComment":false,"audience":["reviewer"],"fileType":null,"choices":[{"id":332531,"name":"Further research areas are clearly identified","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332532,"name":"Draft Report provides a clear pathway to the Final Report, including identification of any gaps or roadblocks","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332533,"name":"None of the above","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103161,"name":"Overall Report Quality (based on your opinion and criteria met):","description":"","type":"oneof","isRequired":true,"hasComment":false,"audience":["reviewer"],"fileType":null,"choices":[{"id":332534,"name":"Outstanding Quality (All criteria have been met)","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332535,"name":"High Quality (Most criteria have been met)","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332536,"name":"Adequate Quality (Some criteria have been met)","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332537,"name":"Low Quality (Few criteria have been met)","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332538,"name":"Poor Quality (No criteria have been met)","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103162,"name":"Please provide detailed feedback on how the team can address any gaps based on the criteria above or any other comments you would like to add:","description":"","type":"text","isRequired":true,"hasComment":false,"audience":["reviewer"],"fileType":null,"choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"}],"__typename":"AssessmentGroup"}],"submissions":[{"id":36852,"status":"published","completed":true,"modified":"2022-03-31 07:14:04","locked":false,"submitter":{"name":"Sharon L004","image":"https://cdn.filestackcontent.com/min8HcECRNqid6RFx0Lo","__typename":"User"},"answers":[{"questionId":103156,"answer":{"filename":"GROWPlan.docx","handle":"f5fF6RWwTG639KwcjSYP","mimetype":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","originalPath":"GROWPlan.docx","size":17315,"source":"local_file_system","url":"https://cdn.filestackcontent.com/f5fF6RWwTG639KwcjSYP","uploadId":"h8j9rHxaHV5L7Ym1","originalFile":{"name":"GROWPlan.docx","type":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","size":17315},"status":"Stored","key":"appv2/test/any/b29f91502651c1036a5995f75e4b7726/MrxzcuMdQQCwDgsianPr_GROWPlan.docx","container":"files.p2-stage.practera.com","workflows":{"3c38ef53-a9d0-4aa4-9234-617d9f03c0de":{"jobid":"a07b2e4b-2840-4139-b8ab-db2a623892e6"}}},"__typename":"AssessmentSubmissionAnswer"}],"review":{"id":5982,"status":"done","modified":"2022-03-31 07:14:03","reviewer":{"name":"Sharon M004","__typename":"User"},"answers":[{"questionId":103162,"answer":"Feedback done, learner has seen the feedback","comment":"","__typename":"AssessmentReviewAnswer"},{"questionId":103161,"answer":332537,"comment":"","__typename":"AssessmentReviewAnswer"},{"questionId":103160,"answer":[332532],"comment":"","__typename":"AssessmentReviewAnswer"},{"questionId":103159,"answer":[332527,332528],"comment":"","__typename":"AssessmentReviewAnswer"},{"questionId":103158,"answer":[332523,332524],"comment":"","__typename":"AssessmentReviewAnswer"}],"__typename":"AssessmentSubmissionReview"},"__typename":"AssessmentSubmission"}],"__typename":"Assessment"}}};
        break;
      case 11150:
        response = { "data": { "assessment": {"id": 11150,  "name": "All question type", "type": "moderated", "description": null, "dueDate": null, "isTeam": false, "pulseCheck": true, "groups": [{ "name": "New Group", "description": "", "questions": [{ "id": 92804, "name": "Team member selector", "description": "", "type": "team member selector", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": null, "teamMembers": [{ "userId": 13914, "userName": "Learner 031", "teamId": 1799, "__typename": "AssessmentQuestionTeamMember" }], "__typename": "AssessmentQuestion" }, { "id": 92805, "name": "File upload", "description": "", "type": "file", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": "any", "choices": null, "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 92806, "name": "Checkboxes", "description": "", "type": "multiple", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": [{ "id": 295742, "name": "New Choice 1", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 295743, "name": "New Choice 2", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 295744, "name": "New Choice 3", "explanation": null, "description": "", "__typename": "AssessmentChoice" }], "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 92807, "name": "Multiple choice", "description": "", "type": "oneof", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": [{ "id": 295745, "name": "New Choice 1", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 295746, "name": "New Choice 2", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 295747, "name": "New Choice 3", "explanation": null, "description": "", "__typename": "AssessmentChoice" }], "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 92808, "name": "Text", "description": "", "type": "text", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": null, "teamMembers": null, "__typename": "AssessmentQuestion" }], "__typename": "AssessmentGroup" }], "submissions": [{ "id": 36842, "status": "pending review", "completed": false, "modified": "2022-03-29 08:44:54", "locked": false, "submitter": { "name": "learner 008", "image": null, "__typename": "User" }, "answers": [{ "questionId": 92805, "answer": { "filename": "P_20161110_094003.jpg.png", "handle": "Hr1hxmq0SRevtIz1rbRS", "mimetype": "image/png", "originalPath": "P_20161110_094003.jpg", "size": 3621112, "source": "local_file_system", "url": "https://cdn.filestackcontent.com/Hr1hxmq0SRevtIz1rbRS", "uploadId": "1CML5sZFk250ykGY", "originalFile": { "name": "P_20161110_094003.jpg", "type": "image/jpeg", "size": 1662080 }, "status": "Stored", "key": "appv2/dev/any/7251cca1e7a1b8e1022af89eac9e08c6/0DDec3cVTSG0BByNx548_P_20161110_094003.jpg.png", "container": "files.p2-sandbox.practera.com", "cropped": { "originalImageSize": [4096, 2304], "cropArea": { "position": [235, 275], "size": [1762, 1762] } }, "workflows": { "3c38ef53-a9d0-4aa4-9234-617d9f03c0de": { "jobid": "de236eb3-6776-4e46-869d-6548c3ceb506" } } }, "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 92808, "answer": "testing", "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 92807, "answer": "295747", "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 92806, "answer": [295743, 295742], "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 92804, "answer": "{\"userId\":13914,\"userName\":\"Learner 031\",\"teamId\":1799,\"__typename\":\"AssessmentQuestionTeamMember\"}", "__typename": "AssessmentSubmissionAnswer" }], "review": { "id": 6105, "status": "done", "modified": "2022-03-29 08:44:53", "reviewer": { "name": "Chaw Admin", "__typename": "User" }, "answers": [{ "questionId": 92805, "answer": { "filename": "P_20161015_121331.jpg.png", "handle": "N5bxByVSfK42QhLjyaAm", "mimetype": "image/png", "originalPath": "P_20161015_121331.jpg", "size": 5481101, "source": "local_file_system", "url": "https://cdn.filestackcontent.com/N5bxByVSfK42QhLjyaAm", "uploadId": "Twgq9uEGQEa0dp5T", "originalFile": { "name": "P_20161015_121331.jpg", "type": "image/jpeg", "size": 1339688 }, "status": "Stored", "key": "appv2/dev/any/e9de065c86c70baa8005dfbcf3cb692e/1PkwPQS0Cz9wb6Mz7HwK_P_20161015_121331.jpg.png", "container": "files.p2-sandbox.practera.com", "cropped": { "originalImageSize": [4096, 2304], "cropArea": { "position": [896, 0], "size": [2304, 2304] } }, "workflows": { "3c38ef53-a9d0-4aa4-9234-617d9f03c0de": { "jobid": "77402285-21ff-4e6d-93c1-531e911f9361" } } }, "comment": "", "__typename": "AssessmentReviewAnswer" }, { "questionId": 92806, "answer": [295743], "comment": "", "__typename": "AssessmentReviewAnswer" }, { "questionId": 92807, "answer": 295745, "comment": "", "__typename": "AssessmentReviewAnswer" }, { "questionId": 92808, "answer": "testing passed!", "comment": "", "__typename": "AssessmentReviewAnswer" }], "__typename": "AssessmentSubmissionReview" }, "__typename": "AssessmentSubmission" }], "__typename": "Assessment" } } };
      break;
      case 10879:
        response = { "data": { "assessment": { "name": "Reviewer's Feedback Push Notification Test", "type": "moderated", "description": "A test for push notification published after review given to a submission.", "dueDate": null, "isTeam": false, "pulseCheck": true, "groups": [{ "name": "Test Question", "description": "", "questions": [{ "id": 92162, "name": "first Question", "description": "today is Friday?", "type": "oneof", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": [{ "id": 294300, "name": "Yes", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 294301, "name": "No", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 294302, "name": "Yes & No", "explanation": null, "description": "", "__typename": "AssessmentChoice" }], "teamMembers": null, "__typename": "AssessmentQuestion" }], "__typename": "AssessmentGroup" }], "submissions": [{ "id": 36677, "status": "published", "completed": true, "modified": "2021-12-17 04:23:01", "locked": false, "submitter": { "name": "learner 008", "image": null, "__typename": "User" }, "answers": [{ "questionId": 92162, "answer": "294302", "__typename": "AssessmentSubmissionAnswer" }], "review": { "id": 5923, "status": "done", "modified": "2021-12-17 04:23:00", "reviewer": { "name": "expert002", "__typename": "User" }, "answers": [{ "questionId": 92162, "answer": 294302, "comment": "", "__typename": "AssessmentReviewAnswer" }], "__typename": "AssessmentSubmissionReview" }, "__typename": "AssessmentSubmission" }], "__typename": "Assessment" } } };
      break;
      case 10436:
        response = { "data": { "assessment": { "name": "Pulse Check - Team Assessment", "type": "moderated", "description": "Description", "dueDate": null, "isTeam": true, "pulseCheck": true, "groups": [{ "name": "Group 1", "description": "Group Description", "questions": [{ "id": 89673, "name": "Q1", "description": "", "type": "oneof", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": [{ "id": 286318, "name": "A", "explanation": "Choice A explanation", "description": "Choice A description", "__typename": "AssessmentChoice" }, { "id": 286319, "name": "B", "explanation": "Choice B explanation", "description": "Choice B description", "__typename": "AssessmentChoice" }], "teamMembers": null, "__typename": "AssessmentQuestion" }], "__typename": "AssessmentGroup" }], "submissions": [{ "id": 36435, "status": "published", "completed": false, "modified": "2021-10-01 06:07:25", "locked": false, "submitter": { "name": "Learner 031", "image": null, "__typename": "User" }, "answers": [{ "questionId": 89673, "answer": "286318", "__typename": "AssessmentSubmissionAnswer" }], "review": { "id": 5729, "status": "done", "modified": "2021-10-01 06:07:24", "reviewer": { "name": "Expert 003", "__typename": "User" }, "answers": [{ "questionId": 89673, "answer": 286318, "comment": "", "__typename": "AssessmentReviewAnswer" }], "__typename": "AssessmentSubmissionReview" }, "__typename": "AssessmentSubmission" }], "__typename": "Assessment" } } };
      break;
      case 11812:
        response = { "data": { "assessment": { "name": "New feedback", "type": "moderated", "description": null, "dueDate": null, "isTeam": false, "pulseCheck": true, "groups": [{ "name": "New Group", "description": "", "questions": [{ "id": 100332, "name": "New Question 1", "description": "", "type": "oneof", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": [{ "id": 322732, "name": "New Choice 1", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 322733, "name": "New Choice 2", "explanation": null, "description": "", "__typename": "AssessmentChoice" }], "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 100333, "name": "New Question 2", "description": "", "type": "text", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": null, "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 100334, "name": "New Question 3", "description": "", "type": "multiple", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": [{ "id": 322734, "name": "New Choice 1", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 322735, "name": "New Choice 2", "explanation": null, "description": "", "__typename": "AssessmentChoice" }], "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 100335, "name": "New Question 4", "description": "", "type": "file", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": null, "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 100336, "name": "New Question 5", "description": "", "type": "video", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": null, "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 100337, "name": "New Question 6", "description": "", "type": "team member selector", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": null, "teamMembers": [{ "userId": 14058, "userName": "learner 007", "teamId": 1941, "__typename": "AssessmentQuestionTeamMember" }, { "userId": 14087, "userName": "learner 006", "teamId": 1941, "__typename": "AssessmentQuestionTeamMember" }, { "userId": 14088, "userName": "learner 005", "teamId": 1941, "__typename": "AssessmentQuestionTeamMember" }, { "userId": 14042, "userName": "learner 008", "teamId": 1941, "__typename": "AssessmentQuestionTeamMember" }], "__typename": "AssessmentQuestion" }], "__typename": "AssessmentGroup" }], "submissions": [{ "id": 36860, "status": "pending review", "completed": null, "modified": "2022-04-14 07:30:01", "locked": false, "submitter": { "name": "learner 008", "image": null, "__typename": "User" }, "answers": [{ "questionId": 100337, "answer": "{\"userId\":14087,\"userName\":\"learner 006\",\"teamId\":1941,\"__typename\":\"AssessmentQuestionTeamMember\"}", "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 100336, "answer": "", "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 100335, "answer": { "filename": "shiba-inu.jpeg.png", "handle": "BKfLlbRTWmFEVbeU7j1N", "mimetype": "image/png", "originalPath": "shiba-inu.jpeg", "size": 603671, "source": "local_file_system", "url": "https://cdn.filestackcontent.com/BKfLlbRTWmFEVbeU7j1N", "uploadId": "e6G3Qa3nY0y2T8jc", "originalFile": { "name": "shiba-inu.jpeg", "type": "image/jpeg", "size": 261164 }, "status": "Stored", "key": "appv2/test/any/b077d4f53cf0fdb753c7e5e1371e6a2b/a3zVQP0RTNWKk3O0YeWx_shiba-inu.jpeg.png", "container": "files.p2-stage.practera.com", "cropped": { "originalImageSize": [2000, 2041], "cropArea": { "position": [0, 20], "size": [2000, 2001] } }, "workflows": { "3c38ef53-a9d0-4aa4-9234-617d9f03c0de": { "jobid": "da033051-1c33-4904-a2df-fd7fd220316e" } } }, "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 100334, "answer": [322734, 322735], "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 100333, "answer": "test", "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 100332, "answer": "322732", "__typename": "AssessmentSubmissionAnswer" }], "review": { "id": 5987, "status": "not start", "modified": "2022-04-14 07:29:59", "reviewer": { "name": "mentor 001", "__typename": "User" }, "answers": [], "__typename": "AssessmentSubmissionReview" }, "__typename": "AssessmentSubmission" }], "__typename": "Assessment" } } };
      break;
      case 12304:
        response = { "data": { "assessment": { "id": 12304, "name": "Full-featured", "type": "moderated", "description": "<div><b>SYNOPSIS</b></div><div>Two years after his wife’s death, Yusuke Kafuku receives an offer to direct a play at a theater festival in Hiroshima. There, he meets Misaki, a reserved young woman assigned to be his chauffeur. As they spend time together, Kafuku starts to confront the mystery of his wife that quietly haunts him.<br><br><a target=\"_blank\" rel=\"nofollow\" href=\"https://mubi.com/films/drive-my-car/trailer\">https://mubi.com/films/drive-my-car/trailer</a><br> <br><br></div><img alt=\"baxia mlbb\" src=\"https://i.ytimg.com/vi/ZfwZqpf1Xd8/maxresdefault.jpg\" title=\"Image: https://i.ytimg.com/vi/ZfwZqpf1Xd8/maxresdefault.jpg\">", "dueDate": null, "isTeam": false, "pulseCheck": true, "groups": [{ "name": "New Group", "description": "<b>OUR TAKE</b><br><br>Winning the Oscar, BAFTA, and Golden Globe for International Feature, Ryusuke Hamaguchi’s expansive Haruki Murakami adaptation is a film of engrossing pleasures. In detailing the effects of the past and the present, of memory and imagination on the creation of art, Drive My Car contains multitudes.<br><ul><li><a target=\"_blank\" rel=\"nofollow\" href=\"https://mubi.com/specials/mubi-top-1000\">https://mubi.com/specials/mubi-top-1000</a><br></li><li><a target=\"_blank\" rel=\"nofollow\" href=\"https://mubi.com/specials/cannes-film-festival\">https://mubi.com/specials/cannes-film-festival</a><br></li><li><a target=\"_blank\" rel=\"nofollow\" href=\"https://mubi.com/specials/modern-masterpieces\">https://mubi.com/specials/modern-masterpieces</a><br></li><li><a target=\"_blank\" rel=\"nofollow\" href=\"https://mubi.com/specials/mubi-releases\">https://mubi.com/specials/mubi-releases</a><br></li><li><a target=\"_blank\" rel=\"nofollow\" href=\"https://mubi.com/specials/luminaries\">https://mubi.com/specials/luminaries</a><br></li><li><a target=\"_blank\" rel=\"nofollow\" href=\"https://mubi.com/specials/festival-focus-rotterdam\">https://mubi.com/specials/festival-focus-rotterdam</a><br></li></ul><br>", "questions": [{ "id": 104745, "name": "Have you watched the movie?", "description": "Quis nulla nec nascetur venenatis dapibus amet sociosqu conubia a tristique torquent varius luctus ultrices, fringilla semper donec maecenas orci odio felis eleifend placerat mauris est natoque phasellus. Primis id elit consequat etiam consectetur imperdiet vitae dictumst aliquam purus dolor, tincidunt vivamus libero vestibulum diam commodo ultrices justo placerat.<br><br><div><div>&lt;div id=\"twitch-embed\"&gt;&lt;/div&gt;</div><div>&lt;script src=\"<a href=\"https://player.twitch.tv/js/embed/v1.js\">https://player.twitch.tv/js/embed/v1.js</a>\"&gt;&lt;/script&gt;</div><div>&lt;script type=\"text/javascript\"&gt;</div><div>  &nbsp; &nbsp; new Twitch.Player(\"twitch-embed\", {</div><div>    &nbsp; &nbsp; &nbsp; &nbsp; video: \"1443782664\"</div><div>&nbsp; &nbsp; });</div><div><span>&lt;/script&gt;</span></div></div>", "type": "oneof", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": [{ "id": 337709, "name": "Yes", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 337710, "name": "No", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 337711, "name": "Planning to, but low priority", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 337712, "name": "hmm... hope it's a good movie", "explanation": null, "description": "", "__typename": "AssessmentChoice" }], "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 104746, "name": "What do you like about the movie?", "description": "", "type": "oneof", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": [{ "id": 337713, "name": "I didn't watch.", "explanation": null, "description": "You shouldn't pick this answer!<br><img src=\"https://thumbs.dreamstime.com/b/girl-fight-friends-having-tearing-each-others-hair-31034602.jpg\" title=\"Image: https://thumbs.dreamstime.com/b/girl-fight-friends-having-tearing-each-others-hair-31034602.jpg\"><br>", "__typename": "AssessmentChoice" }, { "id": 337714, "name": "It's interesting!", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 337715, "name": "Superb!", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 337716, "name": "Not my cup of tea.", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 338975, "name": "The plot twist!", "explanation": null, "description": "", "__typename": "AssessmentChoice" }], "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 105246, "name": "Which plot twist you like most?", "description": "<h3><b>Raspberry Pi 4 Model B SBC</b></h3>The Raspberry Pi 4 Model B is the best performing single-board computer to date from the Raspberry Pi Foundation that has undergone a huge upgrade in comparison to all previous models. For the first time, the Pi 4 B is available in different memory versions up to 8GB with true Gigabit Ethernet, USB-C power, USB 3.0, dual 4k display output and a quad-core CPU to rival the performance of an entry-level desktop PC. It’s a truly powerful and capable computer in a small, affordable package.<br><br><img alt=\"\" src=\"https://media.rs-online.com/t_medium,f_auto/F1373331-01.jpg\"><br><ul><li>Broadcom BCM2711, Quad core Cortex-A72 (ARM v8) 64-bit SoC @ 1.5GHz</li><li>1GB, 2GB, 4GB or 8GB LPDDR4-3200 SDRAM (depending on model)</li><li>2.4 GHz and 5.0 GHz IEEE 802.11ac wireless, Bluetooth 5.0, BLE</li><li>Gigabit Ethernet</li><li>2 USB 3.0 ports; 2 USB 2.0 ports.</li><li>Raspberry Pi standard 40 pin GPIO header (fully backwards compatible with previous boards)</li><li>2 × micro-HDMI ports (up to 4kp60 supported)</li><li>2-lane MIPI DSI display port</li><li>2-lane MIPI CSI camera port</li><li>4-pole stereo audio and composite video port</li><li>H.265 (4kp60 decode), H264 (1080p60 decode, 1080p30 encode)</li><li>OpenGL ES 3.1, Vulkan 1.0</li><li>Micro-SD card slot for loading operating system and data storage</li><li>5V DC via USB-C connector (minimum 3A*)</li><li>5V DC via GPIO header (minimum 3A*)</li><li>Power over Ethernet (PoE) enabled (requires separate PoE HAT)</li><li>Operating temperature: 0 – 50 degrees C ambient</li></ul>* A good quality 2.5A power supply can be used if downstream USB peripherals consume less than 500mA in total.<br><br>", "type": "multiple", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": [{ "id": 338976, "name": "First One", "explanation": "First selection explanation (shown when scored)", "description": "First<br>", "__typename": "AssessmentChoice" }, { "id": 338977, "name": "2nd One", "explanation": "2nd selection explanation (shown when scored)", "description": "2nd", "__typename": "AssessmentChoice" }, { "id": 338978, "name": "3rd One", "explanation": null, "description": "3rd", "__typename": "AssessmentChoice" }, { "id": 338979, "name": "4th One", "explanation": null, "description": "4th", "__typename": "AssessmentChoice" }], "teamMembers": null, "__typename": "AssessmentQuestion" }], "__typename": "AssessmentGroup" }, { "name": "Folding@Home", "description": "START FOLDING NOW<br><span>Install our software to become a citizen scientist and contribute your compute power to help fight global health threats like COVID19, Alzheimer’s Disease, and cancer. Our software is completely free, easy to install, and safe to use.<br><a href=\"https://bit.ly/2SLsnUI\" target=\"_blank\" rel=\"nofollow\">https://bit.ly/2SLsnUI</a><br> <br></span>", "questions": [{ "id": 105248, "name": "How to get started?", "description": "<span>From 18 - 31 March, top up Diamonds with ShopeePay to enjoy RM3 OFF (min. spend of RM19.02)! Check out more info and T&amp;Cs</span>", "type": "oneof", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": [{ "id": 338980, "name": "Just start, no need to do anything", "explanation": "<span>Top up Mobile Legends Diamond in seconds! Just enter your ML user ID, select the value of Diamond you wish to purchase, complete the payment, and the Diamond will be added immediately to your ML account.</span>", "description": "<span>Price includes 6% SST charge in relation to the Service Tax (Digital Services) Regulations 2020 which comes into force on 1st January 2021.</span>", "__typename": "AssessmentChoice" }, { "id": 338981, "name": "Read some article first", "explanation": null, "description": "Top up Mobile Legends Diamond in seconds! Just enter your ML user ID, select the value of Diamond you wish to purchase, complete the payment, and the Diamond will be added immediately to your ML account.Pay conveniently using Codacash, GrabPay, Touch ’n Go eWallet, Boost, Maxis, Digi, Digi Reload Card, U Mobile, Celcom, ShopeePay, Bank Transfer(FPX), and Card Payment. There's no registration, or log-in required!<span>Topping up for an account not registered in Malaysia region?&nbsp;<a target=\"_blank\" rel=\"nofollow\" href=\"https://support.my.codapayments.com/hc/ms-my/articles/4406402903695-Perubahan-dalam-Mobile-Legends-Bang-Bang\">Click here</a></span><span>Download &amp; play Mobile Legends: Bang Bang today!</span>", "__typename": "AssessmentChoice" }, { "id": 338982, "name": "stay silent...", "explanation": null, "description": "Minimum System Requirements:<br>• CPU: Snapdragon 430 Octa Core 1.4 GHz (or equivalent)<br>• RAM: 2GB<br>• GPU: Adreno 505 or equivalent<br>• OS: iOS 7 / Android 5.0<br><span>• Inital Download File Size: 103 MB</span>", "__typename": "AssessmentChoice" }], "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 105249, "name": "Tell me what you think", "description": "You are seconds away from buying ML Diamond. With Diamond, you can get Starlight Member &amp; Twilight Pass rewards, unlock champions, buy cool champion skins and more. Using Codashop, topping up is made easy, safe and convenient. We are trusted by millions of gamers &amp; app users in South East Asia, including Malaysia. No registration or login is required!&nbsp;<a target=\"_blank\" rel=\"nofollow\" href=\"https://www.codashop.com/en-my/mobile-legends#top\" title=\"Link: https://www.codashop.com/en-my/mobile-legends#top\">Click here to get started</a><span>.</span>", "type": "text", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": null, "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 105250, "name": "File question!", "description": "<h3>Can I buy Starlight Membership &amp; Twilight Pass in Codashop?</h3><div>Yes, you can directly purchase Starlight Membership &amp; Twilight Pass at Codashop.<ul><li><a target=\"_blank\" rel=\"nofollow\" href=\"https://www.codashop.com/my/mobile-legends-member/\">Click here to purchase Starlight Member / Starlight Member Plus</a>.</li><li><a target=\"_blank\" rel=\"nofollow\" href=\"https://www.codashop.com/my/mobile-legends-twilight-pass/\">Click here to purchase Twilight Pass</a>.</li></ul></div>", "type": "file", "isRequired": false, "hasComment": true, "audience": ["reviewer", "submitter"], "fileType": "any", "choices": null, "teamMembers": null, "__typename": "AssessmentQuestion" }], "__typename": "AssessmentGroup" }, { "name": "Final Group", "description": "This is a final group.<br><img src=\"https://cdn1.codashop.com/S/content/common/images/mno/product-image-mlbb_PHMY_newbanner_90KB.jpg\" title=\"Image: https://cdn1.codashop.com/S/content/common/images/mno/product-image-mlbb_PHMY_newbanner_90KB.jpg\"><br><br>Anykind of image", "questions": [{ "id": 105251, "name": "Upload anything", "description": "just upload anything.&nbsp;<br><br><iframe width=\"560\" height=\"315\" src=\"<a href=\" https:=\"\" www.youtube.com=\"\" embed=\"\" zui999bwvxa\"=\"\">https://www.youtube.com/embed/ZuI999bwvXA</a>\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe><br>", "type": "file", "isRequired": false, "hasComment": true, "audience": ["reviewer", "submitter"], "fileType": "any", "choices": null, "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 105252, "name": "What game genre you like?", "description": "", "type": "oneof", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": [{ "id": 338983, "name": "Sandbox", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 338984, "name": "Real-time strategy (RTS)", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 338985, "name": "Shooters (FPS and TPS)", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 338986, "name": "Multiplayer online battle arena (MOBA)", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 338987, "name": "Role-playing (RPG, ARPG, and More)", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 338988, "name": "Simulation and sports", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 338989, "name": "Puzzlers and party games", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 338990, "name": "Action-adventure", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 338991, "name": "Survival and horror", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 338992, "name": "Platformer", "explanation": null, "description": "", "__typename": "AssessmentChoice" }], "teamMembers": null, "__typename": "AssessmentQuestion" }], "__typename": "AssessmentGroup" }], "submissions": [{ "id": 36875, "status": "in progress", "completed": false, "modified": "2022-04-25 06:43:04", "locked": false, "submitter": { "name": "expert 008", "image": null, "__typename": "User" }, "answers": [{ "questionId": 105252, "answer": "338987", "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 105251, "answer": "", "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 105250, "answer": "", "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 105249, "answer": "", "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 105248, "answer": "338982", "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 105246, "answer": [338976, 338978], "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 104746, "answer": "338975", "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 104745, "answer": "", "__typename": "AssessmentSubmissionAnswer" }], "review": null, "__typename": "AssessmentSubmission" }], "__typename": "Assessment" } } };
      break;
    }

    return of(response).pipe(delay(1000));
  }

  topic(id) {
    return {
      id,
      title: `Introduction of Practera ${ id }`,
      content: this.description,
      videolink: '',
      files: [],
    };
  }

  normalResponse() {
    return of({}).pipe(delay(1000));
  }

  fastFeedback() {
    return of({"success":true,"status":"success","cache":false,"data":{"slider":[{"id":9,"title":"Are you confident that your team is on track?","description":"","choices":[{"id":1,"title":"Yes"},{"id":0,"title":"No"}]},{"id":10,"title":"Are you enjoying this experience?","description":"","choices":[{"id":1,"title":"Yes"},{"id":0,"title":"No"}]}],"meta":{"target_user_id":13488,"context_id":16044,"assessment_name":"Draft Report","team_id":null,"team_name":null}},"time":[0,"9.5367431640625E-7:start beforeFilter","0.00031304359436035:start validateApikey","0.0033519268035889:end validateApikey","0.0033628940582275:start checkForTimelineChange","0.0034160614013672:end checkForTimelineChange","0.0034189224243164:start authenticateUser","0.16844201087952:begin setUserSessionData: UserCache.13812.1425","0.48251891136169:end setUserSessionData - no cache: UserCache.13812.1425","0.48257398605347:end authenticateUser","0.48257803916931:start validateTimeline","0.49526309967041:end validateTimeline","0.4952700138092:end beforeFilter","0.49842190742493:start dispatch",{"end":0.5437209606170654}]}).pipe(delay(1000));
  }

  getReviews(): Observable<any> {
    return of({ "success": true, "status": "success", "cache": false, "data": [{ "AssessmentReview": { "id": 6106, "assessment_id": 11150, "assessment_submission_id": 36842, "reviewer_id": 14469, "reviewer_team_id": 1799, "score": "0", "is_done": false, "created": "2022-03-30 17:33:46", "modified": "2022-03-30 17:33:46", "status": "not start", "meta": null, "uuid": "7b3d72c2-a82d-40ef-a525-35ee4725e438" }, "Assessment": { "id": 11150, "name": "All question type" }, "AssessmentSubmission": { "id": 36842, "submitter_id": 13905, "created": "2022-03-29 02:34:41", "modified": "2022-03-30 17:33:48", "status": "pending review", "assessment_id": 11150, "order": null, "submitted": "2022-03-29 08:42:21", "team_id": 1799, "program_id": 961, "activity_id": 16417, "score": "0.75", "moderated_score": "0.5", "publish_date": "2022-03-29 08:44:54", "review_score": "0", "timeline_id": 1294, "context_id": 15796, "publisher_id": 13901, "locked": false, "uuid": "e5d5fa03-8ff7-4861-8c3f-d230e8fbb1e0", "Activity": { "name": "My Style" }, "Submitter": { "id": 13905, "name": "learner 008", "email": "learner_008@practera.com" }, "Team": { "id": 1799, "name": "Team 2" } } }, { "AssessmentReview": { "id": 6107, "assessment_id": 11150, "assessment_submission_id": 36832, "reviewer_id": 14469, "reviewer_team_id": 1799, "score": "0", "is_done": false, "created": "2022-03-30 17:33:46", "modified": "2022-03-30 17:33:46", "status": "not start", "meta": null, "uuid": "7b3d72c2-a82d-40ef-a525-35ee4725e438" }, "Assessment": { "id": 11150, "name": "All question type 2" }, "AssessmentSubmission": { "id": 36832, "submitter_id": 13905, "created": "2022-03-29 02:34:41", "modified": "2022-03-30 17:33:48", "status": "pending review", "assessment_id": 11150, "order": null, "submitted": "2022-03-29 08:42:21", "team_id": 1799, "program_id": 961, "activity_id": 16417, "score": "0.75", "moderated_score": "0.5", "publish_date": "2022-03-29 08:44:54", "review_score": "0", "timeline_id": 1294, "context_id": 15796, "publisher_id": 13901, "locked": false, "uuid": "e5d5fa03-8ff7-4861-8c3f-d230e8fbb1e0", "Activity": { "name": "My Style" }, "Submitter": { "id": 13905, "name": "learner 009", "email": "learner_008@practera.com" }, "Team": { "id": 1798, "name": "Team 3" } } }] }).pipe(delay(1000));
  }

  getAssessmentReviewed(id?): Observable<any> {
    const sets = {
      1:  { "data": { "assessment": { "name": "All question type", "type": "moderated", "description": null, "dueDate": null, "isTeam": false, "pulseCheck": true, "groups": [{ "name": "New Group", "description": "", "questions": [{ "id": 92804, "name": "Team member selector", "description": "", "type": "team member selector", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": null, "teamMembers": [{ "userId": 13914, "userName": "Learner 031", "teamId": 1799, "__typename": "AssessmentQuestionTeamMember" }], "__typename": "AssessmentQuestion" }, { "id": 92805, "name": "File upload", "description": "", "type": "file", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": "any", "choices": null, "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 92806, "name": "Checkboxes", "description": "", "type": "multiple", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": [{ "id": 295742, "name": "New Choice 1", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 295743, "name": "New Choice 2", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 295744, "name": "New Choice 3", "explanation": null, "description": "", "__typename": "AssessmentChoice" }], "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 92807, "name": "Multiple choice", "description": "", "type": "oneof", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": [{ "id": 295745, "name": "New Choice 1", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 295746, "name": "New Choice 2", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 295747, "name": "New Choice 3", "explanation": null, "description": "", "__typename": "AssessmentChoice" }], "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 92808, "name": "Text", "description": "", "type": "text", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": null, "teamMembers": null, "__typename": "AssessmentQuestion" }], "__typename": "AssessmentGroup" }], "submissions": [{ "id": 36842, "status": "published", "completed": false, "modified": "2022-03-29 08:44:54", "locked": false, "submitter": { "name": "learner 008", "image": null, "__typename": "User" }, "answers": [{ "questionId": 92805, "answer": { "filename": "P_20161110_094003.jpg.png", "handle": "Hr1hxmq0SRevtIz1rbRS", "mimetype": "image/png", "originalPath": "P_20161110_094003.jpg", "size": 3621112, "source": "local_file_system", "url": "https://cdn.filestackcontent.com/Hr1hxmq0SRevtIz1rbRS", "uploadId": "1CML5sZFk250ykGY", "originalFile": { "name": "P_20161110_094003.jpg", "type": "image/jpeg", "size": 1662080 }, "status": "Stored", "key": "appv2/dev/any/7251cca1e7a1b8e1022af89eac9e08c6/0DDec3cVTSG0BByNx548_P_20161110_094003.jpg.png", "container": "files.p2-sandbox.practera.com", "cropped": { "originalImageSize": [4096, 2304], "cropArea": { "position": [235, 275], "size": [1762, 1762] } }, "workflows": { "3c38ef53-a9d0-4aa4-9234-617d9f03c0de": { "jobid": "de236eb3-6776-4e46-869d-6548c3ceb506" } } }, "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 92808, "answer": "testing", "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 92807, "answer": "295747", "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 92806, "answer": [295743, 295742], "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 92804, "answer": "{\"userId\":13914,\"userName\":\"Learner 031\",\"teamId\":1799,\"__typename\":\"AssessmentQuestionTeamMember\"}", "__typename": "AssessmentSubmissionAnswer" }], "review": { "id": 6105, "status": "done", "modified": "2022-03-29 08:44:53", "reviewer": { "name": "Chaw Admin", "__typename": "User" }, "answers": [{ "questionId": 92805, "answer": { "filename": "P_20161015_121331.jpg.png", "handle": "N5bxByVSfK42QhLjyaAm", "mimetype": "image/png", "originalPath": "P_20161015_121331.jpg", "size": 5481101, "source": "local_file_system", "url": "https://cdn.filestackcontent.com/N5bxByVSfK42QhLjyaAm", "uploadId": "Twgq9uEGQEa0dp5T", "originalFile": { "name": "P_20161015_121331.jpg", "type": "image/jpeg", "size": 1339688 }, "status": "Stored", "key": "appv2/dev/any/e9de065c86c70baa8005dfbcf3cb692e/1PkwPQS0Cz9wb6Mz7HwK_P_20161015_121331.jpg.png", "container": "files.p2-sandbox.practera.com", "cropped": { "originalImageSize": [4096, 2304], "cropArea": { "position": [896, 0], "size": [2304, 2304] } }, "workflows": { "3c38ef53-a9d0-4aa4-9234-617d9f03c0de": { "jobid": "77402285-21ff-4e6d-93c1-531e911f9361" } } }, "comment": "", "__typename": "AssessmentReviewAnswer" }, { "questionId": 92806, "answer": [295743], "comment": "", "__typename": "AssessmentReviewAnswer" }, { "questionId": 92807, "answer": 295745, "comment": "", "__typename": "AssessmentReviewAnswer" }, { "questionId": 92808, "answer": "testing passed!", "comment": "", "__typename": "AssessmentReviewAnswer" }], "__typename": "AssessmentSubmissionReview" }, "__typename": "AssessmentSubmission" }], "__typename": "Assessment" } } },

      2: { "data": { "assessment": { "name": "Pulse Check - Team Assessment", "type": "moderated", "description": "Description", "dueDate": null, "isTeam": true, "pulseCheck": true, "groups": [{ "name": "Group 1", "description": "Group Description", "questions": [{ "id": 89673, "name": "Q1", "description": "", "type": "oneof", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": [{ "id": 286318, "name": "A", "explanation": "Choice A explanation", "description": "Choice A description", "__typename": "AssessmentChoice" }, { "id": 286319, "name": "B", "explanation": "Choice B explanation", "description": "Choice B description", "__typename": "AssessmentChoice" }], "teamMembers": null, "__typename": "AssessmentQuestion" }], "__typename": "AssessmentGroup" }], "submissions": [{ "id": 36435, "status": "published", "completed": false, "modified": "2021-10-01 06:07:25", "locked": false, "submitter": { "name": "Learner 031", "image": null, "__typename": "User" }, "answers": [{ "questionId": 89673, "answer": "286318", "__typename": "AssessmentSubmissionAnswer" }], "review": { "id": 5729, "status": "done", "modified": "2021-10-01 06:07:24", "reviewer": { "name": "Expert 003", "__typename": "User" }, "answers": [{ "questionId": 89673, "answer": 286318, "comment": "", "__typename": "AssessmentReviewAnswer" }], "__typename": "AssessmentSubmissionReview" }, "__typename": "AssessmentSubmission" }], "__typename": "Assessment" } } },
    };

    if (typeof id === 'number') {
      return of(sets[id]);
    }
    return of(sets[1]);
  }

  get channels() {
    return {
      "channels": [
        {
          "uuid": "d715a07d-e217-4330-aa82-c214f9e6a137",
          "name": "Team 1 + Mentor + Admins",
          "avatar": "https://admin.p2-stage.practera.com//img/team-white.png",
          "isAnnouncement": false,
          "isDirectMessage": false,
          "readonly": false,
          "roles": [
            "sysadmin",
            "participant",
            "mentor",
            "coordinator",
            "admin"
          ],
          "unreadMessageCount": 6,
          "lastMessage": "team 1 test mesage 06",
          "lastMessageCreated": "2022-04-11 03:18:48",
          "pusherChannel": "private-chat-dcf52471-c7f3-4d9b-b53a-d4fd7775bb7e",
          "canEdit": false,
          "__typename": "Channel"
        },
        {
          "uuid": "49e06b09-d2ca-4f44-8426-eb56a3c8fa4a",
          "name": "Team 1",
          "avatar": "https://admin.p2-stage.practera.com//img/team-white.png",
          "isAnnouncement": false,
          "isDirectMessage": false,
          "readonly": false,
          "roles": [
            "sysadmin",
            "participant"
          ],
          "unreadMessageCount": 0,
          "lastMessage": null,
          "lastMessageCreated": null,
          "pusherChannel": "private-chat-dcc44692-c3e4-436c-a2e8-4d564a6ab70b",
          "canEdit": false,
          "__typename": "Channel"
        },
        {
          "uuid": "06786aee-4654-4f31-8656-9e4bc31b0d04",
          "name": "Team 1 + Mentor",
          "avatar": "https://admin.p2-stage.practera.com//img/team-white.png",
          "isAnnouncement": false,
          "isDirectMessage": false,
          "readonly": false,
          "roles": [
            "sysadmin",
            "participant",
            "mentor"
          ],
          "unreadMessageCount": 0,
          "lastMessage": null,
          "lastMessageCreated": null,
          "pusherChannel": "private-chat-a6518010-816d-42a9-862b-7b78726bac89",
          "canEdit": false,
          "__typename": "Channel"
        },
        {
          "uuid": "77743103-75e4-4e33-9083-aa9ba712423a",
          "name": "Sasanga+L002",
          "avatar": "https://www.gravatar.com/avatar/9dadda393165062286c26a533d4ba61f?d=https://admin.p2-stage.practera.com/img/user-512.png&s=50",
          "isAnnouncement": false,
          "isDirectMessage": true,
          "readonly": false,
          "roles": [
            "sysadmin",
            "participant"
          ],
          "unreadMessageCount": 0,
          "lastMessage": null,
          "lastMessageCreated": null,
          "pusherChannel": "private-chat-bffc2265-6fa2-4e41-8063-70bafce7554f",
          "canEdit": false,
          "__typename": "Channel"
        },
        {
          "uuid": "bea01edc-d3c2-47b0-8f54-2f45c2d2050d",
          "name": "Sasanga Dev",
          "avatar": "https://www.gravatar.com/avatar/cfcfe4cfd55845de5a93c12438e71487?d=https://admin.p2-stage.practera.com/img/user-512.png&s=50",
          "isAnnouncement": false,
          "isDirectMessage": true,
          "readonly": false,
          "roles": [
            "sysadmin",
            "participant"
          ],
          "unreadMessageCount": 0,
          "lastMessage": null,
          "lastMessageCreated": null,
          "pusherChannel": "private-chat-8fbe55a1-3aa4-4f18-bd26-0da0284fa5b6",
          "canEdit": false,
          "__typename": "Channel"
        },
        {
          "uuid": "53fd8516-8b6b-49d3-9258-75a93303f5fc",
          "name": "GTA - Testing for Sasanga",
          "avatar": "https://admin.p2-stage.practera.com//img/team-white.png",
          "isAnnouncement": false,
          "isDirectMessage": false,
          "readonly": false,
          "roles": [
            "sysadmin",
            "participant",
            "mentor",
            "coordinator",
            "admin"
          ],
          "unreadMessageCount": 6,
          "lastMessage": "file received",
          "lastMessageCreated": "2022-04-11 03:21:44",
          "pusherChannel": "private-chat-93699394-f46f-45f4-9369-7a9b2385bba1",
          "canEdit": false,
          "__typename": "Channel"
        }
      ]
    }
  }

  get pusherChannels() {
    return {
      "channels": [
        {
          "pusherChannel": "private-chat-dcf52471-c7f3-4d9b-b53a-d4fd7775bb7e",
          "__typename": "Channel"
        },
        {
          "pusherChannel": "private-chat-dcc44692-c3e4-436c-a2e8-4d564a6ab70b",
          "__typename": "Channel"
        },
        {
          "pusherChannel": "private-chat-a6518010-816d-42a9-862b-7b78726bac89",
          "__typename": "Channel"
        },
        {
          "pusherChannel": "private-chat-bffc2265-6fa2-4e41-8063-70bafce7554f",
          "__typename": "Channel"
        },
        {
          "pusherChannel": "private-chat-8fbe55a1-3aa4-4f18-bd26-0da0284fa5b6",
          "__typename": "Channel"
        },
        {
          "pusherChannel": "private-chat-93699394-f46f-45f4-9369-7a9b2385bba1",
          "__typename": "Channel"
        }
      ]
    }
  }

  get allUnreadMessages() {
    return {
      "channels": [
        {
          "unreadMessageCount": 6,
          "__typename": "Channel"
        },
        {
          "unreadMessageCount": 0,
          "__typename": "Channel"
        },
        {
          "unreadMessageCount": 0,
          "__typename": "Channel"
        },
        {
          "unreadMessageCount": 0,
          "__typename": "Channel"
        },
        {
          "unreadMessageCount": 0,
          "__typename": "Channel"
        },
        {
          "unreadMessageCount": 6,
          "__typename": "Channel"
        }
      ]
    }
  }

  channelLogs(uuid) {
    if (uuid === "53fd8516-8b6b-49d3-9258-75a93303f5fc") {
      return {
        "channel": {
          "chatLogsConnection": {
            "cursor": "{\"t\":\"2022-04-11T03:20:34.000Z\",\"u\":[\"6895443a-9356-49e1-ac06-177cea5436b4\"]}",
            "chatLogs": [
              {
                "uuid": "41fe20fc-48e3-4c93-97fa-ec165571eee9",
                "isSender": true,
                "message": "cohort chat test message 07",
                "file": null,
                "created": "2022-04-11 03:37:15",
                "sender": {
                  "uuid": "4685083d-4da9-4b78-941e-7930510b34c0",
                  "name": "sasanga+L002",
                  "role": "participant",
                  "avatar": "https://www.gravatar.com/avatar/9c28dee4c06b0ee859d7093d3dd12168?d=https://admin.p2-stage.practera.com/img/user-512.png&s=50",
                  "__typename": "ChannelMember"
                },
                "__typename": "ChatLog"
              },
              {
                "uuid": "d54f41cd-c8a2-46a9-9ee6-b8c6c7e43d6b",
                "isSender": false,
                "message": "",
                "file": "{\"filename\":\"file-sample_150kB.pdf\",\"handle\":\"KRZuK6cQR2uwdSTaLgs8\",\"mimetype\":\"application/pdf\",\"originalPath\":\"file-sample_150kB.pdf\",\"size\":142786,\"source\":\"local_file_system\",\"url\":\"https://cdn.filestackcontent.com/KRZuK6cQR2uwdSTaLgs8\",\"uploadId\":\"uGCcrLd1wEQBEMQg\",\"originalFile\":{\"name\":\"file-sample_150kB.pdf\",\"type\":\"application/pdf\",\"size\":142786},\"status\":\"Stored\",\"key\":\"cutie/any/uploads/cc1176fc1ce0ca2e32145eef4aea69f0/TfYfh1G9QnWGbdil4Ulk_file-sample_150kB.pdf\",\"container\":\"files.p2-stage.practera.com\",\"workflows\":{\"3c38ef53-a9d0-4aa4-9234-617d9f03c0de\":{\"jobid\":\"3146b363-85f3-40c6-b477-2887687d1bd4\"}}}",
                "created": "2022-04-11 03:21:44",
                "sender": {
                  "uuid": "8ce9d6bf-2c26-21fc-166c-10346aa55fc9",
                  "name": "Sasanga Dev",
                  "role": "inst_admin",
                  "avatar": "https://www.gravatar.com/avatar/cfcfe4cfd55845de5a93c12438e71487?d=https://admin.p2-stage.practera.com/img/user-512.png&s=50",
                  "__typename": "ChannelMember"
                },
                "__typename": "ChatLog"
              },
              {
                "uuid": "520e9f6f-0766-4262-89f0-91bd7d6afc13",
                "isSender": false,
                "message": "",
                "file": "{\"filename\":\"Sample_Video_1280_x_720_1mb.mp4\",\"handle\":\"VNgnRX3tRzaAmcprcNuS\",\"mimetype\":\"video/mp4\",\"originalPath\":\"Sample Video 1280 x 720 1mb.mp4\",\"size\":1055736,\"source\":\"local_file_system\",\"url\":\"https://cdn.filestackcontent.com/VNgnRX3tRzaAmcprcNuS\",\"uploadId\":\"WkwmtENlUQZmr9ZP\",\"originalFile\":{\"name\":\"Sample Video 1280 x 720 1mb.mp4\",\"type\":\"video/mp4\",\"size\":1055736},\"status\":\"Stored\",\"key\":\"cutie/video/uploads/cc1176fc1ce0ca2e32145eef4aea69f0/B8VBKdasT0KgID5tAYaQ_Sample_Video_1280_x_720_1mb.mp4\",\"container\":\"files.p2-stage.practera.com\",\"workflows\":{\"3c38ef53-a9d0-4aa4-9234-617d9f03c0de\":{\"jobid\":\"6810b2b6-1bb3-4bb9-83e0-2b1078bbdf4c\"}}}",
                "created": "2022-04-11 03:21:26",
                "sender": {
                  "uuid": "8ce9d6bf-2c26-21fc-166c-10346aa55fc9",
                  "name": "Sasanga Dev",
                  "role": "inst_admin",
                  "avatar": "https://www.gravatar.com/avatar/cfcfe4cfd55845de5a93c12438e71487?d=https://admin.p2-stage.practera.com/img/user-512.png&s=50",
                  "__typename": "ChannelMember"
                },
                "__typename": "ChatLog"
              },
              {
                "uuid": "0213a367-b984-43f5-9f45-705844a1200b",
                "isSender": false,
                "message": "",
                "file": "{\"filename\":\"983794168.jpg\",\"handle\":\"mhmmAWsSbyDddEKnTGqq\",\"mimetype\":\"image/jpeg\",\"originalPath\":\"983794168.jpg\",\"size\":98468,\"source\":\"local_file_system\",\"url\":\"https://cdn.filestackcontent.com/mhmmAWsSbyDddEKnTGqq\",\"uploadId\":\"GjlJa3G9Ed5Lj46e\",\"originalFile\":{\"name\":\"983794168.jpg\",\"type\":\"image/jpeg\",\"size\":98468},\"status\":\"Stored\",\"key\":\"cutie/image/uploads/cc1176fc1ce0ca2e32145eef4aea69f0/o9d9AcSmRZiQQ1WJmySF_983794168.jpg\",\"container\":\"files.p2-stage.practera.com\",\"workflows\":{\"3c38ef53-a9d0-4aa4-9234-617d9f03c0de\":{\"jobid\":\"046a6e7d-340a-4d63-b025-b5796018d40e\"}}}",
                "created": "2022-04-11 03:21:04",
                "sender": {
                  "uuid": "8ce9d6bf-2c26-21fc-166c-10346aa55fc9",
                  "name": "Sasanga Dev",
                  "role": "inst_admin",
                  "avatar": "https://www.gravatar.com/avatar/cfcfe4cfd55845de5a93c12438e71487?d=https://admin.p2-stage.practera.com/img/user-512.png&s=50",
                  "__typename": "ChannelMember"
                },
                "__typename": "ChatLog"
              },
              {
                "uuid": "dc0649a5-5ea5-4872-a098-7a2d5a5b78f9",
                "isSender": false,
                "message": "cohort chat test mesage 03",
                "file": null,
                "created": "2022-04-11 03:20:46",
                "sender": {
                  "uuid": "8ce9d6bf-2c26-21fc-166c-10346aa55fc9",
                  "name": "Sasanga Dev",
                  "role": "inst_admin",
                  "avatar": "https://www.gravatar.com/avatar/cfcfe4cfd55845de5a93c12438e71487?d=https://admin.p2-stage.practera.com/img/user-512.png&s=50",
                  "__typename": "ChannelMember"
                },
                "__typename": "ChatLog"
              },
              {
                "uuid": "e2a8e11a-a9e0-4ebb-8a77-8ec00d1d4a06",
                "isSender": false,
                "message": "cohort chat test mesage 02",
                "file": null,
                "created": "2022-04-11 03:20:42",
                "sender": {
                  "uuid": "8ce9d6bf-2c26-21fc-166c-10346aa55fc9",
                  "name": "Sasanga Dev",
                  "role": "inst_admin",
                  "avatar": "https://www.gravatar.com/avatar/cfcfe4cfd55845de5a93c12438e71487?d=https://admin.p2-stage.practera.com/img/user-512.png&s=50",
                  "__typename": "ChannelMember"
                },
                "__typename": "ChatLog"
              },
              {
                "uuid": "6895443a-9356-49e1-ac06-177cea5436b4",
                "isSender": false,
                "message": "cohort chat test mesage 01",
                "file": null,
                "created": "2022-04-11 03:20:34",
                "sender": {
                  "uuid": "8ce9d6bf-2c26-21fc-166c-10346aa55fc9",
                  "name": "Sasanga Dev",
                  "role": "inst_admin",
                  "avatar": "https://www.gravatar.com/avatar/cfcfe4cfd55845de5a93c12438e71487?d=https://admin.p2-stage.practera.com/img/user-512.png&s=50",
                  "__typename": "ChannelMember"
                },
                "__typename": "ChatLog"
              }
            ],
            "__typename": "ChatLogsConnection"
          },
          "__typename": "Channel"
        }
      }
    }
    if (uuid === "d715a07d-e217-4330-aa82-c214f9e6a137") {
      return {
        "channel": {
          "chatLogsConnection": {
            "cursor": "{\"t\":\"2022-04-11T03:17:16.000Z\",\"u\":[\"62a4ef3e-3115-4fc4-a102-06268406a423\"]}",
            "chatLogs": [
              {
                "uuid": "198882ac-5f8f-4a89-91da-42b88053b7b4",
                "isSender": false,
                "message": "team 1 test mesage 06",
                "file": null,
                "created": "2022-04-11 03:18:48",
                "sender": {
                  "uuid": "8ce9d6bf-2c26-21fc-166c-10346aa55fc9",
                  "name": "Sasanga Dev",
                  "role": "inst_admin",
                  "avatar": "https://www.gravatar.com/avatar/cfcfe4cfd55845de5a93c12438e71487?d=https://admin.p2-stage.practera.com/img/user-512.png&s=50",
                  "__typename": "ChannelMember"
                },
                "__typename": "ChatLog"
              },
              {
                "uuid": "9c2a645c-7858-4eef-9fe0-9e0257215ac4",
                "isSender": false,
                "message": "",
                "file": "{\"filename\":\"file-sample_150kB.pdf\",\"handle\":\"NYDxgksTUqC2mOZfnzw4\",\"mimetype\":\"application/pdf\",\"originalPath\":\"file-sample_150kB.pdf\",\"size\":142786,\"source\":\"local_file_system\",\"url\":\"https://cdn.filestackcontent.com/NYDxgksTUqC2mOZfnzw4\",\"uploadId\":\"Mp3jjK0DjM1J25Q0\",\"originalFile\":{\"name\":\"file-sample_150kB.pdf\",\"type\":\"application/pdf\",\"size\":142786},\"status\":\"Stored\",\"key\":\"cutie/any/uploads/cc1176fc1ce0ca2e32145eef4aea69f0/gtLLmyliTrGwkFz0aNgh_file-sample_150kB.pdf\",\"container\":\"files.p2-stage.practera.com\",\"workflows\":{\"3c38ef53-a9d0-4aa4-9234-617d9f03c0de\":{\"jobid\":\"d70a16fd-9deb-4e44-9993-294be0657627\"}}}",
                "created": "2022-04-11 03:18:34",
                "sender": {
                  "uuid": "8ce9d6bf-2c26-21fc-166c-10346aa55fc9",
                  "name": "Sasanga Dev",
                  "role": "inst_admin",
                  "avatar": "https://www.gravatar.com/avatar/cfcfe4cfd55845de5a93c12438e71487?d=https://admin.p2-stage.practera.com/img/user-512.png&s=50",
                  "__typename": "ChannelMember"
                },
                "__typename": "ChatLog"
              },
              {
                "uuid": "afa55e65-d67a-457d-8d26-b8abb1b51dab",
                "isSender": false,
                "message": "",
                "file": "{\"filename\":\"Sample_Video_1280_x_720_1mb.mp4\",\"handle\":\"XIzbiabRScyqqSITNrnm\",\"mimetype\":\"video/mp4\",\"originalPath\":\"Sample Video 1280 x 720 1mb.mp4\",\"size\":1055736,\"source\":\"local_file_system\",\"url\":\"https://cdn.filestackcontent.com/XIzbiabRScyqqSITNrnm\",\"uploadId\":\"57HMHoiW43POq7Fe\",\"originalFile\":{\"name\":\"Sample Video 1280 x 720 1mb.mp4\",\"type\":\"video/mp4\",\"size\":1055736},\"status\":\"Stored\",\"key\":\"cutie/video/uploads/cc1176fc1ce0ca2e32145eef4aea69f0/o5SZaFRTlSc33o0i9ce2_Sample_Video_1280_x_720_1mb.mp4\",\"container\":\"files.p2-stage.practera.com\",\"workflows\":{\"3c38ef53-a9d0-4aa4-9234-617d9f03c0de\":{\"jobid\":\"43ca9aa9-564a-4e19-ba2a-5d89025f7e39\"}}}",
                "created": "2022-04-11 03:18:17",
                "sender": {
                  "uuid": "8ce9d6bf-2c26-21fc-166c-10346aa55fc9",
                  "name": "Sasanga Dev",
                  "role": "inst_admin",
                  "avatar": "https://www.gravatar.com/avatar/cfcfe4cfd55845de5a93c12438e71487?d=https://admin.p2-stage.practera.com/img/user-512.png&s=50",
                  "__typename": "ChannelMember"
                },
                "__typename": "ChatLog"
              },
              {
                "uuid": "33f9b903-6b37-4f99-84c4-ff5c4c4cee7f",
                "isSender": false,
                "message": "",
                "file": "{\"filename\":\"download.png\",\"handle\":\"3z9QukvRj6zJIXolueGh\",\"mimetype\":\"image/png\",\"originalPath\":\"download.png\",\"size\":1949,\"source\":\"local_file_system\",\"url\":\"https://cdn.filestackcontent.com/3z9QukvRj6zJIXolueGh\",\"uploadId\":\"Ib0F87SXOW043em1\",\"originalFile\":{\"name\":\"download.png\",\"type\":\"image/png\",\"size\":1949},\"status\":\"Stored\",\"key\":\"cutie/image/uploads/cc1176fc1ce0ca2e32145eef4aea69f0/oatBvxFhRrWUmlEhrXKI_download.png\",\"container\":\"files.p2-stage.practera.com\",\"workflows\":{\"3c38ef53-a9d0-4aa4-9234-617d9f03c0de\":{\"jobid\":\"c9d06e8c-b4b2-4dca-b792-f7c7ec9ef378\"}}}",
                "created": "2022-04-11 03:17:50",
                "sender": {
                  "uuid": "8ce9d6bf-2c26-21fc-166c-10346aa55fc9",
                  "name": "Sasanga Dev",
                  "role": "inst_admin",
                  "avatar": "https://www.gravatar.com/avatar/cfcfe4cfd55845de5a93c12438e71487?d=https://admin.p2-stage.practera.com/img/user-512.png&s=50",
                  "__typename": "ChannelMember"
                },
                "__typename": "ChatLog"
              },
              {
                "uuid": "df9752ba-0c82-468d-9f76-90ccf0163f5f",
                "isSender": false,
                "message": "team 1 test mesage 02",
                "file": null,
                "created": "2022-04-11 03:17:24",
                "sender": {
                  "uuid": "8ce9d6bf-2c26-21fc-166c-10346aa55fc9",
                  "name": "Sasanga Dev",
                  "role": "inst_admin",
                  "avatar": "https://www.gravatar.com/avatar/cfcfe4cfd55845de5a93c12438e71487?d=https://admin.p2-stage.practera.com/img/user-512.png&s=50",
                  "__typename": "ChannelMember"
                },
                "__typename": "ChatLog"
              },
              {
                "uuid": "62a4ef3e-3115-4fc4-a102-06268406a423",
                "isSender": false,
                "message": "team 1 test mesage 01",
                "file": null,
                "created": "2022-04-11 03:17:16",
                "sender": {
                  "uuid": "8ce9d6bf-2c26-21fc-166c-10346aa55fc9",
                  "name": "Sasanga Dev",
                  "role": "inst_admin",
                  "avatar": "https://www.gravatar.com/avatar/cfcfe4cfd55845de5a93c12438e71487?d=https://admin.p2-stage.practera.com/img/user-512.png&s=50",
                  "__typename": "ChannelMember"
                },
                "__typename": "ChatLog"
              }
            ],
            "__typename": "ChatLogsConnection"
          },
          "__typename": "Channel"
        }
      }
    }
    return {
      "channel": {
        "chatLogsConnection": {
          "cursor": "null",
          "chatLogs": [],
          "__typename": "ChatLogsConnection"
        },
        "__typename": "Channel"
      }
    }
  }

  get channelMenbers() {
    return {
      "channel": {
        "members": [
          {
            "uuid": "4685083d-4da9-4b78-941e-7930510b34c0",
            "name": "sasanga+L002",
            "role": "participant",
            "avatar": "https://www.gravatar.com/avatar/9c28dee4c06b0ee859d7093d3dd12168?d=https://admin.p2-stage.practera.com/img/user-512.png&s=50",
            "email": "sasanga+l002@practera.com",
            "__typename": "ChannelMember"
          },
          {
            "uuid": "2ec168ad-4a22-41ab-ac21-f25a916905f5",
            "name": "Sasanga+L002",
            "role": "participant",
            "avatar": "https://www.gravatar.com/avatar/9dadda393165062286c26a533d4ba61f?d=https://admin.p2-stage.practera.com/img/user-512.png&s=50",
            "email": "sasanga+l001@practera.com",
            "__typename": "ChannelMember"
          },
          {
            "uuid": "8ce9d6bf-2c26-21fc-166c-10346aa55fc9",
            "name": "Sasanga Dev",
            "role": "admin",
            "avatar": "https://www.gravatar.com/avatar/cfcfe4cfd55845de5a93c12438e71487?d=https://admin.p2-stage.practera.com/img/user-512.png&s=50",
            "email": "sasanga+dev@practera.com",
            "__typename": "ChannelMember"
          }
        ],
        "__typename": "Channel"
      }
    }
  }

  get markAsSeen() {
    return {
      "readChatLogs": {
        "success": true,
        "__typename": "Response"
      }
    }
  }

  createChatLog(message, file) {
    if (file !== null || file !== undefined) {
      return {
        "createChatLog": {
          "uuid": "cda4433a-54c5-4f56-9dd7-3643de66bc35",
          "isSender": true,
          "message": "",
          "file": file,
          "created": "2022-04-11 03:54:00",
          "sender": {
            "uuid": "4685083d-4da9-4b78-941e-7930510b34c0",
            "name": "sasanga+L002",
            "role": "participant",
            "avatar": "https://www.gravatar.com/avatar/9c28dee4c06b0ee859d7093d3dd12168?d=https://admin.p2-stage.practera.com/img/user-512.png&s=50",
            "__typename": "ChannelMember"
          },
          "__typename": "ChatLog"
        }
      }
    } else {
      return {
        "createChatLog": {
          "uuid": "41fe20fc-48e3-4c93-97fa-ec165571eee9",
          "isSender": true,
          "message": message,
          "file": null,
          "created": "2022-04-11 03:37:15",
          "sender": {
            "uuid": "4685083d-4da9-4b78-941e-7930510b34c0",
            "name": "sasanga+L002",
            "role": "participant",
            "avatar": "https://www.gravatar.com/avatar/9c28dee4c06b0ee859d7093d3dd12168?d=https://admin.p2-stage.practera.com/img/user-512.png&s=50",
            "__typename": "ChannelMember"
          },
          "__typename": "ChatLog"
        }
      }
    }
  }

  get eventList() {
    return [
      {
        "id": 33552,
        "activity_id": null,
        "activity_name": null,
        "start": "2022-04-25 18:30:00",
        "end": "2022-04-27 18:30:00",
        "location": "efojfojf",
        "title": "New Event 02",
        "description": "<p>wodwdwodjwd</p>",
        "capacity": 10,
        "type": "other",
        "all_day": true,
        "remaining_capacity": 10,
        "is_booked": false,
        "single_booking": false,
        "can_book": true,
        "assessment": null,
        "video_conference": null
      },
      {
        "id": 33551,
        "activity_id": null,
        "activity_name": null,
        "start": "2022-04-20 11:05:00",
        "end": "2022-04-21 11:05:00",
        "location": "sdsdsdsdsdsd",
        "title": "New Event",
        "description": "<p>sdsdsdsdsdsdsd</p>",
        "capacity": 100,
        "type": "other",
        "all_day": false,
        "remaining_capacity": 100,
        "is_booked": false,
        "single_booking": false,
        "can_book": true,
        "assessment": null,
        "video_conference": null
      }
    ]
  }

}
