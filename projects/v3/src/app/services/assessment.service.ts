import { Injectable } from '@angular/core';
import { Observable as RxObsservable, BehaviorSubject, of, Subscription, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { UtilsService } from '@v3/services/utils.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ApolloService } from './apollo.service';
import { DemoService } from './demo.service';
import { environment } from '@v3/environments/environment';
import { FastFeedbackService } from './fast-feedback.service';
import { RequestService } from 'request';

/**
 * @name api
 * @description list of api endpoint involved in this service
 * @type {Object}
 */
const api = {
  post: {
    resubmit: 'api/assessment_resubmit.json'
  }
};

export interface AssessmentSubmitParams {
  id: number;
  inProgress?: boolean;
  contextId?: number;
  reviewId?: number;
  submissionId?: number;
  unlock?: boolean;
}

export interface Assessment {
  id: number;
  name: string;
  type: string;
  description: string;
  isForTeam: boolean;
  dueDate?: string;
  isOverdue?: boolean;
  groups: Array<Group>;
  pulseCheck: boolean;
  allowResubmit?: boolean; // indicator to show resubmit button
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
  reviewerOnly?: boolean; // question meant for reviewer only
}

export interface Choice {
  id: number;
  name: string;
  explanation?: string | any;
}

export interface TeamMember {
  key: string;
  userName: string;
}

export type SubmissionStatuses = 'in progress' | 'pending review' | 'published' | 'pending approval' | 'feedback available' | 'done';

export interface Submission {
  id: number;
  status: SubmissionStatuses;
  answers: any;
  submitterName: string;
  modified: string;
  isLocked: boolean;
  completed?: boolean;
  submitterImage: string;
  reviewerName: string | void;
}

export interface Answer {
  questionId: number;
  answer?: any;
  comment?: string;
}

export interface AssessmentReview {
  id: number;
  answers: any;
  status: string;
  modified: string;
  teamName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  private _assessment$ = new BehaviorSubject<Assessment>(null);
  assessment$ = this._assessment$.pipe(shareReplay(1));
  private _submission$ = new BehaviorSubject<Submission>(null);
  submission$ = this._submission$.pipe(shareReplay(1));
  private _review$ = new BehaviorSubject<AssessmentReview>(null);
  review$ = this._review$.pipe(shareReplay(1));

  private assessment: Assessment;
  questions = {};

  constructor(
    private utils: UtilsService,
    private storage: BrowserStorageService,
    private NotificationsService: NotificationsService,
    private fastFeedbackService: FastFeedbackService,
    public sanitizer: DomSanitizer,
    private apolloService: ApolloService,
    private demo: DemoService,
    private request: RequestService,
  ) {
    this.assessment$.subscribe((res) => (this.assessment = res));
  }

  clearAssessment() {
    this._assessment$.next(null);
  }

  fetchAssessment(
    id: number,
    action: string,
    activityId: number,
    contextId: number,
    submissionId?: number
  ): Observable<{
    assessment: Assessment;
    submission: Submission;
    review: AssessmentReview;
  }> {
    return this.apolloService
      .graphQLFetch(
        `query getAssessment($assessmentId: Int!, $reviewer: Boolean!, $activityId: Int, $contextId: Int!, $submissionId: Int) {
        assessment(id:$assessmentId, reviewer:$reviewer, activityId:$activityId, submissionId:$submissionId) {
          id name type description dueDate isTeam pulseCheck allowResubmit
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
          submissions(contextId:$contextId) {
            id status completed modified locked
            submitter {
              name image
              team {
                name
              }
            }
            answers {
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
      }`,
        {
          variables: {
            assessmentId: id,
            reviewer: action === 'review',
            activityId: +activityId,
            submissionId: +submissionId || null,
            contextId: +contextId,
          },
        },
      )
      .pipe(map((res) => this._handleAssessmentResponse(res, action)));
  }

  /**
   * shared among reviewing & assessment answering page
   *
   * @param   {number}  id            assessment id
   * @param   {string}  action        review/assessment (reviewing or answering)
   * @param   {number}  activityId    activity id
   * @param   {number}  contextId     context id (activity & task related)
   * @param   {number}  submissionId  optional submission id
   *
   * @return  {Subscription}          no need to unsubscribe, handled by apollo
   */
  getAssessment(
    id,
    action,
    activityId,
    contextId,
    submissionId?
  ): Subscription {
    if (!this.assessment || this.assessment.id !== id) {
      this.clearAssessment();
    }
    if (environment.demo) {
      return this.demo
        .assessment(id)
        .pipe(map((res) => this._handleAssessmentResponse(res, action)))
        .subscribe();
    }
    return this.fetchAssessment(
      id,
      action,
      activityId,
      contextId,
      submissionId
    ).subscribe();
  }

  private _handleAssessmentResponse(
    res,
    action
  ): {
    assessment: Assessment;
    submission: Submission;
    review: AssessmentReview;
  } {
    if (!res) {
      return null;
    }

    const assessment = this._normaliseAssessment(res.data, action);
    const submission = this._normaliseSubmission(res.data);
    const review = this._normaliseReview(res.data, action);
    this._assessment$.next(assessment);
    this._submission$.next(submission);
    this._review$.next(review);

    return {
      assessment,
      submission,
      review,
    };
  }

  private _normaliseAssessment(data, action): Assessment {
    if (!data.assessment) {
      return null;
    }
    const assessment = {
      id: data.assessment.id,
      name: data.assessment.name,
      type: data.assessment.type,
      description: data.assessment.description,
      isForTeam: data.assessment.isTeam,
      dueDate: data.assessment.dueDate,
      isOverdue: data.assessment.dueDate
        ? this.utils.timeComparer(data.assessment.dueDate) < 0
        : false,
      pulseCheck: data.assessment.pulseCheck,
      allowResubmit: data.assessment.allowResubmit,
      groups: [],
    };
    data.assessment.groups.forEach((eachGroup) => {
      const questions: Question[] = [];
      if (!eachGroup.questions) {
        return;
      }
      eachGroup.questions.forEach((eachQuestion) => {
        this.questions[eachQuestion.id] = eachQuestion;
        const question: Question = {
          id: eachQuestion.id,
          name: eachQuestion.name,
          type: eachQuestion.type,
          description: eachQuestion.description,
          isRequired: eachQuestion.isRequired,
          canComment: eachQuestion.hasComment,
          canAnswer:
            action === 'review'
              ? eachQuestion.audience.includes('reviewer')
              : eachQuestion.audience.includes('submitter'),
          audience: eachQuestion.audience,
          submitterOnly:
            eachQuestion.audience.length === 1 &&
            eachQuestion.audience.includes('submitter'),
          reviewerOnly:
            eachQuestion.audience.length === 1 &&
            eachQuestion.audience.includes('reviewer'),
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
                explanation: eachChoice.explanation
                  ? this.sanitizer.bypassSecurityTrustHtml(
                      eachChoice.explanation
                    )
                  : null,
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
          case 'multi team member selector':
            question.teamMembers = [];
            eachQuestion.teamMembers.forEach((eachTeamMember) => {
              question.teamMembers.push({
                key: JSON.stringify(eachTeamMember),
                userName: eachTeamMember.userName,
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
          questions: questions,
        });
      }
    });
    return assessment;
  }

  private _normaliseSubmission(data): Submission {
    if (
      !this.utils.has(data, "assessment.submissions") ||
      data.assessment.submissions.length < 1
    ) {
      return null;
    }

    const firstSubmission = data.assessment.submissions[0];
    let submission: Submission = {
      id: firstSubmission.id,
      status: this._submissionStatus(firstSubmission.status),
      submitterName: firstSubmission.submitter.name,
      submitterImage: firstSubmission.submitter.image,
      modified: firstSubmission.modified,
      isLocked: firstSubmission.locked,
      completed: firstSubmission.completed,
      reviewerName: firstSubmission.review
        ? this.checkReviewer(firstSubmission.review.reviewer)
        : null,
      answers: {},
    };

    firstSubmission.answers.forEach((eachAnswer) => {
      eachAnswer.answer = this._normaliseAnswer(
        eachAnswer.questionId,
        eachAnswer.answer
      );
      submission.answers[eachAnswer.questionId] = {
        answer: eachAnswer.answer,
      };
      if (['published', 'done'].includes(submission.status)) {
        submission = this._addChoiceExplanation(eachAnswer, submission);
      }
    });

    return submission;
  }

  private _submissionStatus(status: SubmissionStatuses): SubmissionStatuses {
    switch (status) {
      case 'pending approval':
        return 'pending review';
      case 'published':
        return 'feedback available';
      default:
        return status;
    }
  }

  private _normaliseReview(data, action: string): AssessmentReview {
    if (
      !this.utils.has(data, 'assessment.submissions') ||
      data.assessment.submissions.length < 1
    ) {
      return null;
    }
    const firstSubmission = data.assessment.submissions[0];
    const firstSubmissionReview = firstSubmission.review;
    if (!firstSubmissionReview) {
      return null;
    }
    const review: AssessmentReview = {
      id: firstSubmissionReview.id,
      status: firstSubmissionReview.status,
      modified: firstSubmissionReview.modified,
      teamName: firstSubmission.submitter.team?.name,
      answers: {},
    };

    // only get the review answer if the review is published, or it is for the reviewer to see the review
    // i.e. don't display the review answer if it is for submitter and review not published yet
    if (firstSubmission.status !== 'published' && action === 'assessment') {
      return review;
    }

    firstSubmissionReview.answers.forEach((eachAnswer) => {
      eachAnswer.answer = this._normaliseAnswer(
        eachAnswer.questionId,
        eachAnswer.answer
      );
      review.answers[eachAnswer.questionId] = {
        answer: eachAnswer.answer,
        comment: eachAnswer.comment,
      };
    });
    return review;
  }

  /**
   * For each question that has choice (oneof & multiple), show the choice explanation in the submission if it is not empty
   */
  private _addChoiceExplanation(
    submissionAnswer,
    submission: Submission
  ): Submission {
    const questionId = submissionAnswer.questionId;
    const answer = submissionAnswer.answer;
    // don't do anything if there's no choices
    if (this.utils.isEmpty(this.questions[questionId].choices)) {
      return submission;
    }
    let explanation = '';
    if (Array.isArray(answer)) {
      // multiple question
      this.questions[questionId].choices.forEach((choice) => {
        // only display the explanation if it is not empty
        if (answer.includes(choice.id) && !this.utils.isEmpty(choice.explanation)) {
          explanation += choice.name + ' - ' + choice.explanation + '\n';
        }
      });
    } else {
      // oneof question
      this.questions[questionId].choices.forEach((choice) => {
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
    const thisExplanation = explanation.replace(
      /text-align: center;/gi,
      "text-align: center; text-align: -webkit-center;"
    );
    submission.answers[questionId].explanation =
      this.sanitizer.bypassSecurityTrustHtml(thisExplanation);

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
          answer = answer.map((value) => {
            return +value;
          });
          break;

        case 'multi team member selector':
          if (this.utils.isEmpty(answer)) {
            answer = [];
          }
          if (!Array.isArray(answer)) {
            // re-format json string to array
            answer = JSON.parse(answer);
          }
          break;
      }
    }
    return answer;
  }

  // store the answer to the question
  saveQuestionAnswer(submissionId: number, questionId: number, answer: string) {
    const paramsFormat = '$submissionId: Int!, $questionId: Int!, $answer: Any!';
    const params = 'submissionId:$submissionId, questionId:$questionId, answer:$answer';
    const variables = {
      submissionId,
      questionId,
      answer,
    };
    return this.apolloService
      .continuousGraphQLMutate(
        `mutation saveSubmissionAnswer(${paramsFormat}) {
        saveSubmissionAnswer(${params}) {
          success
          message
        }
      }`,
      variables
    ).pipe(map(res => {
      if (!this.isValidData('saveQuestionAnswer', res)) {
        throw new Error('Autosave: Invalid API data');
      }
      return res;
    }));
  }

  /**
   * Validate data returned from the API.
   *
   * check the 'success' property of a response data based on API response.
   * true only if 'success' is strictly equal to true, false for any other condition.
   *
   * @param   {string}   type  name of the API endpoint
   * @param   {any}      res   API response data
   *
   * @return  {boolean}       true only when response data is valid, otherwise false.
   */

  isValidData(type: string, res: any): boolean {
    if (this.utils.isEmpty(res?.data)) {
      return false;
    }

    let success: boolean;

    switch (type) {
      case 'saveQuestionAnswer':
        success = res?.data?.saveSubmissionAnswer?.success;
        break;
      case 'saveReviewAnswer':
        success = res?.data?.saveReviewAnswer?.success;
        break;
      case 'submitAssessment':
        success = res?.data?.submitAssessment?.success;
        break;
      case 'submitReview':
        success = res?.data?.submitReview?.success;
        break;
      default:
        throw new Error('Must specify a valid type');
    }

    return success === true;
  }

  // store the answer to the question
  saveReviewAnswer(reviewId: number, submissionId: number, questionId: number, answer: string, comment: string) {
    const paramsFormat = '$reviewId: Int!, $submissionId: Int! $questionId: Int!, $answer: Any!, $comment: String!';
    const params = 'reviewId:$reviewId, submissionId:$submissionId, questionId:$questionId, answer:$answer, comment:$comment';
    const variables = {
      reviewId,
      submissionId,
      questionId,
      answer,
      comment,
    };
    return this.apolloService
      .continuousGraphQLMutate(
        `mutation saveReviewAnswer(${paramsFormat}) {
        saveReviewAnswer(${params}) {
          success
          message
        }
      }`,
      variables
    ).pipe(map(res => {
      if (!this.isValidData('saveReviewAnswer', res)) {
        throw new Error('Autosave: Invalid API data');
      }
      return res;
    }));
  }

  // set the status of the submission to 'done' or 'pending approval'
  submitAssessment(
    submissionId: number,
    assessmentId: number,
    contextId: number,
    answers: Answer[]
  ) {
    const paramsFormat =
      '$submissionId: Int!, $assessmentId: Int!, $contextId: Int!, $answers: [AssessmentSubmissionAnswerInput]';
    const params =
      'submissionId:$submissionId, assessmentId:$assessmentId, contextId:$contextId, answers:$answers';
    const variables = {
      submissionId,
      assessmentId,
      contextId,
      answers,
    };
    return this.apolloService
      .graphQLMutate(
        `mutation submitAssessment(${paramsFormat}) {
        submitAssessment(${params})
      }`,
        variables
      )
      .pipe(
        map((res) => {
          if (!this.isValidData('submitAssessment', res)) {
            throw new Error('Submission: Invalid API data');
          }
          return res;
        })
      );
  }

  /**
   * Submit the review - set the status of the review to 'done'
   * @param assessmentId - assessment id
   * @param reviewId - review id
   * @param submissionId - submission id
   * @returns
   */
  submitReview(
    assessmentId: number,
    reviewId: number,
    submissionId: number,
    answers: Answer[]
  ) {
    const paramsFormat =
      '$assessmentId: Int!, $reviewId: Int!, $submissionId: Int!, $answers: [AssessmentReviewAnswerInput]';
    const params =
      'assessmentId:$assessmentId, reviewId:$reviewId, submissionId:$submissionId, answers:$answers';
    const variables = {
      assessmentId,
      reviewId,
      submissionId,
      answers,
    };
    return this.apolloService
      .graphQLMutate(
        `mutation submitReview(${paramsFormat}) {
        submitReview(${params})
      }`,
        variables
      )
      .pipe(
        map((res) => {
          if (!this.isValidData('submitReview', res)) {
            throw new Error('Submission: Invalid API data');
          }
          return res;
        })
      );
  }

  saveAnswers(
    assessment: AssessmentSubmitParams,
    answers: Answer[],
    action: string,
    hasPulseCheck: boolean
  ) {
    if (!['assessment', 'review'].includes(action)) {
      return of(false);
    }
    if (environment.demo) {
      console.log('save answers', assessment, answers, action);
      this._afterSubmit(assessment, answers, action, hasPulseCheck);
      return this.demo.normalResponse();
    }
    let paramsFormat = `$assessmentId: Int!, $inProgress: Boolean, $answers: [${
      action === 'assessment'
        ? 'AssessmentSubmissionAnswerInput'
        : 'AssessmentReviewAnswerInput'
    }]`;
    let params =
      'assessmentId:$assessmentId, inProgress:$inProgress, answers:$answers';
    const variables = {
      assessmentId: assessment.id,
      inProgress: assessment.inProgress,
      answers: answers,
    };
    [
      { key: 'submissionId', type: 'Int' },
      { key: 'contextId', type: 'Int!' },
      { key: 'reviewId', type: 'Int' },
      { key: 'unlock', type: 'Boolean' },
    ].forEach((item) => {
      if (assessment[item.key]) {
        paramsFormat += `, $${item.key}: ${item.type}`;
        params += `,${item.key}: $${item.key}`;
        variables[item.key] = assessment[item.key];
      }
    });
    return this.apolloService
      .graphQLMutate(
        `mutation saveAnswers(${paramsFormat}){
        ` +
          (action === 'assessment' ? `submitAssessment` : `submitReview`) +
          `(${params})
      }`,
        variables
      )
      .pipe(
        map((res) => {
          this._afterSubmit(assessment, answers, action, hasPulseCheck);
          return res;
        })
      );
  }

  private _afterSubmit(
    assessment: AssessmentSubmitParams,
    answers: Answer[],
    action: string,
    hasPulseCheck: boolean
  ) {
    if (hasPulseCheck && !assessment.inProgress) {
      this.pullFastFeedback();
    }
  }

  /**
   * - check if fastfeedback is available
   * - show pulsecheck/fastfeedback at next sequence if submission successful
   */
  async pullFastFeedback() {
    try {
      const modal = await this.fastFeedbackService
        .pullFastFeedback({ modalOnly: true })
        .toPromise();
      if (modal && modal.present) {
        await modal.present();
        await modal.onDidDismiss();
      }
    } catch (err) {
      const toasted = await this.NotificationsService.alert({
        header: $localize`Error retrieving pulse check data`,
        message: err.msg || JSON.stringify(err),
      });
      throw new Error(err);
    }
  }

  saveFeedbackReviewed(submissionId) {
    if (environment.demo) {
      console.log('feedback reviewed', submissionId);
      return of(true);
    }
    return this.NotificationsService.markTodoItemAsDone({
      identifier: 'AssessmentSubmission-' + submissionId,
    });
  }

  checkReviewer(reviewer): string {
    if (!reviewer) {
      return null;
    }
    return reviewer.name !== this.storage.getUser().name ? reviewer.name : null;
  }

  resubmitAssessment({ assessment_id, submission_id }): RxObsservable<any> {
    return this.request.post({
      endPoint: api.post.resubmit,
      data: {
        assessment_id,
        submission_id,
      },
    });
  }
}
