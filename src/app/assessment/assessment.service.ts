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
  post: {
    submissions: 'api/assessment_submissions.json',
    reviews: 'api/feedback_submissions.json',
    todoitem: 'api/v2/motivations/todo_item/edit.json'
  }
};

export interface AssessmentSubmitBody {
  id: number;
  in_progress: boolean;
  context_id?: number;
  review_id?: number;
  submission_id?: number;
  unlock?: boolean;
}

export interface Assessment {
  name: string;
  type: string;
  description: string;
  isForTeam: boolean;
  dueDate?: string;
  isOverdue?: boolean;
  groups: Array<Group>;
  pulseCheck: boolean;
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
  completed?: boolean;
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

  getAssessment(id, action, activityId, contextId, submissionId?) {
    return this.request.postGraphQL(
      this.utils.graphQLQueryStringFormatter(
        `"{
          assessment(id:` + id + `,reviewer:` + (action === 'review') + `,activityId:` + activityId + `) {
            name type description dueDate isTeam pulseCheck
            groups{
              name description
              questions{
                id name description type isRequired hasComment audience fileType
                choices{
                  id name explanation description
                }
                teamMembers{
                  userId userName teamId
                }
              }
            }
            submissions(` + (submissionId ? `id:` + submissionId : `contextId:` + contextId) + `) {
              id status completed modified locked
              submitter {
                name image
              }
              answers{
                questionId answer
              }
              review {
                id status modified
                reviewer { name }
                answers {
                  questionId answer comment
                }
              }
            }
          }
        }"`)
      )
      .pipe(map(res => {
        return {
          assessment: this._normaliseAssessment(res.data, action),
          submission: this._normaliseSubmission(res.data),
          review: this._normaliseReview(res.data, action)
        };
      }));
  }

  private _normaliseAssessment(data, action): Assessment {
    if (!data.assessment) {
      return null;
    }
    const assessment = {
      name: data.assessment.name,
      type: data.assessment.type,
      description: data.assessment.description,
      isForTeam: data.assessment.isTeam,
      dueDate: data.assessment.dueDate,
      isOverdue: data.assessment.dueDate ? this.utils.timeComparer(data.assessment.dueDate) < 0 : false,
      pulseCheck: data.assessment.pulseCheck,
      groups: []
    };
    data.assessment.groups.forEach(eachGroup => {
      const questions: Question[] = [];
      if (!eachGroup.questions) {
        return;
      }
      eachGroup.questions.forEach(eachQuestion => {
        this.questions[eachQuestion.id] = eachQuestion;
        const question: Question = {
          id: eachQuestion.id,
          name: eachQuestion.name,
          type: eachQuestion.type,
          description: eachQuestion.description,
          isRequired: eachQuestion.isRequired,
          canComment: eachQuestion.hasComment,
          canAnswer: action === 'review' ? eachQuestion.audience.includes('reviewer') : eachQuestion.audience.includes('submitter'),
          audience: eachQuestion.audience,
          submitterOnly: eachQuestion.audience.length === 1 && eachQuestion.audience.includes('submitter'),
          reviewerOnly: eachQuestion.audience.length === 1 && eachQuestion.audience.includes('reviewer')
        };
        switch (eachQuestion.type) {
          case 'oneof':
          case 'multiple':
            const choices: Choice[] = [];
            let info = '';
            eachQuestion.choices.forEach(eachChoice => {
              choices.push({
                id: eachChoice.id,
                name: eachChoice.name,
                explanation: eachChoice.explanation || null,
              });
              if (eachChoice.description) {
                info += '<p>' + eachChoice.name + ' - ' + eachChoice.description + '</p>';
              }
            });
            if (info) {
              // add the title
              info = '<h3>Choice Description:</h3>' + info;
            }
            question.info = info;
            question.choices = choices;
            break;

          case 'file':
            question.fileType = eachQuestion.fileType;
            break;

          case 'team member selector':
            question.teamMembers = [];
            eachQuestion.teamMembers.forEach(eachTeamMember => {
              question.teamMembers.push({
                key: JSON.stringify(eachTeamMember),
                userName: eachTeamMember.userName
              });
            });
            break;
        }
        questions.push(question);
      });
      if (!this.utils.isEmpty(questions)) {
        assessment.groups.push({
          name: eachGroup.name,
          description: eachGroup.description,
          questions: questions
        });
      }
    });
    return assessment;
  }

  private _normaliseSubmission(data): Submission {
    if (!this.utils.has(data, 'assessment.submissions') || data.assessment.submissions.length < 1) {
      return null;
    }
    const firstSubmission = data.assessment.submissions[0];
    let submission: Submission = {
      id: firstSubmission.id,
      status: firstSubmission.status,
      submitterName: firstSubmission.submitter.name,
      submitterImage: firstSubmission.submitter.image,
      modified: firstSubmission.modified,
      isLocked: firstSubmission.locked,
      completed: firstSubmission.completed,
      reviewerName: firstSubmission.review ? this.checkReviewer(firstSubmission.review.reviewer) : null,
      answers: {}
    };
    firstSubmission.answers.forEach(eachAnswer => {
      eachAnswer.answer = this._normaliseAnswer(eachAnswer.questionId, eachAnswer.answer);
      submission.answers[eachAnswer.questionId] = {
        answer: eachAnswer.answer
      };
      if (['published', 'done'].includes(submission.status)) {
        submission = this._addChoiceExplanation(eachAnswer, submission);
      }
    });
    return submission;
  }

  private _normaliseReview(data, action): Review {
    if (!this.utils.has(data, 'assessment.submissions') || data.assessment.submissions.length < 1) {
      return null;
    }
    const firstSubmission = data.assessment.submissions[0];
    const firstSubmissionReview = firstSubmission.review;
    if (!firstSubmissionReview) {
      return null;
    }
    const review: Review = {
      id: firstSubmissionReview.id,
      status: firstSubmissionReview.status,
      modified: firstSubmissionReview.modified,
      answers: {}
    };

    // only get the review answer if the review is published, or it is for the reviewer to see the review
    // i.e. don't display the review answer if it is for submitter and review not published yet
    if (firstSubmission.status !== 'published' && action === 'assessment') {
      return review;
    }

    firstSubmissionReview.answers.forEach(eachAnswer => {
      eachAnswer.answer = this._normaliseAnswer(eachAnswer.questionId, eachAnswer.answer);
      review.answers[eachAnswer.questionId] = {
        answer: eachAnswer.answer,
        comment: eachAnswer.comment
      };
    });
    return review;
  }

  /**
   * For each question that has choice (oneof & multiple), show the choice explanation in the submission if it is not empty
   */
  private _addChoiceExplanation(submissionAnswer, submission: Submission): Submission {
    const questionId = submissionAnswer.questionId;
    const answer = submissionAnswer.answer;
    // don't do anything if there's no choices
    if (this.utils.isEmpty(this.questions[questionId].choices)) {
      return submission;
    }
    let explanation = '';
    if (Array.isArray(answer)) {
      // multiple question
      this.questions[questionId].choices.forEach(choice => {
        // only display the explanation if it is not empty
        if (answer.includes(choice.id) && !this.utils.isEmpty(choice.explanation)) {
          explanation += choice.name + ' - ' + choice.explanation + '\n';
        }
      });
    } else {
      // oneof question
      this.questions[questionId].choices.forEach(choice => {
        // only display the explanation if it is not empty
        if (answer === choice.id && !this.utils.isEmpty(choice.explanation)) {
          explanation = choice.explanation;
        }
      });
    }
    if (!explanation) {
      return submission;
    }
    // put the explanation in the submission
    const thisExplanation = explanation.replace(/text-align: center;/gi, 'text-align: center; text-align: -webkit-center;');
    submission.answers[questionId].explanation = this.sanitizer.bypassSecurityTrustHtml(thisExplanation);

    return submission;
  }

  private _normaliseAnswer(questionId, answer) {
    if (this.questions[questionId]) {
      switch (this.questions[questionId].type) {
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

  saveAnswers(assessment: AssessmentSubmitBody, answers: object, action: string, submissionId?: number) {
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

  checkReviewer(reviewer): string {
    if (!reviewer) {
      return null;
    }
    return reviewer.name !== this.storage.getUser().name ? reviewer.name : null;
  }

}
