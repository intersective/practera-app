import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';

/**
 * @name api
 * @description list of api endpoint involved in this service
 * @type {Object}
 */
const api = {
  get: {
    assessment: 'api/assessments.json',
    submissions: 'api/submissions.json',
    todoitem: 'api/v2/motivations/todo_item/list.json'
  },
  post: {
    submissions: 'api/assessment_submissions.json',
    reviews: 'api/feedback_submissions.json',
    todoitem: 'api/v2/motivations/todo_item/edit.json'
  }
};

export interface Assessment {
  name: string,
  description: string,
  groups: Array<Group>
}

export interface Group {
  name: string,
  questions: Array<Question>
}

export interface Question {
  id: number,
  name: string,
  type: string,
  fileType?: string,
  description: string,
  isRequired: boolean,
  canComment: boolean,
  canAnswer: boolean,
  choices?: Array<Choice>
}

export interface Choice {
  id: number,
  name: string
}

export interface Submission {
  id: number,
  status: string,
  answers: any
}

export interface Review {
  id: number,
  answers: any
}

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

  constructor(
    private request: RequestService,
    private utils: UtilsService
  ) {}

  getAssessment(id): Observable<any> {
    return this.request.get(api.get.assessment, {params: {
        assessment_id: id,
        structured: true
      }})
      .pipe(map(response => {
        if (response.success && response.data) {
          return this._normaliseAssessment(response.data);
        }
      })
    );
  }

  private _normaliseAssessment(data) {
    // In API response, 'data' is an array of assessments(since we passed assessment id, it will return only one assessment, but still in array format). That's why we use data[0]
    if (!Array.isArray(data) || 
        !this.utils.has(data[0], 'Assessment') || 
        !this.utils.has(data[0], 'AssessmentGroup')) {
      return this.request.apiResponseFormatError('Assessment format error');
    }

    let assessment: Assessment = {
      name: '',
      description: '',
      groups: []
    };

    assessment.name = data[0].Assessment.name;
    assessment.description = data[0].Assessment.description;

    data[0].AssessmentGroup.forEach(group => {
      if (!this.utils.has(group, 'name') || 
          !this.utils.has(group, 'description') || 
          !this.utils.has(group, 'AssessmentGroupQuestion') || 
          !Array.isArray(group.AssessmentGroupQuestion)) {
        return this.request.apiResponseFormatError('Assessment.AssessmentGroup format error');
      }
      let questions: Array<Question> = [];
      group.AssessmentGroupQuestion.forEach(question => {
        if (!this.utils.has(question, 'AssessmentQuestion')) {
          return this.request.apiResponseFormatError('Assessment.AssessmentGroupQuestion format error');
        }
        if (!this.utils.has(question.AssessmentQuestion, 'id') || 
            !this.utils.has(question.AssessmentQuestion, 'name') || 
            !this.utils.has(question.AssessmentQuestion, 'description') || 
            !this.utils.has(question.AssessmentQuestion, 'question_type') ||
            !this.utils.has(question.AssessmentQuestion, 'is_required') ||
            !this.utils.has(question.AssessmentQuestion, 'has_comment') ||
            !this.utils.has(question.AssessmentQuestion, 'can_answer')
            ) {
          return this.request.apiResponseFormatError('Assessment.AssessmentQuestion format error');
        }

        switch (question.AssessmentQuestion.question_type) {
          case 'oneof':
          case 'multiple':
            if (!this.utils.has(question.AssessmentQuestion, 'AssessmentQuestionChoice') || 
                !this.utils.has(question.AssessmentQuestion.AssessmentQuestionChoice, 'id') || 
                !this.utils.has(question.AssessmentQuestion.AssessmentQuestionChoice, 'AssessmentChoice') || 
                !this.utils.has(question.AssessmentQuestion.AssessmentQuestionChoice.AssessmentChoice, 'name')
              ) {
              return this.request.apiResponseFormatError('Assessment.AssessmentQuestionChoice format error');
            }

            let choices: Array<Choice> = [];
            question.AssessmentQuestion.AssessmentQuestionChoice.forEach(questionChoice => {
              // Here we use the AssessmentQuestionChoice.id (instead of AssessmentChoice.id) as the choice id, this is the current logic from Practera server
              choices.push({
                id: questionChoice.id,
                name: questionChoice.AssessmentChoice.name
              });
            });
            questions.push({
              id: question.AssessmentQuestion.id,
              name: question.AssessmentQuestion.name,
              type: question.AssessmentQuestion.question_type,
              description: question.AssessmentQuestion.description,
              isRequired: question.AssessmentQuestion.is_required,
              canComment: question.AssessmentQuestion.has_comment,
              canAnswer: question.AssessmentQuestion.can_answer,
              choices: choices
            });
            break;
          
          case 'file': 
             if (!this.utils.has(question.AssessmentQuestion, 'file_type.type')) {
              return this.request.apiResponseFormatError('Assessment.AssessmentQuestion.file_type format error');
            }
            questions.push({
              id: question.AssessmentQuestion.id,
              name: question.AssessmentQuestion.name,
              type: question.AssessmentQuestion.question_type,
              fileType: question.AssessmentQuestion.file_type.type,
              description: question.AssessmentQuestion.description,
              isRequired: question.AssessmentQuestion.is_required,
              canComment: question.AssessmentQuestion.has_comment,
              canAnswer: question.AssessmentQuestion.can_answer
            });
            break;

          default:
            questions.push({
              id: question.AssessmentQuestion.id,
              name: question.AssessmentQuestion.name,
              type: question.AssessmentQuestion.question_type,
              description: question.AssessmentQuestion.description,
              isRequired: question.AssessmentQuestion.is_required,
              canComment: question.AssessmentQuestion.has_comment,
              canAnswer: question.AssessmentQuestion.can_answer
            });
            break;
        }

      })
      assessment.groups.push({
        name: group.name,
        questions: questions
      });
    });
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


