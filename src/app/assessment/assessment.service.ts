import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
 @Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  assessment = {
    name: 'Assessment1',
    description: 'This is the description of assessment 1',
    groups: [
      {
        name: 'Group 1',
        questions: [
          {
            id: 1,
            name: 'question1',
            type: 'text',
            description: 'this is a text question description',
            isRequired: true,
            canComment: true,
            canAnswer: true
          },
          {
            id: 3,
            name: 'question3',
            type: 'oneof',
            description: 'this is a oneof question description',
            isRequired: true,
            canComment: true,
            canAnswer: true,
            choices: [
              {
                id: 1,
                name: 'Choose me, I am choice 1'
              },
              {
                id: 2,
                name: 'Choose me, I am choice 2'
              },
              {
                id: 3,
                name: 'Choose me, I am choice 3'
              }
            ]
          }
        ]
      },
      {
        name: 'Group 2',
        questions: [
          {
            id: 2,
            name: 'question2',
            type: 'text',
            description: 'this is a text question description',
            isRequired: false,
            canComment: true,
            canAnswer: false
          },
          {
            id: 4,
            name: 'question4',
            type: 'multiple',
            description: 'this is a multiple question description',
            isRequired: true,
            canComment: true,
            canAnswer: true,
            choices: [
              {
                id: 1,
                name: 'Choose me, I am choice 1'
              },
              {
                id: 2,
                name: 'Choose me, I am choice 2'
              },
              {
                id: 3,
                name: 'Choose me, I am choice 3'
              }
            ]
          }
        ]
      },
      {
        name: 'Group 3',
        questions: [
          {
            id: 5,
            name: 'question5',
            type: 'file',
            fileType: 'any',
            description: 'this is a file(any) question description',
            isRequired: false,
            canComment: true,
            canAnswer: true
          },
          {
            id: 6,
            name: 'question6',
            type: 'file',
            fileType: 'image',
            description: 'this is a file(image) question description',
            isRequired: false,
            canComment: true,
            canAnswer: true
          },
          {
            id: 7,
            name: 'question7',
            type: 'file',
            fileType: 'video',
            description: 'this is a file(video) question description',
            isRequired: false,
            canComment: true,
            canAnswer: true
          }
        ]
      }
    ]
  };

  // assessment_id: {
  //  question_id: {}
  // }
  submissions = {
    2: {
      status: 'done',
      1: {
        answer: 'answer for question 1'
      },
      3: {
        answer: 2
      },
      4: {
        answer: [1,2]
      },
      5: {
        answer: {
          container: "practera-aus",
          filename: "sample.jpg",
          handle: "EjdSc3EJSLmJnu4WVJnh",
          key: "case/uploads/public/4S5U3B8TKWcRpifXA6ym_sample.jpg",
          mimetype: "image/jpeg",
          originalFile: {name: "sample.jpg", type: "image/jpeg", size: 51085},
          originalPath: "sample.jpg",
          size: 51085,
          source: "local_file_system",
          status: "Stored",
          uploadId: "ca9dc1b2f1ae59d14f242b691f4bc6a7",
          url: "https://cdn.filestackcontent.com/EjdSc3EJSLmJnu4WVJnh"
        }
      },
      6: {
        answer: {
          container: "practera-aus",
          filename: "sample.jpg",
          handle: "EjdSc3EJSLmJnu4WVJnh",
          key: "case/uploads/public/4S5U3B8TKWcRpifXA6ym_sample.jpg",
          mimetype: "image/jpeg",
          originalFile: {name: "sample.jpg", type: "image/jpeg", size: 51085},
          originalPath: "sample.jpg",
          size: 51085,
          source: "local_file_system",
          status: "Stored",
          uploadId: "ca9dc1b2f1ae59d14f242b691f4bc6a7",
          url: "https://cdn.filestackcontent.com/EjdSc3EJSLmJnu4WVJnh"
        }
      },
      7: {
        answer: {
          container: "practera-aus",
          filename: "sample2.mp4",
          handle: "1OJvu3EQTZmjDgrHPDzj",
          key: "case/uploads/public/WsLzxK4R3CX1QYGekIau_sample2.mp4",
          mimetype: "video/mp4",
          originalFile: {name: "sample2.mp4", type: "video/mp4", size: 788493},
          originalPath: "sample2.mp4",
          size: 788493,
          source: "local_file_system",
          status: "Stored",
          uploadId: "75d47c172b9b7f73073fbadd691f3b4f1",
          url: "https://cdn.filestackcontent.com/1OJvu3EQTZmjDgrHPDzj"
        }
      }
    },
    3: {
      status: 'pending review',
      1: {
        answer: 'answer for question 1'
      },
      3: {
        answer: 2
      },
      4: {
        answer: [1,2]
      },
      5: {
        answer: {
          container: "practera-aus",
          filename: "sample2.mp4",
          handle: "1OJvu3EQTZmjDgrHPDzj",
          key: "case/uploads/public/WsLzxK4R3CX1QYGekIau_sample2.mp4",
          mimetype: "video/mp4",
          originalFile: {name: "sample2.mp4", type: "video/mp4", size: 788493},
          originalPath: "sample2.mp4",
          size: 788493,
          source: "local_file_system",
          status: "Stored",
          uploadId: "75d47c172b9b7f73073fbadd691f3b4f1",
          url: "https://cdn.filestackcontent.com/1OJvu3EQTZmjDgrHPDzj"
        }
      },
      6: {
        answer: {
          container: "practera-aus",
          filename: "sample.jpg",
          handle: "EjdSc3EJSLmJnu4WVJnh",
          key: "case/uploads/public/4S5U3B8TKWcRpifXA6ym_sample.jpg",
          mimetype: "image/jpeg",
          originalFile: {name: "sample.jpg", type: "image/jpeg", size: 51085},
          originalPath: "sample.jpg",
          size: 51085,
          source: "local_file_system",
          status: "Stored",
          uploadId: "ca9dc1b2f1ae59d14f242b691f4bc6a7",
          url: "https://cdn.filestackcontent.com/EjdSc3EJSLmJnu4WVJnh"
        }
      },
      7: {
        answer: {
          container: "practera-aus",
          filename: "sample2.mp4",
          handle: "1OJvu3EQTZmjDgrHPDzj",
          key: "case/uploads/public/WsLzxK4R3CX1QYGekIau_sample2.mp4",
          mimetype: "video/mp4",
          originalFile: {name: "sample2.mp4", type: "video/mp4", size: 788493},
          originalPath: "sample2.mp4",
          size: 788493,
          source: "local_file_system",
          status: "Stored",
          uploadId: "75d47c172b9b7f73073fbadd691f3b4f1",
          url: "https://cdn.filestackcontent.com/1OJvu3EQTZmjDgrHPDzj"
        }
      }
    },
    4: {
      status: 'published',
      1: {
        answer: 'answer for question 1'
      },
      3: {
        answer: 2
      },
      4: {
        answer: [1,2]
      },
      5: {
        answer: {
          container: "practera-aus",
          filename: "sample2.mp4",
          handle: "1OJvu3EQTZmjDgrHPDzj",
          key: "case/uploads/public/WsLzxK4R3CX1QYGekIau_sample2.mp4",
          mimetype: "video/mp4",
          originalFile: {name: "sample2.mp4", type: "video/mp4", size: 788493},
          originalPath: "sample2.mp4",
          size: 788493,
          source: "local_file_system",
          status: "Stored",
          uploadId: "75d47c172b9b7f73073fbadd691f3b4f1",
          url: "https://cdn.filestackcontent.com/1OJvu3EQTZmjDgrHPDzj"
        }
      },
      6: {
        answer: {
          container: "practera-aus",
          filename: "sample.jpg",
          handle: "EjdSc3EJSLmJnu4WVJnh",
          key: "case/uploads/public/4S5U3B8TKWcRpifXA6ym_sample.jpg",
          mimetype: "image/jpeg",
          originalFile: {name: "sample.jpg", type: "image/jpeg", size: 51085},
          originalPath: "sample.jpg",
          size: 51085,
          source: "local_file_system",
          status: "Stored",
          uploadId: "ca9dc1b2f1ae59d14f242b691f4bc6a7",
          url: "https://cdn.filestackcontent.com/EjdSc3EJSLmJnu4WVJnh"
        }
      },
      7: {
        answer: {
          container: "practera-aus",
          filename: "sample2.mp4",
          handle: "1OJvu3EQTZmjDgrHPDzj",
          key: "case/uploads/public/WsLzxK4R3CX1QYGekIau_sample2.mp4",
          mimetype: "video/mp4",
          originalFile: {name: "sample2.mp4", type: "video/mp4", size: 788493},
          originalPath: "sample2.mp4",
          size: 788493,
          source: "local_file_system",
          status: "Stored",
          uploadId: "75d47c172b9b7f73073fbadd691f3b4f1",
          url: "https://cdn.filestackcontent.com/1OJvu3EQTZmjDgrHPDzj"
        }
      }
    },
    5: {
      status: 'published',
      1: {
        answer: 'answer for question 1'
      },
      3: {
        answer: 2
      },
      4: {
        answer: [1,2]
      },
      5: {
        answer: {
          container: "practera-aus",
          filename: "sample2.mp4",
          handle: "1OJvu3EQTZmjDgrHPDzj",
          key: "case/uploads/public/WsLzxK4R3CX1QYGekIau_sample2.mp4",
          mimetype: "video/mp4",
          originalFile: {name: "sample2.mp4", type: "video/mp4", size: 788493},
          originalPath: "sample2.mp4",
          size: 788493,
          source: "local_file_system",
          status: "Stored",
          uploadId: "75d47c172b9b7f73073fbadd691f3b4f1",
          url: "https://cdn.filestackcontent.com/1OJvu3EQTZmjDgrHPDzj"
        }
      },
      6: {
        answer: {
          container: "practera-aus",
          filename: "sample.jpg",
          handle: "EjdSc3EJSLmJnu4WVJnh",
          key: "case/uploads/public/4S5U3B8TKWcRpifXA6ym_sample.jpg",
          mimetype: "image/jpeg",
          originalFile: {name: "sample.jpg", type: "image/jpeg", size: 51085},
          originalPath: "sample.jpg",
          size: 51085,
          source: "local_file_system",
          status: "Stored",
          uploadId: "ca9dc1b2f1ae59d14f242b691f4bc6a7",
          url: "https://cdn.filestackcontent.com/EjdSc3EJSLmJnu4WVJnh"
        }
      },
      7: {
        answer: {
          container: "practera-aus",
          filename: "sample2.mp4",
          handle: "1OJvu3EQTZmjDgrHPDzj",
          key: "case/uploads/public/WsLzxK4R3CX1QYGekIau_sample2.mp4",
          mimetype: "video/mp4",
          originalFile: {name: "sample2.mp4", type: "video/mp4", size: 788493},
          originalPath: "sample2.mp4",
          size: 788493,
          source: "local_file_system",
          status: "Stored",
          uploadId: "75d47c172b9b7f73073fbadd691f3b4f1",
          url: "https://cdn.filestackcontent.com/1OJvu3EQTZmjDgrHPDzj"
        }
      }
    }
  };

  // assessment_id: {
  //  id:
  //  answers: {
  //    question_id: {}
  //  }
  // }
  reviews = {
    3: {
      id: 1
    },
    4: {
      id: 1,
      answers: {
        1: {
          answer: 'reviewer answer for question 1',
          comment: 'reviewer comment for question 1'
        },
        3: {
          answer: 1,
          comment: 'reviewer comment. You are wrong'
        },
        2: {
          comment: 'it will be better if you answer this question'
        },
        4: {
          answer: [2,3],
          comment: 'reviewer comment. Not 100% correct'
        }
      }
    },
    5: {
      id: 2,
      answers: {
        1: {
          answer: 'reviewer answer for question 1',
          comment: 'reviewer comment for question 1'
        },
        3: {
          answer: 1,
          comment: 'reviewer comment. You are wrong'
        },
        2: {
          comment: 'it will be better if you answer this question'
        },
        4: {
          answer: [2,3],
          comment: 'reviewer comment. Not 100% correct'
        }
      }
    }
  };

  // review id: 
  feedbackReviewed = {
    1: false,
    2: true
  }

  constructor() {}

  getAssessment(id): Observable<any> {
    return of(this.assessment);
  }

  getSubmission(assessmentId, contextId, action): Observable<any> {
    return of({
      submission: this.submissions[assessmentId] ? {
        id: 1,
        status: this.submissions[assessmentId].status,
        answers: this.submissions[assessmentId] 
      } : {},
      review: this.reviews[assessmentId] ? {
        id: this.reviews[assessmentId].id,
        answers: this.reviews[assessmentId].answers
      } : {}
    });
  }

  saveAnswers(assessment, answers, action) {
    let postData;
    switch (action) {
      case 'assessment':
        postData = {
          Assessment: assessment,
          AssessmentSubmissionAnswer: answers
        }
        console.log("Submit submission with data:\n", postData);
        break;

      case 'review':
        postData = {
          Assessment: assessment,
          AssessmentReviewAnswer: answers
        }
        console.log("Submit feedback with data:\n", postData);
        break;
    }
    return of({
      success: true,
      status: "success"
    });
  }

  getFeedbackReviewed(reviewId) {
    return of(this.feedbackReviewed[reviewId] ? this.feedbackReviewed[reviewId] : false);
  }

  saveFeedbackReviewed(reviewId) {
    console.log('feedback reviewed');
  }


}


