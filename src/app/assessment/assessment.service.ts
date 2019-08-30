import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';
import { NotificationService } from '@shared/notification/notification.service';
import { ReviewRatingComponent } from '../review-rating/review-rating.component';
import { DomSanitizer } from '@angular/platform-browser';

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
  dueDate?: string;
  isOverdue?: boolean;
  groups: Array<Group>;
}

export interface Group {
  name: string;
  description: string;
  questions: Array<Question>;
}

export interface Question {
  id: number;
  name: string;
  type: string;
  fileType?: string;
  description: string;
  info?: string;
  isRequired: boolean;
  canComment: boolean;
  canAnswer: boolean;
  choices?: Array<Choice>;
  teamMembers?: Array<TeamMember>;
  audience: string[];
  submitterOnly?: boolean;
  reviewerOnly?: boolean;
}

export interface Choice {
  id: number;
  name: string;
  explanation?: string;
}

export interface TeamMember {
  key: string;
  userName: string;
}

export interface Submission {
  id: number;
  status: string;
  answers: any;
  submitterName: string;
  modified: string;
  isLocked: boolean;
  submitterImage: string;
  reviewerName: string | void;
}

export interface Review {
  id: number;
  answers: any;
  status: string;
  modified: string;
}

@Injectable({
  providedIn: 'root'
})

export class AssessmentService {
  questions = {};

  constructor(
    private request: RequestService,
    private utils: UtilsService,
    private storage: BrowserStorageService,
    private notification: NotificationService,
    public sanitizer: DomSanitizer,
  ) {}

  getAssessment(id, action): Observable<any> {
    return this.request.get(api.get.assessment, {params: {
        assessment_id: id,
        structured: true,
        review: (action === 'review') ? true : false
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
    // In API response, 'data' is an array of assessments
    // (since we passed assessment id, it will return only one assessment, but still in array format).
    // That's why we use data[0]
    if (!Array.isArray(data) ||
        !this.utils.has(data[0], 'Assessment') ||
        !this.utils.has(data[0], 'AssessmentGroup')) {
      return this.request.apiResponseFormatError('Assessment format error');
    }
    const thisAssessment = data[0];

    const assessment: Assessment = {
      name: thisAssessment.Assessment.name,
      description: thisAssessment.Assessment.description,
      isForTeam: thisAssessment.Assessment.is_team,
      dueDate: thisAssessment.Assessment.deadline,
      isOverdue: thisAssessment.Assessment.deadline ? this.utils.timeComparer(thisAssessment.Assessment.deadline) < 0 : false,
      groups: []
    };

    thisAssessment.AssessmentGroup.forEach(group => {
      if (!this.utils.has(group, 'name') ||
          !this.utils.has(group, 'description') ||
          !this.utils.has(group, 'AssessmentGroupQuestion') ||
          !Array.isArray(group.AssessmentGroupQuestion)) {
        return this.request.apiResponseFormatError('Assessment.AssessmentGroup format error');
      }
      const questions: Array<Question> = [];
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
            !this.utils.has(question.AssessmentQuestion, 'can_answer') ||
            !this.utils.has(question.AssessmentQuestion, 'audience')
            ) {
          return this.request.apiResponseFormatError('Assessment.AssessmentQuestion format error');
        }
        // save question to "questions" object, for later use in normaliseSubmission()
        this.questions[question.AssessmentQuestion.id] = question.AssessmentQuestion;
        const audience = question.AssessmentQuestion.audience;
        const questionObject: Question = {
          id: question.AssessmentQuestion.id,
          name: question.AssessmentQuestion.name,
          type: question.AssessmentQuestion.question_type,
          description: question.AssessmentQuestion.description,
          isRequired: question.AssessmentQuestion.is_required,
          canComment: question.AssessmentQuestion.has_comment,
          canAnswer: question.AssessmentQuestion.can_answer,
          audience: audience,
          submitterOnly: audience.length === 1 && audience.includes('submitter'),
          reviewerOnly: audience.length === 1 && audience.includes('reviewer')
        };
        switch (question.AssessmentQuestion.question_type) {
          case 'oneof':
          case 'multiple':
            if (!this.utils.has(question.AssessmentQuestion, 'AssessmentQuestionChoice') ||
                !Array.isArray(question.AssessmentQuestion.AssessmentQuestionChoice)
              ) {
              return this.request.apiResponseFormatError('Assessment.AssessmentQuestionChoice format error');
            }
            const choices: Array<Choice> = [];
            let info = '';
            question.AssessmentQuestion.AssessmentQuestionChoice.forEach(questionChoice => {
              if (
                  !this.utils.has(questionChoice, 'id') ||
                  !this.utils.has(questionChoice, 'AssessmentChoice.name')
                ) {
                return this.request.apiResponseFormatError('Assessment.AssessmentChoice format error');
              }
              // Here we use the AssessmentQuestionChoice.id (instead of AssessmentChoice.id) as the choice id,
              // this is the current logic from Practera server
              choices.push({
                id: questionChoice.id,
                name: questionChoice.AssessmentChoice.name,
                explanation: this.utils.has(questionChoice, 'AssessmentChoice.explanation') ? questionChoice.AssessmentChoice.explanation : ''
              });
              if (this.utils.has(questionChoice, 'AssessmentChoice.description') && questionChoice.AssessmentChoice.description) {
                info += '<p>' + questionChoice.AssessmentChoice.name + ' - ' + questionChoice.AssessmentChoice.description + '</p>';
              }
            });
            if (info) {
              // Add the title
              info = '<h3>Choice Description:</h3>' + info;
            }
            questionObject['info'] = info;
            questionObject['choices'] = choices;
            break;

          case 'file':
            if (!this.utils.has(question.AssessmentQuestion, 'file_type.type')) {
              return this.request.apiResponseFormatError('Assessment.AssessmentQuestion.file_type format error');
            }
            questionObject['fileType'] = question.AssessmentQuestion.file_type.type;
            break;

          case 'team member selector':
            if (!this.utils.has(question.AssessmentQuestion, 'TeamMember') ||
                !Array.isArray(question.AssessmentQuestion.TeamMember)
              ) {
              return this.request.apiResponseFormatError('Assessment.TeamMember format error');
            }
            const teamMembers: Array<TeamMember> = [];
            question.AssessmentQuestion.TeamMember.forEach(teamMember => {
              if (
                  !this.utils.has(teamMember, 'userName')
                ) {
                return this.request.apiResponseFormatError('Assessment.TeamMember format error');
              }
              teamMembers.push({
                key: JSON.stringify(teamMember),
                userName: teamMember.userName
              });
            });
            questionObject['teamMembers'] = teamMembers;
            break;
        }
        questions.push(questionObject);
      });
      if (!this.utils.isEmpty(questions)) {
        assessment.groups.push({
          name: group.name,
          description: group.description,
          questions: questions
        });
      }
    });
    return assessment;
  }

  getSubmission(assessmentId, contextId, action, submissionId?): Observable<any> {
    let params;
    if (action === 'review') {
      params = {
        assessment_id: assessmentId,
        context_id: contextId,
        review: true
      };
    } else {
      params = {
        assessment_id: assessmentId,
        context_id: contextId,
        review: false
      };
    }
    if (submissionId) {
      params['id'] = submissionId;
    }
    return this.request.get(api.get.submissions, {params: params})
      .pipe(map(response => {
        if (response.success && !this.utils.isEmpty(response.data)) {
          return this._normaliseSubmission(response.data, action);
        } else {
          return {
            submission: {},
            review: {}
          };
        }
      })
    );
  }

  private _normaliseSubmission(data, action) {
    // In API response, 'data' is an array of submissions
    // (currently we only support one submission per assessment, but it is still in array format).
    // That's why we use data[0]
    if (!Array.isArray(data) ||
        !this.utils.has(data[0], 'AssessmentSubmission')) {
      return this.request.apiResponseFormatError('AssessmentSubmission format error');
    }
    const thisSubmission = data[0];
    let submission: Submission = {
      id: thisSubmission.AssessmentSubmission.id,
      status: thisSubmission.AssessmentSubmission.status,
      answers: {},
      submitterName: thisSubmission.Submitter.name,
      modified: thisSubmission.AssessmentSubmission.modified,
      isLocked: thisSubmission.AssessmentSubmission.is_locked,
      submitterImage: thisSubmission.Submitter.image,
      reviewerName: this.checkReviewer(thisSubmission.Reviewer)
    };
    // -- normalise submission answers
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
      if (submission.status === 'published' || submission.status === 'done') {
        submission = this._addChoiceExplanation(answer, submission);
      }
    });

    // -- normalise reviewer answers
    let review: Review;
    // AssessmentReview is in array format, current we only support one review per submission, that's why we use AssessmentReview[0]
    if (this.utils.has(thisSubmission, 'AssessmentReview[0].id')) {
      review = {
        id: thisSubmission.AssessmentReview[0].id,
        answers: {},
        status: thisSubmission.AssessmentReview[0].status,
        modified: thisSubmission.AssessmentReview[0].modified
      };
    }
    // only get the review answer if the review is published (submission.status === 'published') or this is from /assessment/review
    if ( (submission.status === 'published' || action === 'review') &&
        this.utils.has(thisSubmission, 'AssessmentReviewAnswer') &&
        Array.isArray(thisSubmission.AssessmentReviewAnswer)) {
      if (!review) {
        review = {
          // we use the review id in this way only if AssessmentReviewAnswer is not returned,
          // we should change API so that it returns AssessmentReviewAnswer object later
          id: thisSubmission.AssessmentReviewAnswer[0].assessment_review_id,
          answers: {},
          status: '',
          modified: ''
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

  /**
   * For each question that has choice (oneof & multiple), show the choice explanation in the submission if it is not empty
   */
  private _addChoiceExplanation(submissionAnswer, submission): Submission {
    const questionId = submissionAnswer.assessment_question_id;
    const answer = submissionAnswer.answer;
    // don't do anything if there's no choices
    if (this.utils.isEmpty(this.questions[questionId].AssessmentQuestionChoice)) {
      return submission;
    }
    let explanation = '';
    if (Array.isArray(answer)) {
      // multiple question
      this.questions[questionId].AssessmentQuestionChoice.forEach(choice => {
        // only display the explanation if it is not empty
        if (answer.includes(choice.id) && !this.utils.isEmpty(choice.explanation)) {
          explanation += choice.AssessmentChoice.name + ' - ' + choice.explanation + '\n';
        }
      });
    } else {
      // oneof question
      this.questions[questionId].AssessmentQuestionChoice.forEach(choice => {
        // only display the explanation if it is not empty
        if (answer === choice.id && !this.utils.isEmpty(choice.explanation)) {
          explanation = choice.explanation;
        }
      });
    }
    // put the explanation in the submission
    const thisExplanation = explanation.replace(/text-align: center;/gi, 'text-align: center; text-align: -webkit-center;');
    submission.answers[questionId].explanation = this.sanitizer.bypassSecurityTrustHtml(thisExplanation);

    return submission;
  }

  private _normaliseAnswer(questionId, answer) {
    if (this.questions[questionId]) {
      switch (this.questions[questionId].question_type) {
        case 'oneof':
          // re-format answer from string to number
          if (typeof answer === 'string' && answer.length === 0) {
            // Caution: let answer be null if question wasn't answered previously, 0 could be a possible answer ID
            answer = null;
          } else {
            answer = +answer;
          }
          break;
        case 'multiple':
          if (this.utils.isEmpty(answer)) {
            answer = [];
          }
          if (!Array.isArray(answer)) {
            // re-format json string to array
            answer = JSON.parse(answer);
          }
          // re-format answer from string to number
          answer = answer.map(value => {
            return +value;
          });
          break;
      }
    }
    return answer;
  }

  saveAnswers(assessment, answers, action, submissionId?) {
    let postData;
    switch (action) {
      case 'assessment':
        postData = {
          Assessment: assessment,
          AssessmentSubmissionAnswer: answers
        };
        if (submissionId) {
          postData.AssessmentSubmission = {
            id: submissionId
          };
        }
        return this.request.post(api.post.submissions, postData);

      case 'review':
        postData = {
          Assessment: assessment,
          AssessmentReviewAnswer: answers
        };
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
    // In API response, 'data' is an array of todo items.
    // Since we passed "identifier", there should be just one in the array. That's why we use data[0]
    if (!Array.isArray(data) ||
        !this.utils.has(data[0], 'is_done')) {
      return this.request.apiResponseFormatError('TodoItem format error');
    }
    return data[0].is_done;
  }

  saveFeedbackReviewed(submissionId) {
    const postData = {
      project_id: this.storage.getUser().projectId,
      identifier: 'AssessmentSubmission-' + submissionId,
      is_done: true
    };
    return this.request.post(api.post.todoitem, postData);
  }

  popUpReviewRating(reviewId, redirect): Promise<void> {
    return this.notification.modal(ReviewRatingComponent, {
      reviewId,
      redirect
    });
  }

  checkReviewer(reviewer): string | void {
    if (!reviewer) {
      return undefined;
    }
    return reviewer.name !== this.storage.getUser().name ? reviewer.name : undefined;
  }

}


