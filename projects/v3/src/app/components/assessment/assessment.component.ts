import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { Assessment, Submission, AssessmentReview, AssessmentSubmitParams, Question } from '@v3/services/assessment.service';
import { UtilsService } from '@v3/services/utils.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BrowserStorageService } from '@v3/services/storage.service';
import { SharedService } from '@v3/services/shared.service';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

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
  @Input() assessment: Assessment;
  @Input() contextId: number;
  @Input() submission: Submission;
  @Input() review: AssessmentReview;
  @Input() isMobile?: boolean;

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

  submitActions = new Subject();
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

  constructor(
    readonly utils: UtilsService,
    private notifications: NotificationsService,
    private storage: BrowserStorageService,
    private sharedService: SharedService,
  ) {
    this.subscriptions.push(this.submitActions.pipe(
      debounceTime(1500),
    ).subscribe((data: {
      saveInProgress: boolean;
      goBack: boolean;
    }): Promise<void> => {
      return this._submit(data.saveInProgress, data.goBack);
    }));
  }

  ngOnChanges() {
    if (!this.assessment) {
      return;
    }
    this._initialise();
    this._populateQuestionsForm();
    this._handleSubmissionData();
    this._handleReviewData();
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
    if (this.utils.isEmpty(this.submission) || this.submission.status === 'in progress') {
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
          saveInProgress: false,
          goBack: false,
        });
      case 'readFeedback':
        return this.readFeedback.emit(this.submission.id);
      default:
        return this.continue.emit();
    }
  }

  // When user click the save button
  btnSaveClicked() {
    return this.submitActions.next({
      saveInProgress: true,
      goBack: false,
    });
  }

  // When user click the back tutton
  btnBackClicked() {
    return this.submitActions.next({
      saveInProgress: true,
      goBack: true,
    });
  }

  /**
   * handle submission and autosave
   * @param saveInProgress whether it is for save in progress or submit
   * @param goBack use to unlock team assessment when leave assessment by clicking back button
   */
  async _submit(saveInProgress = false, goBack = false) {
    // @NOTE forgiveable redundancy: 2022_11_29
    // now we allow user to retrieve latest team status without re-login, so
    // we need to make sure left opened assessment page cannot be submitted
    // (e.g. the team submission page may still visible on client side even after
    // user team status got modified)
    if (this.doAssessment && this.assessment.isForTeam) {
      await this.sharedService.getTeamInfo().toPromise();
      const teamId = this.storage.getUser().teamId;
      if (typeof teamId !== 'number') {

        return this.notifications.alert({
          message: 'Currently you are not in a team, please reach out to your Administrator or Coordinator to proceed with next steps.',
          buttons: [
            {
              text: $localize`OK`,
              role: 'cancel',
            }
          ],
        });
      }
    }

    /**
     * This if statement will prevent save API request call for each change of the assessment. to make less load to servers.
     * Check saveInProgress
     * If it's true. that means it's an auto save or manual save acction.
     * Then check btnDisabled
     * If it's true. that means save API request or submit API request already send and waitng for response.
     * Then we are not doing anything.
     */
    /* comment for the tempery solution autosave AV2-1326
    // if (saveInProgress && this.btnDisabled$.getValue()) {
    //   return;
    // }

    // this.btnDisabled$.next(true);
    */

    const answers = [];
    let questionId = 0;
    let assessment: AssessmentSubmitParams;

    assessment = {
      id: this.assessment.id
    };
    if (saveInProgress) {
      assessment.inProgress = true;
    }
    if (this.submission && this.submission.id) {
      assessment.submissionId = this.submission.id;
    }

    // form submission answers (submission API doesn't accept zero length array)
    if (this.doAssessment) {
      assessment.contextId = this.contextId;

      if (this.assessment.isForTeam && goBack) {
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

    // form feedback answers (submission API doesn't accept zero length array)
    // In review we also have comments for a question. and questionsForm value have both
    // answer and comment. need to add them as separately
    if (this.isPendingReview) {
      assessment = Object.assign(assessment, {
        reviewId: this.review.id
      });

      this.utils.each(this.questionsForm.value, (answer, key) => {
        questionId = +key.replace('q-', '');
        answers.push({
          questionId: questionId,
          answer: answer.answer,
          comment: answer.comment
        });
      });
    }

    // check if all required questions have answer when assessment done
    const requiredQuestions = this._compulsoryQuestionsAnswered(answers);
    if (!saveInProgress && requiredQuestions.length > 0) {
      this.btnDisabled$.next(false);
      // display a pop up if required question not answered
      return this.notifications.alert({
        message: 'Required question answer missing!',
        // Please fill out the required fields.
        buttons: [
          {
            text: $localize`OK`,
            role: 'cancel',
            /*
              // doesn't work on iOS device, disable now to visit back later when it has cross-browser support
              handler: () => {
              return setTimeout(() => {
                return this.document.getElementById(`${requiredQuestions[0].id}`).scrollIntoView({
                  block: 'start',
                  behavior: 'smooth',
                  inline: 'nearest'
                });
              }, 500);
            } */
          }
        ],
      });
    }

    /* comment for the tempery solution autosave AV2-1326
    // allow submitting/saving after a few seconds
    // setTimeout(() => this.btnDisabled$.next(false), SAVE_PROGRESS_TIMEOUT);
    */

    this.save.emit({
      assessment,
      answers,
      action: this.action
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


