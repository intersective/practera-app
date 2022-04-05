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
    let response;
    switch (id) {
      case 21: // in progress
        response = {"data":{"assessment":{"name":"2. Moderated - team in-progress submission","type":"moderated","description":null,"dueDate":null,"isTeam":false,"pulseCheck":true,"groups":[{"name":"Report (Draft)","description":"","questions":[{"id":103122,"name":"Your team's report (Draft)","description":"","type":"file","isRequired":true,"hasComment":false,"audience":["submitter"],"fileType":"any","choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"}],"__typename":"AssessmentGroup"},{"name":"Feedback","description":"<span style=\"font-size: 13px;\">Clients: Please review the team's submission and to what extent they have achieved the following outcomes:</span><div><span style=\"font-size: 13px;\">1. Draft Report is professional</span></div><div><span style=\"font-size: 13px;\">2.&nbsp;Draft report aligns to the project brief</span></div><div><span style=\"font-size: 13px;\">3.&nbsp;Draft report has a clear direction</span></div><div><span style=\"font-size: 13px;\">For each outcome select the criteria they have achieved.</span><br></div>","questions":[],"__typename":"AssessmentGroup"}],"submissions":[{"id":36848,"status":"in progress","completed":false,"modified":"2022-03-31 06:48:41","locked":false,"submitter":{"name":"Sharon L000","image":null,"__typename":"User"},"answers":[{"questionId":103122,"answer":{"filename":"GROWPlan.docx","handle":"IzHJTJcSTEaBrKJav8kh","mimetype":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","originalPath":"GROWPlan.docx","size":17315,"source":"local_file_system","url":"https://cdn.filestackcontent.com/IzHJTJcSTEaBrKJav8kh","uploadId":"7ecO9B4iP8G5qpJA","originalFile":{"name":"GROWPlan.docx","type":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","size":17315},"status":"Stored","key":"appv2/test/any/ddfba7a5660fc2c5a43439755e4d6c08/cVV6vbHuSLmeWYmdVk0h_GROWPlan.docx","container":"files.p2-stage.practera.com","workflows":{"3c38ef53-a9d0-4aa4-9234-617d9f03c0de":{"jobid":"7f3b04a8-f2df-4102-8f63-e7afacd6e037"}}},"__typename":"AssessmentSubmissionAnswer"}],"review":null,"__typename":"AssessmentSubmission"}],"__typename":"Assessment"}}};
        break;
      case 22: // due date
        response = {"data":{"assessment":{"name":"1. Moderated - no submission","type":"moderated","description":null,"dueDate":'2122-03-05 15:00:00',"isTeam":true,"pulseCheck":true,"groups":[{"name":"Report (Draft)","description":"","questions":[{"id":103115,"name":"Your team's report (Draft)","description":"","type":"file","isRequired":true,"hasComment":false,"audience":["submitter"],"fileType":"any","choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"}],"__typename":"AssessmentGroup"},{"name":"Feedback","description":"<span style=\"font-size: 13px;\">Clients: Please review the team's submission and to what extent they have achieved the following outcomes:</span><div><span style=\"font-size: 13px;\">1. Draft Report is professional</span></div><div><span style=\"font-size: 13px;\">2.&nbsp;Draft report aligns to the project brief</span></div><div><span style=\"font-size: 13px;\">3.&nbsp;Draft report has a clear direction</span></div><div><span style=\"font-size: 13px;\">For each outcome select the criteria they have achieved.</span><br></div>","questions":[],"__typename":"AssessmentGroup"}],"submissions":[],"__typename":"Assessment"}}};
        break;
      case 23: // due today
        response = {"data":{"assessment":{"name":"1. Moderated - no submission","type":"moderated","description":null,"dueDate": (new Date()).toISOString(),"isTeam":false,"pulseCheck":true,"groups":[{"name":"Report (Draft)","description":"","questions":[{"id":103115,"name":"Your team's report (Draft)","description":"","type":"file","isRequired":true,"hasComment":false,"audience":["submitter"],"fileType":"any","choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"}],"__typename":"AssessmentGroup"},{"name":"Feedback","description":"<span style=\"font-size: 13px;\">Clients: Please review the team's submission and to what extent they have achieved the following outcomes:</span><div><span style=\"font-size: 13px;\">1. Draft Report is professional</span></div><div><span style=\"font-size: 13px;\">2.&nbsp;Draft report aligns to the project brief</span></div><div><span style=\"font-size: 13px;\">3.&nbsp;Draft report has a clear direction</span></div><div><span style=\"font-size: 13px;\">For each outcome select the criteria they have achieved.</span><br></div>","questions":[],"__typename":"AssessmentGroup"}],"submissions":[],"__typename":"Assessment"}}};
        break;
      case 24: // overdue
        response = {"data":{"assessment":{"name":"1. Moderated - no submission","type":"moderated","description":null,"dueDate": '2022-01-01 00:00:00',"isTeam":false,"pulseCheck":true,"groups":[{"name":"Report (Draft)","description":"","questions":[{"id":103115,"name":"Your team's report (Draft)","description":"","type":"file","isRequired":true,"hasComment":false,"audience":["submitter"],"fileType":"any","choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"}],"__typename":"AssessmentGroup"},{"name":"Feedback","description":"<span style=\"font-size: 13px;\">Clients: Please review the team's submission and to what extent they have achieved the following outcomes:</span><div><span style=\"font-size: 13px;\">1. Draft Report is professional</span></div><div><span style=\"font-size: 13px;\">2.&nbsp;Draft report aligns to the project brief</span></div><div><span style=\"font-size: 13px;\">3.&nbsp;Draft report has a clear direction</span></div><div><span style=\"font-size: 13px;\">For each outcome select the criteria they have achieved.</span><br></div>","questions":[],"__typename":"AssessmentGroup"}],"submissions":[],"__typename":"Assessment"}}};
        break;
      case 31: // pending review
        response = {"data":{"assessment":{"name":"4. Moderated submitted, waiting on review","type":"moderated","description":null,"dueDate":null,"isTeam":true,"pulseCheck":true,"groups":[{"name":"Report (Draft)","description":"","questions":[{"id":103142,"name":"Your team's report (Draft)","description":"","type":"file","isRequired":true,"hasComment":false,"audience":["submitter"],"fileType":"any","choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"}],"__typename":"AssessmentGroup"},{"name":"Feedback","description":"<span style=\"font-size: 13px;\">Clients: Please review the team's submission and to what extent they have achieved the following outcomes:</span><div><span style=\"font-size: 13px;\">1. Draft Report is professional</span></div><div><span style=\"font-size: 13px;\">2.&nbsp;Draft report aligns to the project brief</span></div><div><span style=\"font-size: 13px;\">3.&nbsp;Draft report has a clear direction</span></div><div><span style=\"font-size: 13px;\">For each outcome select the criteria they have achieved.</span><br></div>","questions":[],"__typename":"AssessmentGroup"}],"submissions":[{"id":36850,"status":"pending review","completed":false,"modified":"2022-03-31 07:00:40","locked":false,"submitter":{"name":"Sharon L002","image":null,"__typename":"User"},"answers":[{"questionId":103142,"answer":{"filename":"GROWPlan.docx","handle":"7zeK2YDXS2GyqdIWRVKk","mimetype":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","originalPath":"GROWPlan.docx","size":17315,"source":"local_file_system","url":"https://cdn.filestackcontent.com/7zeK2YDXS2GyqdIWRVKk","uploadId":"5iR4jopZuWXlmWLm","originalFile":{"name":"GROWPlan.docx","type":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","size":17315},"status":"Stored","key":"appv2/test/any/385ad07c3752eb087e71fe51a376bc60/f2AfSbUISaWTc9Zs2B8r_GROWPlan.docx","container":"files.p2-stage.practera.com","workflows":{"3c38ef53-a9d0-4aa4-9234-617d9f03c0de":{"jobid":"a8a82630-8b2d-4077-a824-829ed1996acd"}}},"__typename":"AssessmentSubmissionAnswer"}],"review":{"id":5980,"status":"not start","modified":"2022-03-31 07:00:40","reviewer":{"name":"Sharon M002","__typename":"User"},"answers":[],"__typename":"AssessmentSubmissionReview"},"__typename":"AssessmentSubmission"}],"__typename":"Assessment"}}};
        break;
      case 32: // feedback available
        response = {"data":{"assessment":{"name":"5. Moderated, Feedback done, waiting for learner to see feedback","type":"moderated","description":null,"dueDate":null,"isTeam":true,"pulseCheck":true,"groups":[{"name":"Report (Draft)","description":"","questions":[{"id":103149,"name":"Your team's report (Draft)","description":"","type":"file","isRequired":true,"hasComment":false,"audience":["submitter"],"fileType":"any","choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"}],"__typename":"AssessmentGroup"},{"name":"Feedback","description":"<span style=\"font-size: 13px;\">Clients: Please review the team's submission and to what extent they have achieved the following outcomes:</span><div><span style=\"font-size: 13px;\">1. Draft Report is professional</span></div><div><span style=\"font-size: 13px;\">2.&nbsp;Draft report aligns to the project brief</span></div><div><span style=\"font-size: 13px;\">3.&nbsp;Draft report has a clear direction</span></div><div><span style=\"font-size: 13px;\">For each outcome select the criteria they have achieved.</span><br></div>","questions":[{"id":103150,"name":"Optional detailed feedback: Download and annotate the team's Project Report, and re-upload it here","description":"","type":"file","isRequired":false,"hasComment":false,"audience":["reviewer"],"fileType":"any","choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103151,"name":"Outcome 1. Draft report is professional.","description":"Please select all that apply:","type":"multiple","isRequired":true,"hasComment":false,"audience":["reviewer"],"fileType":null,"choices":[{"id":332507,"name":"Draft report has a clear, logical structure","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332508,"name":"Communication is clear, concise and contains few/no spelling or grammatical errors","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332509,"name":"Draft report is visually appealing and, where appropriate, presents key data in supporting charts or infographics","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332510,"name":"None of the above","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103152,"name":"Outcome 2. Draft report aligns to the project brief.","description":"Please select all that apply:","type":"multiple","isRequired":true,"hasComment":false,"audience":["reviewer"],"fileType":null,"choices":[{"id":332511,"name":"Client's problem is clearly defined/stated and within the scope of the project","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332512,"name":"Research is evident and well sourced","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332513,"name":"Key themes/messages are identified from initial research and clearly communicated","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332514,"name":"None of the above","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103153,"name":"Outcome 3. Draft report has a clear direction.","description":"Please select all that apply:","type":"multiple","isRequired":true,"hasComment":false,"audience":["reviewer"],"fileType":null,"choices":[{"id":332515,"name":"Further research areas are clearly identified","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332516,"name":"Draft Report provides a clear pathway to the Final Report, including identification of any gaps or roadblocks","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332517,"name":"None of the above","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103154,"name":"Overall Report Quality (based on your opinion and criteria met):","description":"","type":"oneof","isRequired":true,"hasComment":false,"audience":["reviewer"],"fileType":null,"choices":[{"id":332518,"name":"Outstanding Quality (All criteria have been met)","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332519,"name":"High Quality (Most criteria have been met)","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332520,"name":"Adequate Quality (Some criteria have been met)","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332521,"name":"Low Quality (Few criteria have been met)","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332522,"name":"Poor Quality (No criteria have been met)","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103155,"name":"Please provide detailed feedback on how the team can address any gaps based on the criteria above or any other comments you would like to add:","description":"","type":"text","isRequired":true,"hasComment":false,"audience":["reviewer"],"fileType":null,"choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"}],"__typename":"AssessmentGroup"}],"submissions":[{"id":36851,"status":"published","completed":false,"modified":"2022-03-31 07:07:39","locked":false,"submitter":{"name":"Sharon L003","image":null,"__typename":"User"},"answers":[{"questionId":103149,"answer":{"filename":"GROWPlan.docx","handle":"o3ISfh1iTfacg8ISBb1V","mimetype":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","originalPath":"GROWPlan.docx","size":17315,"source":"local_file_system","url":"https://cdn.filestackcontent.com/o3ISfh1iTfacg8ISBb1V","uploadId":"9RSdN0o9txwGGHJi","originalFile":{"name":"GROWPlan.docx","type":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","size":17315},"status":"Stored","key":"appv2/test/any/7254217d81b43c1d3e0b04fa686c62a3/laDdGGfSpuaLVilDSShg_GROWPlan.docx","container":"files.p2-stage.practera.com","workflows":{"3c38ef53-a9d0-4aa4-9234-617d9f03c0de":{"jobid":"bafce0ca-f1ef-4ee8-8e56-5a34ccafee20"}}},"__typename":"AssessmentSubmissionAnswer"}],"review":{"id":5981,"status":"done","modified":"2022-03-31 07:07:37","reviewer":{"name":"Sharon M003","__typename":"User"},"answers":[{"questionId":103155,"answer":"Testing 5. Feedback done, waiting for learner to see the feedback","comment":"","__typename":"AssessmentReviewAnswer"},{"questionId":103154,"answer":332519,"comment":"","__typename":"AssessmentReviewAnswer"},{"questionId":103153,"answer":[332516,332515],"comment":"","__typename":"AssessmentReviewAnswer"},{"questionId":103152,"answer":[332511,332512,332513],"comment":"","__typename":"AssessmentReviewAnswer"},{"questionId":103151,"answer":[332507,332508],"comment":"","__typename":"AssessmentReviewAnswer"}],"__typename":"AssessmentSubmissionReview"},"__typename":"AssessmentSubmission"}],"__typename":"Assessment"}}};
        break;
      case 33: // done quiz
        response = {"data":{"assessment":{"name":"3. Quiz Submitted","type":"quiz","description":null,"dueDate":null,"isTeam":false,"pulseCheck":true,"groups":[{"name":"Program Declarations","description":"","questions":[{"id":103129,"name":"I understand I need to attend the mandatory Orientation session and need to successfully complete the project in order to receive my certificate (Team meetings will be organised by your team independently)","description":"","type":"oneof","isRequired":true,"hasComment":false,"audience":["reviewer","submitter"],"fileType":null,"choices":[{"id":332450,"name":"Yes","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332451,"name":"No, you MUST contact programs@practera.com to confirm you are still eligible to complete the program","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103130,"name":"I hereby give permission for my images captured during the duration of the Program through video conference tools, photo and digital camera, to be used solely for the purposes of the program's promotional material and publications","description":"","type":"oneof","isRequired":true,"hasComment":false,"audience":["reviewer","submitter"],"fileType":null,"choices":[{"id":332452,"name":"Yes","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332453,"name":"No","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"}],"__typename":"AssessmentGroup"},{"name":"Your details","description":"","questions":[{"id":103131,"name":"Phone number","description":"","type":"text","isRequired":true,"hasComment":false,"audience":["reviewer","submitter"],"fileType":null,"choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103132,"name":"WeChat (optional)","description":"","type":"text","isRequired":false,"hasComment":false,"audience":["reviewer","submitter"],"fileType":null,"choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"}],"__typename":"AssessmentGroup"},{"name":"About you","description":"","questions":[{"id":103133,"name":"Gender","description":"","type":"oneof","isRequired":false,"hasComment":false,"audience":["reviewer","submitter"],"fileType":null,"choices":[{"id":332454,"name":"Female","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332455,"name":"Male","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332456,"name":"Prefer not to disclose","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332457,"name":"Other","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103134,"name":"Domestic or International student","description":"","type":"oneof","isRequired":false,"hasComment":false,"audience":["reviewer","submitter"],"fileType":null,"choices":[{"id":332458,"name":"International","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332459,"name":"Domestic","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103135,"name":"Country or region you most identify with","description":"","type":"oneof","isRequired":false,"hasComment":false,"audience":["reviewer","submitter"],"fileType":null,"choices":[{"id":332460,"name":"Australia/NZ","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332461,"name":"Africa","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332462,"name":"China","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332463,"name":"European Union","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332464,"name":"India","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332465,"name":"Indonesia","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332466,"name":"Japan","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332467,"name":"Korea","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332468,"name":"Malaysia","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332469,"name":"Middle East","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332470,"name":"North America","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332471,"name":"South America","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332472,"name":"South East Asia","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332473,"name":"United Kingdom","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332474,"name":"Vietnam","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332475,"name":"Other","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103136,"name":"If you answered 'Other' to the question above, please provide details below","description":"","type":"text","isRequired":false,"hasComment":false,"audience":["reviewer","submitter"],"fileType":null,"choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103137,"name":"Level of study","description":"","type":"oneof","isRequired":true,"hasComment":false,"audience":["reviewer","submitter"],"fileType":null,"choices":[{"id":332476,"name":"Vocational","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332477,"name":"Undergraduate","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332478,"name":"Postgraduate","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332479,"name":"PhD","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103138,"name":"Area of study","description":"","type":"oneof","isRequired":true,"hasComment":false,"audience":["reviewer","submitter"],"fileType":null,"choices":[{"id":332480,"name":"Art, Design and Architecture","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332481,"name":"Arts & Humanities","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332482,"name":"Business and Economics","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332483,"name":"Education","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332484,"name":"Engineering","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332485,"name":"Information Technology","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332486,"name":"Law","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332487,"name":"Medicine, Nursing and Health Sciences","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332488,"name":"Other","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103139,"name":"If you answered 'Other' to the question above, please provide details below","description":"","type":"text","isRequired":false,"hasComment":false,"audience":["reviewer","submitter"],"fileType":null,"choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103140,"name":"Where are you?","description":"","type":"oneof","isRequired":true,"hasComment":false,"audience":["reviewer","submitter"],"fileType":null,"choices":[{"id":332489,"name":"Onshore - I am physically in Australia","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332490,"name":"Offshore - I am physically in another country right now","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103141,"name":"University LIST MULTIPLE UNIS OR REMOVE IF ONLY 1 UNI PARTICIPATING","description":"","type":"oneof","isRequired":false,"hasComment":false,"audience":["reviewer","submitter"],"fileType":null,"choices":[],"teamMembers":null,"__typename":"AssessmentQuestion"}],"__typename":"AssessmentGroup"}],"submissions":[{"id":36849,"status":"done","completed":true,"modified":"2022-03-31 06:49:08","locked":false,"submitter":{"name":"Sharon L000","image":null,"__typename":"User"},"answers":[{"questionId":103141,"answer":"","__typename":"AssessmentSubmissionAnswer"},{"questionId":103140,"answer":"332490","__typename":"AssessmentSubmissionAnswer"},{"questionId":103139,"answer":"","__typename":"AssessmentSubmissionAnswer"},{"questionId":103138,"answer":"332485","__typename":"AssessmentSubmissionAnswer"},{"questionId":103137,"answer":"332478","__typename":"AssessmentSubmissionAnswer"},{"questionId":103136,"answer":"","__typename":"AssessmentSubmissionAnswer"},{"questionId":103135,"answer":"332464","__typename":"AssessmentSubmissionAnswer"},{"questionId":103134,"answer":"332458","__typename":"AssessmentSubmissionAnswer"},{"questionId":103133,"answer":"332454","__typename":"AssessmentSubmissionAnswer"},{"questionId":103132,"answer":"","__typename":"AssessmentSubmissionAnswer"},{"questionId":103131,"answer":"873843294739","__typename":"AssessmentSubmissionAnswer"},{"questionId":103130,"answer":"332452","__typename":"AssessmentSubmissionAnswer"},{"questionId":103129,"answer":"332450","__typename":"AssessmentSubmissionAnswer"}],"review":null,"__typename":"AssessmentSubmission"}],"__typename":"Assessment"}}};
        break;
      case 34: // team assessment
        response = {"data":{"assessment":{"name":"7. Moderated team - another team member has in-progress( locked for current user)","type":"moderated","description":null,"dueDate":null,"isTeam":true,"pulseCheck":true,"groups":[{"name":"Report (Draft)","description":"","questions":[{"id":103163,"name":"Your team's report (Draft)","description":"","type":"file","isRequired":true,"hasComment":false,"audience":["submitter"],"fileType":"any","choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"}],"__typename":"AssessmentGroup"},{"name":"Feedback","description":"<span style=\"font-size: 13px;\">Clients: Please review the team's submission and to what extent they have achieved the following outcomes:</span><div><span style=\"font-size: 13px;\">1. Draft Report is professional</span></div><div><span style=\"font-size: 13px;\">2.&nbsp;Draft report aligns to the project brief</span></div><div><span style=\"font-size: 13px;\">3.&nbsp;Draft report has a clear direction</span></div><div><span style=\"font-size: 13px;\">For each outcome select the criteria they have achieved.</span><br></div>","questions":[],"__typename":"AssessmentGroup"}],"submissions":[{"id":36853,"status":"in progress","completed":false,"modified":"2022-03-31 07:20:06","locked":true,"submitter":{"name":"Sharon L333","image":null,"__typename":"User"},"answers":[{"questionId":103163,"answer":{"filename":"GROWPlan.docx","handle":"Jj3BwxRHRXaqxrgCb9fK","mimetype":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","originalPath":"GROWPlan.docx","size":17315,"source":"local_file_system","url":"https://cdn.filestackcontent.com/Jj3BwxRHRXaqxrgCb9fK","uploadId":"XXVdUB55ipXp6H2Q","originalFile":{"name":"GROWPlan.docx","type":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","size":17315},"status":"Stored","key":"appv2/test/any/6faad08525beb34ff8254507bae5588d/ZtbHCl9BRF2FzmJMIAk7_GROWPlan.docx","container":"files.p2-stage.practera.com","workflows":{"3c38ef53-a9d0-4aa4-9234-617d9f03c0de":{"jobid":"f05401b0-e09d-4d87-97a3-ff6c56e3e972"}}},"__typename":"AssessmentSubmissionAnswer"}],"review":null,"__typename":"AssessmentSubmission"}],"__typename":"Assessment"}}};
        break;
      case 35: // done moderated
        response = {"data":{"assessment":{"name":"6. Moderated, Feedback done, Learner seen feedback","type":"moderated","description":null,"dueDate":null,"isTeam":true,"pulseCheck":true,"groups":[{"name":"Report (Draft)","description":"","questions":[{"id":103156,"name":"Your team's report (Draft)","description":"","type":"file","isRequired":true,"hasComment":false,"audience":["submitter"],"fileType":"any","choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"}],"__typename":"AssessmentGroup"},{"name":"Feedback","description":"<span style=\"font-size: 13px;\">Clients: Please review the team's submission and to what extent they have achieved the following outcomes:</span><div><span style=\"font-size: 13px;\">1. Draft Report is professional</span></div><div><span style=\"font-size: 13px;\">2.&nbsp;Draft report aligns to the project brief</span></div><div><span style=\"font-size: 13px;\">3.&nbsp;Draft report has a clear direction</span></div><div><span style=\"font-size: 13px;\">For each outcome select the criteria they have achieved.</span><br></div>","questions":[{"id":103157,"name":"Optional detailed feedback: Download and annotate the team's Project Report, and re-upload it here","description":"","type":"file","isRequired":false,"hasComment":false,"audience":["reviewer"],"fileType":"any","choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103158,"name":"Outcome 1. Draft report is professional.","description":"Please select all that apply:","type":"multiple","isRequired":true,"hasComment":false,"audience":["reviewer"],"fileType":null,"choices":[{"id":332523,"name":"Draft report has a clear, logical structure","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332524,"name":"Communication is clear, concise and contains few/no spelling or grammatical errors","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332525,"name":"Draft report is visually appealing and, where appropriate, presents key data in supporting charts or infographics","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332526,"name":"None of the above","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103159,"name":"Outcome 2. Draft report aligns to the project brief.","description":"Please select all that apply:","type":"multiple","isRequired":true,"hasComment":false,"audience":["reviewer"],"fileType":null,"choices":[{"id":332527,"name":"Client's problem is clearly defined/stated and within the scope of the project","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332528,"name":"Research is evident and well sourced","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332529,"name":"Key themes/messages are identified from initial research and clearly communicated","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332530,"name":"None of the above","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103160,"name":"Outcome 3. Draft report has a clear direction.","description":"Please select all that apply:","type":"multiple","isRequired":true,"hasComment":false,"audience":["reviewer"],"fileType":null,"choices":[{"id":332531,"name":"Further research areas are clearly identified","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332532,"name":"Draft Report provides a clear pathway to the Final Report, including identification of any gaps or roadblocks","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332533,"name":"None of the above","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103161,"name":"Overall Report Quality (based on your opinion and criteria met):","description":"","type":"oneof","isRequired":true,"hasComment":false,"audience":["reviewer"],"fileType":null,"choices":[{"id":332534,"name":"Outstanding Quality (All criteria have been met)","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332535,"name":"High Quality (Most criteria have been met)","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332536,"name":"Adequate Quality (Some criteria have been met)","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332537,"name":"Low Quality (Few criteria have been met)","explanation":null,"description":"","__typename":"AssessmentChoice"},{"id":332538,"name":"Poor Quality (No criteria have been met)","explanation":null,"description":"","__typename":"AssessmentChoice"}],"teamMembers":null,"__typename":"AssessmentQuestion"},{"id":103162,"name":"Please provide detailed feedback on how the team can address any gaps based on the criteria above or any other comments you would like to add:","description":"","type":"text","isRequired":true,"hasComment":false,"audience":["reviewer"],"fileType":null,"choices":null,"teamMembers":null,"__typename":"AssessmentQuestion"}],"__typename":"AssessmentGroup"}],"submissions":[{"id":36852,"status":"published","completed":true,"modified":"2022-03-31 07:14:04","locked":false,"submitter":{"name":"Sharon L004","image":"https://cdn.filestackcontent.com/min8HcECRNqid6RFx0Lo","__typename":"User"},"answers":[{"questionId":103156,"answer":{"filename":"GROWPlan.docx","handle":"f5fF6RWwTG639KwcjSYP","mimetype":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","originalPath":"GROWPlan.docx","size":17315,"source":"local_file_system","url":"https://cdn.filestackcontent.com/f5fF6RWwTG639KwcjSYP","uploadId":"h8j9rHxaHV5L7Ym1","originalFile":{"name":"GROWPlan.docx","type":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","size":17315},"status":"Stored","key":"appv2/test/any/b29f91502651c1036a5995f75e4b7726/MrxzcuMdQQCwDgsianPr_GROWPlan.docx","container":"files.p2-stage.practera.com","workflows":{"3c38ef53-a9d0-4aa4-9234-617d9f03c0de":{"jobid":"a07b2e4b-2840-4139-b8ab-db2a623892e6"}}},"__typename":"AssessmentSubmissionAnswer"}],"review":{"id":5982,"status":"done","modified":"2022-03-31 07:14:03","reviewer":{"name":"Sharon M004","__typename":"User"},"answers":[{"questionId":103162,"answer":"Feedback done, learner has seen the feedback","comment":"","__typename":"AssessmentReviewAnswer"},{"questionId":103161,"answer":332537,"comment":"","__typename":"AssessmentReviewAnswer"},{"questionId":103160,"answer":[332532],"comment":"","__typename":"AssessmentReviewAnswer"},{"questionId":103159,"answer":[332527,332528],"comment":"","__typename":"AssessmentReviewAnswer"},{"questionId":103158,"answer":[332523,332524],"comment":"","__typename":"AssessmentReviewAnswer"}],"__typename":"AssessmentSubmissionReview"},"__typename":"AssessmentSubmission"}],"__typename":"Assessment"}}};
        break;
      case 11150:
        response = { "data": { "assessment": { "name": "All question type", "type": "moderated", "description": null, "dueDate": null, "isTeam": false, "pulseCheck": true, "groups": [{ "name": "New Group", "description": "", "questions": [{ "id": 92804, "name": "Team member selector", "description": "", "type": "team member selector", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": null, "teamMembers": [{ "userId": 13914, "userName": "Learner 031", "teamId": 1799, "__typename": "AssessmentQuestionTeamMember" }], "__typename": "AssessmentQuestion" }, { "id": 92805, "name": "File upload", "description": "", "type": "file", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": "any", "choices": null, "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 92806, "name": "Checkboxes", "description": "", "type": "multiple", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": [{ "id": 295742, "name": "New Choice 1", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 295743, "name": "New Choice 2", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 295744, "name": "New Choice 3", "explanation": null, "description": "", "__typename": "AssessmentChoice" }], "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 92807, "name": "Multiple choice", "description": "", "type": "oneof", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": [{ "id": 295745, "name": "New Choice 1", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 295746, "name": "New Choice 2", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 295747, "name": "New Choice 3", "explanation": null, "description": "", "__typename": "AssessmentChoice" }], "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 92808, "name": "Text", "description": "", "type": "text", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": null, "teamMembers": null, "__typename": "AssessmentQuestion" }], "__typename": "AssessmentGroup" }], "submissions": [{ "id": 36842, "status": "published", "completed": false, "modified": "2022-03-29 08:44:54", "locked": false, "submitter": { "name": "learner 008", "image": null, "__typename": "User" }, "answers": [{ "questionId": 92805, "answer": { "filename": "P_20161110_094003.jpg.png", "handle": "Hr1hxmq0SRevtIz1rbRS", "mimetype": "image/png", "originalPath": "P_20161110_094003.jpg", "size": 3621112, "source": "local_file_system", "url": "https://cdn.filestackcontent.com/Hr1hxmq0SRevtIz1rbRS", "uploadId": "1CML5sZFk250ykGY", "originalFile": { "name": "P_20161110_094003.jpg", "type": "image/jpeg", "size": 1662080 }, "status": "Stored", "key": "appv2/dev/any/7251cca1e7a1b8e1022af89eac9e08c6/0DDec3cVTSG0BByNx548_P_20161110_094003.jpg.png", "container": "files.p2-sandbox.practera.com", "cropped": { "originalImageSize": [4096, 2304], "cropArea": { "position": [235, 275], "size": [1762, 1762] } }, "workflows": { "3c38ef53-a9d0-4aa4-9234-617d9f03c0de": { "jobid": "de236eb3-6776-4e46-869d-6548c3ceb506" } } }, "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 92808, "answer": "testing", "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 92807, "answer": "295747", "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 92806, "answer": [295743, 295742], "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 92804, "answer": "{\"userId\":13914,\"userName\":\"Learner 031\",\"teamId\":1799,\"__typename\":\"AssessmentQuestionTeamMember\"}", "__typename": "AssessmentSubmissionAnswer" }], "review": { "id": 6105, "status": "done", "modified": "2022-03-29 08:44:53", "reviewer": { "name": "Chaw Admin", "__typename": "User" }, "answers": [{ "questionId": 92805, "answer": { "filename": "P_20161015_121331.jpg.png", "handle": "N5bxByVSfK42QhLjyaAm", "mimetype": "image/png", "originalPath": "P_20161015_121331.jpg", "size": 5481101, "source": "local_file_system", "url": "https://cdn.filestackcontent.com/N5bxByVSfK42QhLjyaAm", "uploadId": "Twgq9uEGQEa0dp5T", "originalFile": { "name": "P_20161015_121331.jpg", "type": "image/jpeg", "size": 1339688 }, "status": "Stored", "key": "appv2/dev/any/e9de065c86c70baa8005dfbcf3cb692e/1PkwPQS0Cz9wb6Mz7HwK_P_20161015_121331.jpg.png", "container": "files.p2-sandbox.practera.com", "cropped": { "originalImageSize": [4096, 2304], "cropArea": { "position": [896, 0], "size": [2304, 2304] } }, "workflows": { "3c38ef53-a9d0-4aa4-9234-617d9f03c0de": { "jobid": "77402285-21ff-4e6d-93c1-531e911f9361" } } }, "comment": "", "__typename": "AssessmentReviewAnswer" }, { "questionId": 92806, "answer": [295743], "comment": "", "__typename": "AssessmentReviewAnswer" }, { "questionId": 92807, "answer": 295745, "comment": "", "__typename": "AssessmentReviewAnswer" }, { "questionId": 92808, "answer": "testing passed!", "comment": "", "__typename": "AssessmentReviewAnswer" }], "__typename": "AssessmentSubmissionReview" }, "__typename": "AssessmentSubmission" }], "__typename": "Assessment" } } };
      break;
    }

    return of(response).pipe(delay(1000));
    //return of({ "data": { "assessment": { "id": 21, "name": "All question type", "type": "moderated", "description": null, "dueDate": null, "isTeam": false, "pulseCheck": true, "groups": [{ "name": "New Group", "description": "", "questions": [{ "id": 92804, "name": "Team member selector", "description": "", "type": "team member selector", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": null, "teamMembers": [{ "userId": 13914, "userName": "Learner 031", "teamId": 1799, "__typename": "AssessmentQuestionTeamMember" }], "__typename": "AssessmentQuestion" }, { "id": 92805, "name": "File upload", "description": "", "type": "file", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": "any", "choices": null, "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 92806, "name": "Checkboxes", "description": "", "type": "multiple", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": [{ "id": 295742, "name": "New Choice 1", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 295743, "name": "New Choice 2", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 295744, "name": "New Choice 3", "explanation": null, "description": "", "__typename": "AssessmentChoice" }], "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 92807, "name": "Multiple choice", "description": "", "type": "oneof", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": [{ "id": 295745, "name": "New Choice 1", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 295746, "name": "New Choice 2", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 295747, "name": "New Choice 3", "explanation": null, "description": "", "__typename": "AssessmentChoice" }], "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 92808, "name": "Text", "description": "", "type": "text", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": null, "teamMembers": null, "__typename": "AssessmentQuestion" }], "__typename": "AssessmentGroup" }], "submissions": [{ "id": 36842, "status": "published", "completed": false, "modified": "2022-03-29 08:44:54", "locked": false, "submitter": { "name": "learner 008", "image": null, "__typename": "User" }, "answers": [{ "questionId": 92805, "answer": { "filename": "P_20161110_094003.jpg.png", "handle": "Hr1hxmq0SRevtIz1rbRS", "mimetype": "image/png", "originalPath": "P_20161110_094003.jpg", "size": 3621112, "source": "local_file_system", "url": "https://cdn.filestackcontent.com/Hr1hxmq0SRevtIz1rbRS", "uploadId": "1CML5sZFk250ykGY", "originalFile": { "name": "P_20161110_094003.jpg", "type": "image/jpeg", "size": 1662080 }, "status": "Stored", "key": "appv2/dev/any/7251cca1e7a1b8e1022af89eac9e08c6/0DDec3cVTSG0BByNx548_P_20161110_094003.jpg.png", "container": "files.p2-sandbox.practera.com", "cropped": { "originalImageSize": [4096, 2304], "cropArea": { "position": [235, 275], "size": [1762, 1762] } }, "workflows": { "3c38ef53-a9d0-4aa4-9234-617d9f03c0de": { "jobid": "de236eb3-6776-4e46-869d-6548c3ceb506" } } }, "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 92808, "answer": "testing", "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 92807, "answer": "295747", "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 92806, "answer": [295743, 295742], "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 92804, "answer": "{\"userId\":13914,\"userName\":\"Learner 031\",\"teamId\":1799,\"__typename\":\"AssessmentQuestionTeamMember\"}", "__typename": "AssessmentSubmissionAnswer" }], "review": { "id": 6105, "status": "done", "modified": "2022-03-29 08:44:53", "reviewer": { "name": "Chaw Admin", "__typename": "User" }, "answers": [{ "questionId": 92805, "answer": { "filename": "P_20161015_121331.jpg.png", "handle": "N5bxByVSfK42QhLjyaAm", "mimetype": "image/png", "originalPath": "P_20161015_121331.jpg", "size": 5481101, "source": "local_file_system", "url": "https://cdn.filestackcontent.com/N5bxByVSfK42QhLjyaAm", "uploadId": "Twgq9uEGQEa0dp5T", "originalFile": { "name": "P_20161015_121331.jpg", "type": "image/jpeg", "size": 1339688 }, "status": "Stored", "key": "appv2/dev/any/e9de065c86c70baa8005dfbcf3cb692e/1PkwPQS0Cz9wb6Mz7HwK_P_20161015_121331.jpg.png", "container": "files.p2-sandbox.practera.com", "cropped": { "originalImageSize": [4096, 2304], "cropArea": { "position": [896, 0], "size": [2304, 2304] } }, "workflows": { "3c38ef53-a9d0-4aa4-9234-617d9f03c0de": { "jobid": "77402285-21ff-4e6d-93c1-531e911f9361" } } }, "comment": "", "__typename": "AssessmentReviewAnswer" }, { "questionId": 92806, "answer": [295743], "comment": "", "__typename": "AssessmentReviewAnswer" }, { "questionId": 92807, "answer": 295745, "comment": "", "__typename": "AssessmentReviewAnswer" }, { "questionId": 92808, "answer": "testing passed!", "comment": "", "__typename": "AssessmentReviewAnswer" }], "__typename": "AssessmentSubmissionReview" }, "__typename": "AssessmentSubmission" }], "__typename": "Assessment" } } }).pipe(delay(1000));
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

  getReviews(): Observable<any> {
    return of({ "success": true, "status": "success", "cache": false, "data": [{ "AssessmentReview": { "id": 6106, "assessment_id": 11150, "assessment_submission_id": 36842, "reviewer_id": 14469, "reviewer_team_id": 1799, "score": "0", "is_done": false, "created": "2022-03-30 17:33:46", "modified": "2022-03-30 17:33:46", "status": "not start", "meta": null, "uuid": "7b3d72c2-a82d-40ef-a525-35ee4725e438" }, "Assessment": { "id": 11150, "name": "All question type" }, "AssessmentSubmission": { "id": 36842, "submitter_id": 13905, "created": "2022-03-29 02:34:41", "modified": "2022-03-30 17:33:48", "status": "pending review", "assessment_id": 11150, "order": null, "submitted": "2022-03-29 08:42:21", "team_id": 1799, "program_id": 961, "activity_id": 16417, "score": "0.75", "moderated_score": "0.5", "publish_date": "2022-03-29 08:44:54", "review_score": "0", "timeline_id": 1294, "context_id": 15796, "publisher_id": 13901, "locked": false, "uuid": "e5d5fa03-8ff7-4861-8c3f-d230e8fbb1e0", "Activity": { "name": "My Style" }, "Submitter": { "id": 13905, "name": "learner 008", "email": "learner_008@practera.com" }, "Team": { "id": 1799, "name": "Team 2" } } }] });
  }

  getAssessmentReviewed(id?): Observable<any> {
    const sets = [
      { "data": { "assessment": { "name": "All question type", "type": "moderated", "description": null, "dueDate": null, "isTeam": false, "pulseCheck": true, "groups": [{ "name": "New Group", "description": "", "questions": [{ "id": 92804, "name": "Team member selector", "description": "", "type": "team member selector", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": null, "teamMembers": [{ "userId": 13914, "userName": "Learner 031", "teamId": 1799, "__typename": "AssessmentQuestionTeamMember" }], "__typename": "AssessmentQuestion" }, { "id": 92805, "name": "File upload", "description": "", "type": "file", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": "any", "choices": null, "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 92806, "name": "Checkboxes", "description": "", "type": "multiple", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": [{ "id": 295742, "name": "New Choice 1", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 295743, "name": "New Choice 2", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 295744, "name": "New Choice 3", "explanation": null, "description": "", "__typename": "AssessmentChoice" }], "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 92807, "name": "Multiple choice", "description": "", "type": "oneof", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": [{ "id": 295745, "name": "New Choice 1", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 295746, "name": "New Choice 2", "explanation": null, "description": "", "__typename": "AssessmentChoice" }, { "id": 295747, "name": "New Choice 3", "explanation": null, "description": "", "__typename": "AssessmentChoice" }], "teamMembers": null, "__typename": "AssessmentQuestion" }, { "id": 92808, "name": "Text", "description": "", "type": "text", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": null, "teamMembers": null, "__typename": "AssessmentQuestion" }], "__typename": "AssessmentGroup" }], "submissions": [{ "id": 36842, "status": "published", "completed": false, "modified": "2022-03-29 08:44:54", "locked": false, "submitter": { "name": "learner 008", "image": null, "__typename": "User" }, "answers": [{ "questionId": 92805, "answer": { "filename": "P_20161110_094003.jpg.png", "handle": "Hr1hxmq0SRevtIz1rbRS", "mimetype": "image/png", "originalPath": "P_20161110_094003.jpg", "size": 3621112, "source": "local_file_system", "url": "https://cdn.filestackcontent.com/Hr1hxmq0SRevtIz1rbRS", "uploadId": "1CML5sZFk250ykGY", "originalFile": { "name": "P_20161110_094003.jpg", "type": "image/jpeg", "size": 1662080 }, "status": "Stored", "key": "appv2/dev/any/7251cca1e7a1b8e1022af89eac9e08c6/0DDec3cVTSG0BByNx548_P_20161110_094003.jpg.png", "container": "files.p2-sandbox.practera.com", "cropped": { "originalImageSize": [4096, 2304], "cropArea": { "position": [235, 275], "size": [1762, 1762] } }, "workflows": { "3c38ef53-a9d0-4aa4-9234-617d9f03c0de": { "jobid": "de236eb3-6776-4e46-869d-6548c3ceb506" } } }, "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 92808, "answer": "testing", "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 92807, "answer": "295747", "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 92806, "answer": [295743, 295742], "__typename": "AssessmentSubmissionAnswer" }, { "questionId": 92804, "answer": "{\"userId\":13914,\"userName\":\"Learner 031\",\"teamId\":1799,\"__typename\":\"AssessmentQuestionTeamMember\"}", "__typename": "AssessmentSubmissionAnswer" }], "review": { "id": 6105, "status": "done", "modified": "2022-03-29 08:44:53", "reviewer": { "name": "Chaw Admin", "__typename": "User" }, "answers": [{ "questionId": 92805, "answer": { "filename": "P_20161015_121331.jpg.png", "handle": "N5bxByVSfK42QhLjyaAm", "mimetype": "image/png", "originalPath": "P_20161015_121331.jpg", "size": 5481101, "source": "local_file_system", "url": "https://cdn.filestackcontent.com/N5bxByVSfK42QhLjyaAm", "uploadId": "Twgq9uEGQEa0dp5T", "originalFile": { "name": "P_20161015_121331.jpg", "type": "image/jpeg", "size": 1339688 }, "status": "Stored", "key": "appv2/dev/any/e9de065c86c70baa8005dfbcf3cb692e/1PkwPQS0Cz9wb6Mz7HwK_P_20161015_121331.jpg.png", "container": "files.p2-sandbox.practera.com", "cropped": { "originalImageSize": [4096, 2304], "cropArea": { "position": [896, 0], "size": [2304, 2304] } }, "workflows": { "3c38ef53-a9d0-4aa4-9234-617d9f03c0de": { "jobid": "77402285-21ff-4e6d-93c1-531e911f9361" } } }, "comment": "", "__typename": "AssessmentReviewAnswer" }, { "questionId": 92806, "answer": [295743], "comment": "", "__typename": "AssessmentReviewAnswer" }, { "questionId": 92807, "answer": 295745, "comment": "", "__typename": "AssessmentReviewAnswer" }, { "questionId": 92808, "answer": "testing passed!", "comment": "", "__typename": "AssessmentReviewAnswer" }], "__typename": "AssessmentSubmissionReview" }, "__typename": "AssessmentSubmission" }], "__typename": "Assessment" } } },
      { "data": { "assessment": { "name": "Pulse Check - Team Assessment", "type": "moderated", "description": "Description", "dueDate": null, "isTeam": true, "pulseCheck": true, "groups": [{ "name": "Group 1", "description": "Group Description", "questions": [{ "id": 89673, "name": "Q1", "description": "", "type": "oneof", "isRequired": false, "hasComment": false, "audience": ["reviewer", "submitter"], "fileType": null, "choices": [{ "id": 286318, "name": "A", "explanation": "Choice A explanation", "description": "Choice A description", "__typename": "AssessmentChoice" }, { "id": 286319, "name": "B", "explanation": "Choice B explanation", "description": "Choice B description", "__typename": "AssessmentChoice" }], "teamMembers": null, "__typename": "AssessmentQuestion" }], "__typename": "AssessmentGroup" }], "submissions": [{ "id": 36435, "status": "published", "completed": false, "modified": "2021-10-01 06:07:25", "locked": false, "submitter": { "name": "Learner 031", "image": null, "__typename": "User" }, "answers": [{ "questionId": 89673, "answer": "286318", "__typename": "AssessmentSubmissionAnswer" }], "review": { "id": 5729, "status": "done", "modified": "2021-10-01 06:07:24", "reviewer": { "name": "Expert 003", "__typename": "User" }, "answers": [{ "questionId": 89673, "answer": 286318, "comment": "", "__typename": "AssessmentReviewAnswer" }], "__typename": "AssessmentSubmissionReview" }, "__typename": "AssessmentSubmission" }], "__typename": "Assessment" } } }

    ];

    if (typeof id === 'number') {
      return of(sets[id]);
    }
    return of(sets);
  }
}
