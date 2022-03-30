import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

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
              deadline: '2022-03-05 15:00:00',
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
              name: "done assessment",
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
              id: 4,
              type: 'Locked',
              name: 'Locked',
              isLocked: true,
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

  assessment(id: number) {
    return of({ "data": { "assessment": { "id": 21, "name": "All question type", "type": "moderated", "description": null, "dueDate": null, "isTeam": false, "pulseCheck": true, "groups": [{ "name": "New Group", "description": "", "questions": [{ "id": 92804, "name": "Team member selector", "description": "", "type": "team member selector", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": null, "teamMembers": [{ "userId": 13914, "userName": "Learner 031", "teamId": 1799, "__typename": "AssessmentQuestionTeamMember" }], "__typename": "AssessmentQuestion" }, { "id": 92805, "name": "File upload", "description": "", "type": "file", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": "any", "choices": null, "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 92806, "name": "Checkboxes", "description": "", "type": "multiple", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": [{ "id": 295742, "name": "New Choice 1", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 295743, "name": "New Choice 2", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 295744, "name": "New Choice 3", "explanation": null, "description": "", "__typename": "AssessmentChoice" }], "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 92807, "name": "Multiple choice", "description": "", "type": "oneof", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": [{ "id": 295745, "name": "New Choice 1", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 295746, "name": "New Choice 2", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 295747, "name": "New Choice 3", "explanation": null, "description": "", "__typename": "AssessmentChoice" }], "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 92808, "name": "Text", "description": "", "type": "text", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": null, "teamMembers": null, "__typename": "AssessmentQuestion" }], "__typename": "AssessmentGroup" }], "submissions": [{ "id": 36842, "status": "published", "completed": false, "modified": "2022-03-29 08:44:54", "locked": false, "submitter": { "name": "learner 008", "image": null, "__typename": "User" }, "answers": [{ "questionId": 92805, "answer": { "filename": "P_20161110_094003.jpg.png", "handle": "Hr1hxmq0SRevtIz1rbRS", "mimetype": "image/png", "originalPath": "P_20161110_094003.jpg", "size": 3621112, "source": "local_file_system", "url": "https://cdn.filestackcontent.com/Hr1hxmq0SRevtIz1rbRS", "uploadId": "1CML5sZFk250ykGY", "originalFile": { "name": "P_20161110_094003.jpg", "type": "image/jpeg", "size": 1662080 }, "status": "Stored", "key": "appv2/dev/any/7251cca1e7a1b8e1022af89eac9e08c6/0DDec3cVTSG0BByNx548_P_20161110_094003.jpg.png", "container": "files.p2-sandbox.practera.com", "cropped": { "originalImageSize": [4096, 2304], "cropArea": { "position": [235, 275], "size": [1762, 1762] } }, "workflows": { "3c38ef53-a9d0-4aa4-9234-617d9f03c0de": { "jobid": "de236eb3-6776-4e46-869d-6548c3ceb506" } } }, "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 92808, "answer": "testing", "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 92807, "answer": "295747", "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 92806, "answer": [295743, 295742], "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 92804, "answer": "{\"userId\":13914,\"userName\":\"Learner 031\",\"teamId\":1799,\"__typename\":\"AssessmentQuestionTeamMember\"}", "__typename": "AssessmentSubmissionAnswer" }], "review": { "id": 6105, "status": "done", "modified": "2022-03-29 08:44:53", "reviewer": { "name": "Chaw Admin", "__typename": "User" }, "answers": [{ "questionId": 92805, "answer": { "filename": "P_20161015_121331.jpg.png", "handle": "N5bxByVSfK42QhLjyaAm", "mimetype": "image/png", "originalPath": "P_20161015_121331.jpg", "size": 5481101, "source": "local_file_system", "url": "https://cdn.filestackcontent.com/N5bxByVSfK42QhLjyaAm", "uploadId": "Twgq9uEGQEa0dp5T", "originalFile": { "name": "P_20161015_121331.jpg", "type": "image/jpeg", "size": 1339688 }, "status": "Stored", "key": "appv2/dev/any/e9de065c86c70baa8005dfbcf3cb692e/1PkwPQS0Cz9wb6Mz7HwK_P_20161015_121331.jpg.png", "container": "files.p2-sandbox.practera.com", "cropped": { "originalImageSize": [4096, 2304], "cropArea": { "position": [896, 0], "size": [2304, 2304] } }, "workflows": { "3c38ef53-a9d0-4aa4-9234-617d9f03c0de": { "jobid": "77402285-21ff-4e6d-93c1-531e911f9361" } } }, "comment": "", "__typename": "AssessmentReviewAnswer" }, { "questionId": 92806, "answer": [295743], "comment": "", "__typename": "AssessmentReviewAnswer" }, { "questionId": 92807, "answer": 295745, "comment": "", "__typename": "AssessmentReviewAnswer" }, { "questionId": 92808, "answer": "testing passed!", "comment": "", "__typename": "AssessmentReviewAnswer" }], "__typename": "AssessmentSubmissionReview" }, "__typename": "AssessmentSubmission" }], "__typename": "Assessment" } } });
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

  getAssessmentReviewed(id = 0) {
    const sets = [
      { "data": { "assessment": { "name": "All question type", "type": "moderated", "description": null, "dueDate": null, "isTeam": false, "pulseCheck": true, "groups": [{ "name": "New Group", "description": "", "questions": [{ "id": 92804, "name": "Team member selector", "description": "", "type": "team member selector", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": null, "teamMembers": [{ "userId": 13914, "userName": "Learner 031", "teamId": 1799, "__typename": "AssessmentQuestionTeamMember" }], "__typename": "AssessmentQuestion" }, { "id": 92805, "name": "File upload", "description": "", "type": "file", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": "any", "choices": null, "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 92806, "name": "Checkboxes", "description": "", "type": "multiple", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": [{ "id": 295742, "name": "New Choice 1", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 295743, "name": "New Choice 2", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 295744, "name": "New Choice 3", "explanation": null, "description": "", "__typename": "AssessmentChoice" }], "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 92807, "name": "Multiple choice", "description": "", "type": "oneof", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": [{ "id": 295745, "name": "New Choice 1", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 295746, "name": "New Choice 2", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 295747, "name": "New Choice 3", "explanation": null, "description": "", "__typename": "AssessmentChoice" }], "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 92808, "name": "Text", "description": "", "type": "text", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": null, "teamMembers": null, "__typename": "AssessmentQuestion" }], "__typename": "AssessmentGroup" }], "submissions": [{ "id": 36842, "status": "published", "completed": false, "modified": "2022-03-29 08:44:54", "locked": false, "submitter": { "name": "learner 008", "image": null, "__typename": "User" }, "answers": [{ "questionId": 92805, "answer": { "filename": "P_20161110_094003.jpg.png", "handle": "Hr1hxmq0SRevtIz1rbRS", "mimetype": "image/png", "originalPath": "P_20161110_094003.jpg", "size": 3621112, "source": "local_file_system", "url": "https://cdn.filestackcontent.com/Hr1hxmq0SRevtIz1rbRS", "uploadId": "1CML5sZFk250ykGY", "originalFile": { "name": "P_20161110_094003.jpg", "type": "image/jpeg", "size": 1662080 }, "status": "Stored", "key": "appv2/dev/any/7251cca1e7a1b8e1022af89eac9e08c6/0DDec3cVTSG0BByNx548_P_20161110_094003.jpg.png", "container": "files.p2-sandbox.practera.com", "cropped": { "originalImageSize": [4096, 2304], "cropArea": { "position": [235, 275], "size": [1762, 1762] } }, "workflows": { "3c38ef53-a9d0-4aa4-9234-617d9f03c0de": { "jobid": "de236eb3-6776-4e46-869d-6548c3ceb506" } } }, "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 92808, "answer": "testing", "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 92807, "answer": "295747", "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 92806, "answer": [295743, 295742], "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 92804, "answer": "{\"userId\":13914,\"userName\":\"Learner 031\",\"teamId\":1799,\"__typename\":\"AssessmentQuestionTeamMember\"}", "__typename": "AssessmentSubmissionAnswer" }], "review": { "id": 6105, "status": "done", "modified": "2022-03-29 08:44:53", "reviewer": { "name": "Chaw Admin", "__typename": "User" }, "answers": [{ "questionId": 92805, "answer": { "filename": "P_20161015_121331.jpg.png", "handle": "N5bxByVSfK42QhLjyaAm", "mimetype": "image/png", "originalPath": "P_20161015_121331.jpg", "size": 5481101, "source": "local_file_system", "url": "https://cdn.filestackcontent.com/N5bxByVSfK42QhLjyaAm", "uploadId": "Twgq9uEGQEa0dp5T", "originalFile": { "name": "P_20161015_121331.jpg", "type": "image/jpeg", "size": 1339688 }, "status": "Stored", "key": "appv2/dev/any/e9de065c86c70baa8005dfbcf3cb692e/1PkwPQS0Cz9wb6Mz7HwK_P_20161015_121331.jpg.png", "container": "files.p2-sandbox.practera.com", "cropped": { "originalImageSize": [4096, 2304], "cropArea": { "position": [896, 0], "size": [2304, 2304] } }, "workflows": { "3c38ef53-a9d0-4aa4-9234-617d9f03c0de": { "jobid": "77402285-21ff-4e6d-93c1-531e911f9361" } } }, "comment": "", "__typename": "AssessmentReviewAnswer" }, { "questionId": 92806, "answer": [295743], "comment": "", "__typename": "AssessmentReviewAnswer" }, { "questionId": 92807, "answer": 295745, "comment": "", "__typename": "AssessmentReviewAnswer" }, { "questionId": 92808, "answer": "testing passed!", "comment": "", "__typename": "AssessmentReviewAnswer" }], "__typename": "AssessmentSubmissionReview" }, "__typename": "AssessmentSubmission" }], "__typename": "Assessment" } } },
      { "data": { "assessment": { "name": "Pulse Check - Team Assessment", "type": "moderated", "description": "Description", "dueDate": null, "isTeam": true, "pulseCheck": true, "groups": [{ "name": "Group 1", "description": "Group Description", "questions": [{ "id": 89673, "name": "Q1", "description": "", "type": "oneof", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": [{ "id": 286318, "name": "A", "explanation": "Choice A explanation", "description": "Choice A description", "__typename": "AssessmentChoice" }, { "id": 286319, "name": "B", "explanation": "Choice B explanation", "description": "Choice B description", "__typename": "AssessmentChoice" }], "teamMembers": null, "__typename": "AssessmentQuestion" }], "__typename": "AssessmentGroup" }], "submissions": [{ "id": 36435, "status": "published", "completed": false, "modified": "2021-10-01 06:07:25", "locked": false, "submitter": { "name": "Learner 031", "image": null, "__typename": "User" }, "answers": [{ "questionId": 89673, "answer": "286318", "__typename": "AssessmentSubmissionAnswer" }], "review": { "id": 5729, "status": "done", "modified": "2021-10-01 06:07:24", "reviewer": { "name": "Expert 003", "__typename": "User" }, "answers": [{ "questionId": 89673, "answer": 286318, "comment": "", "__typename": "AssessmentReviewAnswer" }], "__typename": "AssessmentSubmissionReview" }, "__typename": "AssessmentSubmission" }], "__typename": "Assessment" } } }

    ];

    return of(sets[id]);
  }
}
