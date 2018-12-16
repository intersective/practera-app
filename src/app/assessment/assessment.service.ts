import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';

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
  name: string;
  description: string;
  isForTeam: boolean;
  groups: Array<Group>;
}

export interface Group {
  name: string;
  questions: Array<Question>;
}

export interface Question {
  id: number;
  name: string;
  type: string;
  fileType?: string;
  description: string;
  isRequired: boolean;
  canComment: boolean;
  canAnswer: boolean;
  choices?: Array<Choice>;
}

export interface Choice {
  id: number;
  name: string;
}

export interface Submission {
  id: number;
  status: string;
  answers: any;
}

export interface Review {
  id: number;
  answers: any;
}

@Injectable({
  providedIn: 'root'
})

export class AssessmentService {
  questions = {};

  constructor(
    private request: RequestService,
    private utils: UtilsService,
    private storage: BrowserStorageService
  ) {}

  getAssessment(id, action): Observable<any> {
    return this.request.get(api.get.assessment, {params: {
        assessment_id: id,
        structured: true,
        review: (action == 'review') ? true : false
      }})
      .pipe(map(response => {
        if (response.success && response.data) {
          return this._normaliseAssessment(response.data);
        } else {
          return {};
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
    const thisAssessment = data[0];

    let assessment: Assessment = {
      name: thisAssessment.Assessment.name,
      description: thisAssessment.Assessment.description,
      isForTeam: thisAssessment.Assessment.is_team,
      groups: []
    };

    thisAssessment.AssessmentGroup.forEach(group => {
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
        // save question to "questions" object, for later use in normaliseSubmission()
        this.questions[question.AssessmentQuestion.id] = question.AssessmentQuestion;

        switch (question.AssessmentQuestion.question_type) {
          case 'oneof':
          case 'multiple':
            if (!this.utils.has(question.AssessmentQuestion, 'AssessmentQuestionChoice') ||
                !Array.isArray(question.AssessmentQuestion.AssessmentQuestionChoice)
              ) {
              return this.request.apiResponseFormatError('Assessment.AssessmentQuestionChoice format error');
            }

            let choices: Array<Choice> = [];
            question.AssessmentQuestion.AssessmentQuestionChoice.forEach(questionChoice => {
              if (
                  !this.utils.has(questionChoice, 'id') || 
                  !this.utils.has(questionChoice, 'AssessmentChoice.name')
                ) {
                return this.request.apiResponseFormatError('Assessment.AssessmentChoice format error');
              }
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
    return assessment;
  }

  getSubmission(assessmentId, contextId, action): Observable<any> {
    let params;
    if (action == 'review') {
      params = {
        assessment_id: assessmentId,
        context_id: contextId,
        review: true
      };
    } else {
      params = {
        assessment_id: assessmentId,
        context_id: contextId
      };
    }
    return this.request.get(api.get.submissions, {params: params})
      .pipe(map(response => {
        if (response.success && !this.utils.isEmpty(response.data)) {
          return this._normaliseSubmission(response.data);
        } else {
          return {
            submission: {},
            review: {}
          };
        }
      })
    );
  }

  private _normaliseSubmission(data) {
    // In API response, 'data' is an array of submissions(currently we only support one submission per assessment, but it is still in array format). That's why we use data[0]
    if (!Array.isArray(data) || 
        !this.utils.has(data[0], 'AssessmentSubmission')) {
      return this.request.apiResponseFormatError('AssessmentSubmission format error');
    }
    const thisSubmission = data[0];

    let submission: Submission = {
      id: thisSubmission.AssessmentSubmission.id,
      status: thisSubmission.AssessmentSubmission.status,
      answers: {}
    }
    if (!this.utils.has(thisSubmission, 'AssessmentSubmissionAnswer') ||
        !Array.isArray(thisSubmission.AssessmentSubmissionAnswer)
        ) {
      return this.request.apiResponseFormatError('AssessmentSubmissionAnswer format error');
    }
    thisSubmission.AssessmentSubmissionAnswer.forEach(answer => {
      if (!this.utils.has(answer, 'assessment_question_id') ||
          !this.utils.has(answer, 'answer')
          ) {
        return this.request.apiResponseFormatError('AssessmentSubmissionAnswer.answer format error');
      }
      answer.answer = this._normaliseAnswer(answer.assessment_question_id, answer.answer);
      submission.answers[answer.assessment_question_id] = {
        answer: answer.answer
      };
    });

    let review: Review;
    // AssessmentReview is in array format, current we only support one review per submission, that's why we use AssessmentReview[0]
    if (this.utils.has(thisSubmission, 'AssessmentReview[0].id')) {
      review = {
        id: thisSubmission.AssessmentReview[0].id,
        answers: {}
      };
    }
    // only get the review answer if the review is published (submission.status == 'published')
    if (submission.status == 'published' &&
        this.utils.has(thisSubmission, 'AssessmentReviewAnswer') &&
        Array.isArray(thisSubmission.AssessmentReviewAnswer)) {
      if (!review) {
        review = {
          id: 0,
          answers: {}
        };
      }
      thisSubmission.AssessmentReviewAnswer.forEach(answer => {
        if (!this.utils.has(answer, 'assessment_question_id') ||
            !this.utils.has(answer, 'answer') ||
            !this.utils.has(answer, 'comment')
            ) {
          return this.request.apiResponseFormatError('AssessmentReviewAnswer format error');
        }
        answer.answer = this._normaliseAnswer(answer.assessment_question_id, answer.answer);
        review.answers[answer.assessment_question_id] = {
          answer: answer.answer,
          comment: answer.comment
        };
      });
    }
    return {
      submission: submission,
      review: review ? review : {}
    };
  }

  private _normaliseAnswer(questionId, answer) {
    if (this.questions[questionId]) {
      switch (this.questions[questionId].question_type) {
        case "oneof":
          // re-format answer from string to number
          answer = parseInt(answer);
          break;
        case "multiple":
          break;
        
      }
    }
    return answer;
  }

  saveAnswers(assessment, answers, action) {
    let postData;
    switch (action) {
      case 'assessment':
        postData = {
          Assessment: assessment,
          AssessmentSubmissionAnswer: answers
        }
        return this.request.post(api.post.submissions, postData);

      case 'review':
        postData = {
          Assessment: assessment,
          AssessmentReviewAnswer: answers
        }
        return this.request.post(api.post.reviews, postData);
    }
    return of({
      success: false
    });
  }

  getFeedbackReviewed(submissionId) {
    return this.request.get(api.get.todoitem, {params: {
      project_id: this.storage.getUser().projectId,
      identifier: 'AssessmentSubmission-' + submissionId
    }})
      .pipe(map(response => {
        if (response.success && !this.utils.isEmpty(response.data)) {
          return this._normaliseFeedbackReviewed(response.data);
        } else {
          return false;
        }
      })
    );
  }

  private _normaliseFeedbackReviewed(data) {
    // In API response, 'data' is an array of todo items. Since we passed "identifier", there should be just one in the array. That's why we use data[0]
    if (!Array.isArray(data) || 
        !this.utils.has(data[0], 'is_done')) {
      return this.request.apiResponseFormatError('TodoItem format error');
    }
    return data[0].is_done;
  }

  saveFeedbackReviewed(submissionId) {
    let postData = {
      project_id: this.storage.getUser().projectId,
      identifier: 'AssessmentSubmission-' + submissionId,
      is_done: true
    };
    return this.request.post(api.post.todoitem, postData);
  }


}


