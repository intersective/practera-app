import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { Assessment, Submission, AssessmentReview, AssessmentSubmitParams, Question, AssessmentService } from '@v3/services/assessment.service';
import { UtilsService } from '@v3/services/utils.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BrowserStorageService } from '@v3/services/storage.service';
import { SharedService } from '@v3/services/shared.service';
import { BehaviorSubject, Observable, of, Subject, Subscription, throwError } from 'rxjs';
import { concatMap, delay, filter, tap } from 'rxjs/operators';

// const SAVE_PROGRESS_TIMEOUT = 10000; - AV2-1326
@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.scss'],
})
export class AssessmentComponent implements OnChanges, OnDestroy {
  /**
   * -- action --
   * Options: assessment/review
   *
   * 'assessment' is for user to do assessment, including
   * reading a submission or feedback. This actually
   * means the current user is the user who should "do" this assessment
   *
   * 'reivew' is for user to do review for this assessment. This means the
   * current user is the user who should "review" this assessment
   */
  @Input() action: string;
  @Input() assessment: Assessment = null;
  @Input() contextId: number;
  @Input() submission: Submission;
  @Input() review: AssessmentReview;
  @Input() isMobile?: boolean = false;

  // the text of when the submission get saved last time
  @Input() savingMessage$: BehaviorSubject<string>;

  // whether the bottom button(and the save button) is disabled
  @Input() btnDisabled$: BehaviorSubject<boolean>;

  // save the assessment/review answers
  @Output() save = new EventEmitter();
  // mark the feedback as read
  @Output() readFeedback = new EventEmitter();
  // continue to the next task
  @Output() continue = new EventEmitter();

  submitActions = new Subject<{
    autoSave: boolean;
    goBack: boolean;
    questionSave?: {
      submissionId: number;
      questionId: number;
      answer: string;
    };
    reviewSave?: {
      reviewId: number;
      submissionId: number;
      questionId: number;
      answer: string;
      comment: string;
    };
  }>();
  subscriptions: Subscription[] = [];

  // if doAssessment is true, it means this user is actually doing assessment, meaning it is not started or is in progress
  // if action == 'assessment' and doAssessment is false, it means this user is reading the submission or feedback
  doAssessment: boolean;

  // if isPendingReview is true, it means this review is WIP, meaning this assessment is pending review
  // if action == 'review' and isPendingReview is false, it means the review is done and this student is reading the submission and review
  isPendingReview = false;

  // whether the learner has seen the feedback
  feedbackReviewed = false;

  // virtual element id for accessibility "aria-describedby" purpose
  elIdentities = {};

  // to hide assessment content if user not is a team.
  isNotInATeam = false;

  questionsForm: FormGroup;

  // prevent non participants from submitting team assessment
  get preventSubmission() {
    return this._preventSubmission();
  }

  constructor(
    readonly utils: UtilsService,
    private notifications: NotificationsService,
    private storage: BrowserStorageService,
    private sharedService: SharedService,
    private assessmentService: AssessmentService
  ) {
    this.subscriptions.push(
      this.submitActions.pipe(
        filter(() => !this._preventSubmission()), // skip when false
        concatMap(request => {
          if (request?.reviewSave) {
            return this.saveReviewAnswer(request.reviewSave);
          }
          if (request?.questionSave) {
            return this.saveQuestionAnswer(request.questionSave);
          }
          return of(request);
        }),
      ).subscribe(
        (data: {
          autoSave: boolean;
          goBack: boolean;
          questionSave?: {
            submissionId: number;
            questionId: number;
            answer: string;
          };
          error?: any;
        }): void | Promise<void> => {
          if (!this.utils.isEmpty(data.error)) {
            return this.notifications.assessmentSubmittedToast({
              isFail: true,
              label: $localize`Save failed.`,
            });
          }

          if (data.autoSave === false) {
            return this._submitAnswer(data);
          }
        },
        // save/submission error handling http 500
        (error: any) => {
          console.error('save failed::', error);
          return this.notifications.assessmentSubmittedToast({ isFail: true });
        }
      )
    );
  }

  /**
   * prevent non participants from submitting assessment
   * @returns {boolean} - true if user is not a participant and assessment is for team
   */
  private _preventSubmission(): boolean {
    let result = false;
    if (this.action === 'assessment' && this.assessment?.isForTeam === true && this.storage.getUser().role !== 'participant') {
      result = true;
    }
    return result;
  }

  /**
   * Saves the answer for a given question within a submission.
   *
   * @param {Object} questionInput - An object containing the necessary information for saving the answer.
   * @param {number} questionInput.submissionId - The ID of the submission in which the answer belongs.
   * @param {number} questionInput.questionId - The ID of the question being answered.
   * @param {string} questionInput.answer - The answer to the question.
   *
   * @returns {Observable} An Observable that resolves with the response from the assessment service.
   */
  saveQuestionAnswer(questionInput: {
    submissionId: number;
    questionId: number;
    answer: string;
  }): Observable<any> {
    const answer = (!this.utils.isEmpty(questionInput.answer)) ? questionInput.answer : '';
    return this.assessmentService.saveQuestionAnswer(
      questionInput.submissionId,
      questionInput.questionId,
      answer,
    ).pipe(
      delay(800)
    );
  }

  saveReviewAnswer(questionInput: {
    reviewId: number;
    submissionId: number;
    questionId: number;
    answer: string;
    comment: string;
  }): Observable<any> {
    const answer = (!this.utils.isEmpty(questionInput.answer)) ? questionInput.answer : '';
    const comment = (!this.utils.isEmpty(questionInput.comment)) ? questionInput.comment : '';
    return this.assessmentService.saveReviewAnswer(
      questionInput.reviewId,
      questionInput.submissionId,
      questionInput.questionId,
      answer,
      comment,
    ).pipe(
      delay(800),
      tap((res) => { console.log(res) })
    );
  }

  ngOnChanges() {
    if (!this.assessment) {
      return;
    }
    this._initialise();
    this._populateQuestionsForm();
    this._handleSubmissionData();
    this._handleReviewData();
    this._preventSubmission();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      if (!subscription.closed) {
        subscription.unsubscribe();
      }
    });
  }

  private _initialise() {
    this.doAssessment = false;
    this.feedbackReviewed = false;
    this.questionsForm = new FormGroup({});
    this.isNotInATeam = false;
    this.isPendingReview = false;
  }

  // Populate the question form with FormControls.
  // The name of form control is like 'q-2' (2 is an example of question id)
  private _populateQuestionsForm() {
    let validator = [];
    this.assessment.groups.forEach(group => {
      group.questions.forEach(question => {
        // check if the compulsory is mean for current user's role
        if (this._isRequired(question)) {
          // put 'required' validator in FormControl
          validator = [Validators.required];
        } else {
          validator = [];
        }

        this.questionsForm.addControl('q-' + question.id, new FormControl('', validator));
      });
    });
  }

  /**
   * Use the submission data to determine if user is trying to
   * 1. do the assessment
   * 2. see the submission
   * 3. do the review
   */
  private _handleSubmissionData() {
    // If team assessment is locked, set the page to readonly mode.
    // set doAssessment, isPendingReview to false - when assessment is locked, user can't do both.
    // set submission status to done - we need to show readonly answers in question components.
    if (this.submission && this.submission.isLocked) {
      this.doAssessment = false;
      this.submission.status = 'done';
      this.btnDisabled$.next(true);
      return;
    }

    // user is trying to do the assessment if
    // - there is no submission or
    // - submission is in progress
    if (this.action !== 'review'
      && (
        this.utils.isEmpty(this.submission)
        || this.submission.status === 'in progress'
      )
    ) {
      this.doAssessment = true;
      if (this.submission) {
        this.savingMessage$.next($localize `Last saved ${this.utils.timeFormatter(this.submission.modified)}`);
        this.btnDisabled$.next(false);
      }
      return;
    }

    if (this.assessment.type === 'moderated') {
      // user is trying to do the review, if
      // - the submission is pending review and
      // - this.action is review
      if (this.submission.status === 'pending review' && this.action === 'review') {
        this.isPendingReview = true;
      }
      return;
    }

    this.feedbackReviewed = this.submission.completed;
  }

  private _handleReviewData() {
    if (this.isPendingReview && this.review.status === 'in progress') {
      this.savingMessage$.next($localize `Last saved ${this.utils.timeFormatter(this.review.modified)}`);
      this.btnDisabled$.next(false);
    }
  }

  // make sure video is stopped when user leave the page
  ionViewWillLeave() {
    this.sharedService.stopPlayingVideos();
  }

  /**
   * a consistent comparison logic to ensure mandatory status
   * @param {question} question
   */
  private _isRequired(question) {
    let role = 'submitter';

    if (this.action === 'review') {
      role = 'reviewer';
    }

    return (question.isRequired && question.audience.includes(role));
  }

  /**
   * @name _compulsoryQuestionsAnswered
   * @description to check if every compulsory question has been answered
   * @param {Object[]} answers a list of answer object (in submission-based format)
   */
  private _compulsoryQuestionsAnswered(answers): Question[] {
    const missing = [];
    const answered = {};
    this.utils.each(answers, answer => {
      answered[answer.questionId] = answer;
    });

    this.assessment.groups.forEach(group => {
      group.questions.forEach(question => {
        if (this._isRequired(question)) {
          if (this.utils.isEmpty(answered[question.id]) || this.utils.isEmpty(answered[question.id].answer)) {
            missing.push(question);
          }
        }
      });
    });

    return missing;
  }

  /**
   * When user click the bottom button
   */
  continueToNextTask() {
    switch (this._btnAction) {
      case 'submit':
        this.btnDisabled$.next(true);
        return this.submitActions.next({
          autoSave: false,
          goBack: false,
        });
      case 'readFeedback':
        this.btnDisabled$.next(true);
        return this.readFeedback.emit(this.submission.id);
      default:
        return this.continue.emit();
    }
  }

  /**
   * @name filledAnswers
   * @description to collect all latest answers from the form
   *
   * @return  {any[]}
   */
  filledAnswers(): any[] {
    const answers = [];
    let questionId = 0;
    let assessment: AssessmentSubmitParams;

    assessment = {
      id: this.assessment.id
    };

    if (this.submission && this.submission.id) {
      assessment.submissionId = this.submission.id;
    }

    // form submission answers (submission API doesn't accept zero length array)
    if (this.doAssessment) {
      assessment.contextId = this.contextId;

      if (this.assessment.isForTeam) {
        assessment.unlock = true;
      }
      this.utils.each(this.questionsForm.value, (value, key) => {
        questionId = +key.replace('q-', '');
        let answer;
        if (value) {
          answer = value;
        } else {
          this.assessment.groups.forEach(group => {
            const currentQuestion = group.questions.find(question => {
              return question.id === questionId;
            });
            if (currentQuestion && currentQuestion.type === 'multiple') {
              answer = [];
            } else {
              answer = null;
            }
          });
        }
        answers.push({
          questionId: questionId,
          answer: answer
        });
      });
    }

    // In review we also have comments for a question. and questionsForm value have both
    // answer and comment. need to add them as separately
    if (this.isPendingReview) {
      assessment = Object.assign(assessment, {
        reviewId: this.review.id
      });

      // post answers API doesn't accept empty array
      // compulsory format: (even when no answers provided)
      // [
      //   { questionId: 1, answer: null, comment: null },
      //   { questionId: 2, answer: null, comment: null },
      //   { questionId: 3, answer: null, comment: null },
      // ]
      this.utils.each(this.questionsForm.value, (answer, key) => {
        questionId = +key.replace('q-', '');
        answers.push({
          questionId,
          answer: answer?.answer,
          comment: answer?.comment,
        });
      });
    }

    return answers;
  }

  async _submitAnswer({autoSave = false, goBack = false}) {
    const answers = this.filledAnswers();
    // check if all required questions have answer when assessment done
    const requiredQuestions = this._compulsoryQuestionsAnswered(answers);

    if (!autoSave && requiredQuestions.length > 0) {
      this.btnDisabled$.next(false);
      // display a pop up if required question not answered
      return this.notifications.alert({
        message: $localize`Required question answer missing!`,
        buttons: [
          {
            text: $localize`OK`,
            role: 'cancel',
          }
        ],
      });
    }

    if (this.doAssessment === true) {
      try {
        // make sure teamId is up to date
        await this.sharedService.getTeamInfo().toPromise();

        if (this.assessment.isForTeam) {
          const teamId = this.storage.getUser().teamId;
          if (typeof teamId !== 'number') {
            this.btnDisabled$.next(false);
            return this.notifications.alert({
              message: $localize`Currently you are not in a team, please reach out to your Administrator or Coordinator to proceed with next steps.`,
              buttons: [
                {
                  text: $localize`OK`,
                  role: 'cancel',
                }
              ],
            });
          }
        }
      } catch (error) {
        this.btnDisabled$.next(false);
        return this.notifications.assessmentSubmittedToast({ isFail: true });
      }
    }

    return this.save.emit({
      autoSave,
      goBack,
      answers,
      assessmentId: this.assessment.id,
      contextId: this.contextId,
      submissionId: this.submission.id,
    });
  }

  showQuestionInfo(info, keyboardEvent?: KeyboardEvent) {
    if (keyboardEvent && (keyboardEvent?.code === 'Space' || keyboardEvent?.code === 'Enter')) {
      keyboardEvent.preventDefault();
    } else if (keyboardEvent) {
      return;
    }

    return this.notifications.popUp('shortMessage', { message: info });
  }

  // the action that the button does
  private get _btnAction() {
    if (this.doAssessment || this.isPendingReview) {
      return 'submit';
    }

    if (this.submission) {
      // condition: Published && feedbackReview is true
      if (this.submission.status == 'published' && !this.feedbackReviewed) {
        return 'readFeedback';
      }

      // condition: status not always = "Published", so we need to check by the submission status (completed = true means completed)
      if (this.submission.status == 'feedback available' && this.submission.completed === false) {
        return 'readFeedback';
      }
    }

    return 'continue';
  }

  // the text of the button
  get btnText() {
    switch (this._btnAction) {
      case 'submit':
        if (this.action === 'review') {
          return $localize`submit review`;
        }
        return $localize`submit answers`;
      case 'readFeedback':
        return $localize`mark feedback as reviewed`;
      default:
        return $localize`continue`;
    }
  }

  /**
   * status of access restriction
   *
   * @return  {boolean}  cached singlePageAccess in localstorage
   */
  get restrictedAccess() {
    return this.storage.singlePageAccess;
  }

  /**
   * generate random float for id attribute for a specific assessment
   *
   * @param   {string}  asmtName  assessment name
   *
   * @return  {string}        random number in string form
   */
  randomCode(asmtName: string): string {
    if (!this.elIdentities[asmtName]) {
      this.elIdentities[asmtName] = this.utils.randomNumber();
    }
    return this.elIdentities[asmtName];
  }

  get label() {
    if (!this.submission || this.submission.status === 'done') {
      return '';
    }
    // for locked team assessment
    if (this.assessment.isForTeam && this.submission?.isLocked) {
      return $localize`in progress`;
    }
    if (!this.submission?.status || this.submission?.status === 'in progress') {
      if (this.assessment.isOverdue) {
        return $localize`overdue`;
      }
      return '';
    }

    // for i18n
    if (this.submission?.status === 'pending review') {
      return $localize`pending review`;
    }
    if (this.submission?.status === 'feedback available') {
      return $localize`feedback available`;
    }

    return this.submission?.status;
  }

  get labelColor() {
    if (!this.submission || this.submission.status === 'done') {
      return '';
    }
    // for locked team assessment
    if (this.assessment?.isForTeam && this.submission?.isLocked) {
      return 'dark-blue';
    }
    switch (this.submission?.status) {
      case 'pending review':
        return 'warning black';
      case 'feedback available':
        return 'success';
    }
    if ((!this.submission?.status || this.submission?.status === 'in progress') && this.assessment?.isOverdue) {
      return 'danger';
    }
    return '';
  }

  // [AV2-1270] condition to present asterisk in more obvious color
  get isRedColor(): boolean {
    return this.utils.isColor('red', this.storage.getUser().colors?.primary);
  }

  /**
   * When user click on the back button
   */
  // goBack(): Promise<boolean | void> {

  //   if (this.action === 'assessment'
  //     && this.submission
  //     && this.submission.status === 'published'
  //     && !this.feedbackReviewed) {
  //     return this.notifications.alert({
  //       header: `Mark feedback as read?`,
  //       message: 'Would you like to mark the feedback as read?',
  //       buttons: [
  //         {
  //           text: 'No',
  //           handler: () => this.navigateBack(),
  //         },
  //         {
  //           text: 'Yes',
  //           handler: () => this.markReviewFeedbackAsRead().then(() => {
  //             return this.navigateBack();
  //           })
  //         }
  //       ]
  //     });
  //   } else {
  //     // force saving progress
  //     this.submit(true, true, true);
  //     return this.navigateBack();
  //   }
  // }
}


