import { Component, Input, NgZone, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AssessmentService, Assessment, Submission, Review, AssessmentSubmitParams } from './assessment.service';
import { UtilsService } from '../services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BrowserStorageService } from '@services/storage.service';
import { RouterEnter } from '@services/router-enter.service';
import { SharedService } from '@services/shared.service';
import { ActivityService } from '../activity/activity.service';
import { FastFeedbackService } from '../fast-feedback/fast-feedback.service';
import { interval, timer, Subscription } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { NewRelicService } from '@shared/new-relic/new-relic.service';

const SAVE_PROGRESS_TIMEOUT = 10000;

@Component({
  selector: 'app-assessment',
  templateUrl: 'assessment.component.html',
  styleUrls: ['assessment.component.scss']
})
export class AssessmentComponent extends RouterEnter {
  @Input() inputId: number;
  @Input() inputActivityId: number;
  @Input() inputSubmissionId: number;
  @Input() inputContextId: number;
  @Input() inputAction: string;
  @Input() fromPage = '';
  @Output() navigate = new EventEmitter();
  @Output() changeStatus = new EventEmitter();
  getAssessment: Subscription;
  getSubmission: Subscription;
  routeUrl = '/assessment/';
  // assessment id
  id: number;
  // activity id
  activityId: number;
  // context id
  contextId: number;
  submissionId: number;
  assessment: Assessment = {
    name: '',
    type: '',
    description: '',
    isForTeam: false,
    dueDate: '',
    isOverdue: false,
    groups: [],
    pulseCheck: false,
  };
  submission: Submission = {
    id: 0,
    status: '',
    answers: {},
    submitterName: '',
    modified: '',
    isLocked: false,
    completed: false,
    submitterImage: '',
    reviewerName: ''
  };
  review: Review = {
    id: 0,
    answers: {},
    status: '',
    modified: ''
  };
  pageTitle = 'Assessment';
  // action == 'assessment' is for user to do assessment, including seeing the submission or seeing the feedback. This actually means the current user is the user who should "do" this assessment
  // action == 'reivew' is for user to do review for this assessment. This means the current user is the user who should "review" this assessment
  action: string;

  // if doAssessment is true, it means this user is actually doing assessment, meaning it is not started or in progress
  // if action == 'assessment' and doAssessment is false, it means this user is reading the submission or feedback
  doAssessment = false;
  // if doReview is true, it means this user is actually doing review, meaning this assessment is pending review
  // if action == 'review' and doReview is false, it means the review is done and this user is reading the submission and review
  doReview = false;

  feedbackReviewed = false;
  loadingAssessment = true;
  questionsForm = new FormGroup({});
  submitting: boolean;
  submitted: boolean;
  savingButtonDisabled = true;
  savingMessage: string;
  // used to prevent manual & automate saving happen at the same time
  saving: boolean;
  continueBtnLoading: boolean;

  elIdentities = {}; // virtual element id for accessibility "aria-describedby" purpose

  isNotInATeam = false; // to hide assessment content if user not is a team.

  constructor (
    public router: Router,
    private route: ActivatedRoute,
    private assessmentService: AssessmentService,
    readonly utils: UtilsService,
    private notificationService: NotificationService,
    public storage: BrowserStorageService,
    public sharedService: SharedService,
    private activityService: ActivityService,
    private fastFeedbackService: FastFeedbackService,
    private ngZone: NgZone,
    private newRelic: NewRelicService,
  ) {
    super(router);
  }

  get isMobile() {
    return this.utils.isMobile();
  }

  /**
   * status of access restriction
   *
   * @return  {boolean}  cached singlePageAccess in localstorage
   */
  get restrictedAccess() {
    return this.storage.singlePageAccess;
  }

  randomCode(type) {
    if (!this.elIdentities[type]) {
      this.elIdentities[type] = this.utils.randomNumber();
    }

    return this.elIdentities[type];
  }

  // force every navigation happen under radar of angular
  private _navigate(direction, params?): Promise<boolean> {
    if (this.utils.isMobile()) {
      // redirect to topic/assessment page for mobile
      return this.ngZone.run(() => {
        return this.router.navigate(direction, params);
      });
    } else {
      // emit to parent component(events component)
      if (['events', 'reviews'].includes(direction[1])) {
        this.navigate.emit();
        return ;
      }
      // emit event to parent component(task component)
      switch (direction[0]) {
        case 'topic':
          this.navigate.emit({
            type: 'topic',
            topicId: direction[2]
          });
          break;
        case 'assessment':
          this.navigate.emit({
            type: 'assessment',
            contextId: direction[3],
            assessmentId: direction[4]
          });
          break;
        default:
          return this.ngZone.run(() => {
            return this.router.navigate(direction, params);
          });
      }
    }
  }

  private _initialise() {
    this.assessment = {
      name: '',
      type: '',
      description: '',
      isForTeam: false,
      dueDate: '',
      isOverdue: false,
      groups: [],
      pulseCheck: false,
    };
    this.submission = {
      id: 0,
      status: '',
      answers: {},
      submitterName: '',
      modified: '',
      isLocked: false,
      completed: false,
      submitterImage: '',
      reviewerName: ''
    };
    this.review = {
      id: 0,
      answers: {},
      status: '',
      modified: ''
    };
    this.loadingAssessment = true;
    this.saving = false;
    this.doAssessment = false;
    this.doReview = false;
    this.feedbackReviewed = false;
    this.questionsForm = new FormGroup({});
    this.submitting = false;
    this.submitted = false;
    this.savingButtonDisabled = false;
    this.savingMessage = '';
    this.continueBtnLoading = false;
    this.id = null;
    this.activityId = null;
    this.contextId = null;
    this.submissionId = null;
    this.isNotInATeam = false;
  }

  onEnter() {
    this._initialise();

    if (this.inputAction) {
      this.action = this.inputAction;
    } else {
      this.action = this.route.snapshot.data.action;
    }
    if (!this.fromPage) {
      this.fromPage = this.route.snapshot.paramMap.get('from');
    }
    if (!this.fromPage) {
      this.fromPage = this.route.snapshot.data.from;
    }
    if (this.inputId) {
      this.id = +this.inputId;
    } else {
      this.id = +this.route.snapshot.paramMap.get('id');
    }
    if (this.inputActivityId) {
      this.activityId = +this.inputActivityId;
    } else {
      this.activityId = +this.route.snapshot.paramMap.get('activityId');
    }
    if (this.inputContextId) {
      this.contextId = +this.inputContextId;
    } else {
      this.contextId = +this.route.snapshot.paramMap.get('contextId');
    }
    if (this.inputSubmissionId) {
      this.submissionId = +this.inputSubmissionId;
    } else {
      this.submissionId = +this.route.snapshot.paramMap.get('submissionId');
    }

    // get assessment structure and populate the question form
    this.assessmentService.getAssessment(this.id, this.action, this.activityId, this.contextId, this.submissionId)
      .subscribe(
        async result => {
          this.assessment = result.assessment;
          this.newRelic.setPageViewName(`Assessment: ${this.assessment.name} ID: ${this.id}`);
          this.populateQuestionsForm();
          this.loadingAssessment = false;
          this._handleSubmissionData(result.submission);
          // display pop up if it is team assessment and user is not in team
          if (this.doAssessment && this.assessment.isForTeam && !this.storage.getUser().teamId) {
            this.isNotInATeam = true;
            return this.notificationService.alert({
              message: 'Currently you are not in a team, please reach out to your Administrator or Coordinator to proceed with next steps.',
              buttons: [
                {
                  text: 'OK',
                  role: 'cancel',
                  handler: () => {
                    this.goToNextTask();
                  }
                }
              ]
            });
          }
          this.isNotInATeam = false;
          this._handleReviewData(result.review);
        },
        error => {
          this.newRelic.noticeError(error);
        }
      );
  }

  private _handleSubmissionData(submission) {
    this.submission = submission;
    // If team assessment is locked, set the page to readonly mode.
    // set doAssessment, doReview to false - when assessment is locked, user can't do both.
    // set submission status to done - we need to show readonly answers in question components.
    if (this.submission && this.submission.isLocked) {
      this.doAssessment = false;
      this.doReview = false;
      this.savingButtonDisabled = true;
      this.submission.status = 'done';
      return;
    }

    // this component become a page for doing assessment if
    // - submission is empty or
    // - submission.status is 'in progress'
    if (this.utils.isEmpty(this.submission) || this.submission.status === 'in progress') {
      this.pageTitle = 'Submit your work';
      this.doAssessment = true;
      this.doReview = false;
      if (this.submission && this.submission.status === 'in progress') {
        this.savingMessage = 'Last saved ' + this.utils.timeFormatter(this.submission.modified);
        this.savingButtonDisabled = false;
      }
      return;
    }

    this.pageTitle = 'View submission';

    if (this.assessment.type === 'moderated') {
      // this component become a page for doing review, if
      // - the submission status is 'pending review' and
      // - this.action is review
      if (this.submission.status === 'pending review' && this.action === 'review') {
        this.pageTitle = 'Provide feedback';
        this.doReview = true;
      }

      if (this.submission.status === 'published') {
        this.pageTitle = 'View feedback';
      }
    }

    this.feedbackReviewed = this.submission.completed;
  }

  private _handleReviewData(review) {
    this.review = review;
    if (!review && this.action === 'review' && !this.doReview) {
      return this.notificationService.alert({
        message: 'There are no assessments to review.',
        buttons: [
          {
            text: 'OK',
            role: 'cancel',
            handler: () => {
                this._navigate(['app', 'home']);
              }
          }
        ]
      });
    }
    if (this.doReview && review.status === 'in progress') {
      this.savingMessage = 'Last saved ' + this.utils.timeFormatter(review.modified);
      this.savingButtonDisabled = false;
    }
  }


  ionViewWillLeave() {
    this.sharedService.stopPlayingVideos();
  }

  /**
   * a consistent comparison logic to ensure mandatory status
   * @param {question} question
   */
  private isRequired(question) {
    let role = 'submitter';

    if (this.action === 'review') {
      role = 'reviewer';
    }

    return (question.isRequired && question.audience.includes(role));
  }

  // Populate the question form with FormControls.
  // The name of form control is like 'q-2' (2 is an example of question id)
  populateQuestionsForm() {
    let validator = [];
    this.assessment.groups.forEach(group => {
      group.questions.forEach(question => {
        // check if the compulsory is mean for current user's role
        if (this.isRequired(question)) {
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
   * Navigate back to the previous page
   */
  navigateBack(): Promise<boolean> {
    const referrer = this.storage.getReferrer();
    if (this.utils.has(referrer, 'url') && referrer.route === 'assessment') {
      this.newRelic.actionText('Navigating to external return URL from Assessment');
      this.utils.redirectToUrl(referrer.url);
      return Promise.resolve(true);
    }
    if (this.fromPage && this.fromPage === 'reviews') {
      return this._navigate(['app', 'reviews']);
    }
    if (this.fromPage && this.fromPage === 'events') {
      return this._navigate(['app', 'events']);
    }
    if (this.activityId) {
      return this._navigate(['app', 'activity', this.activityId ]);
    }
    return this._navigate(['app', 'home']);
  }

  /**
   * When user click on the back button
   */
  back(): Promise<boolean | void> {
    this.newRelic.actionText('Back to previous page.');

    if (this.action === 'assessment'
      && this.submission
      && this.submission.status === 'published'
      && !this.feedbackReviewed) {
      return this.notificationService.alert({
        header: `Mark feedback as read?`,
        message: 'Would you like to mark the feedback as read?',
        buttons: [
          {
            text: 'No',
            handler: () => this.navigateBack(),
          },
          {
            text: 'Yes',
            handler: () => this.markReviewFeedbackAsRead().then(() => {
              return this.navigateBack();
            })
          }
        ]
      });
    } else {
      // force saving progress
      this.submit(true , true, true);
      return this.navigateBack();
    }
  }

  /**
   * @name compulsoryQuestionsAnswered
   * @description to check if every compulsory question has been answered
   * @param {Object[]} answers a list of answer object (in submission-based format)
   */
  compulsoryQuestionsAnswered(answers): object[] {
    const missing = [];
    const answered = {};
    this.utils.each(answers, answer => {
      answered[answer.questionId] = answer;
    });

    this.assessment.groups.forEach(group => {
      group.questions.forEach(question => {
        if (this.isRequired(question)) {
          if (this.utils.isEmpty(answered[question.id]) || this.utils.isEmpty(answered[question.id].answer)) {
            missing.push(question);
          }
        }
      });
    });

    return missing;
  }

  /**
   * When user click the continue button
   */
  async clickBtnContinue() {
    if (this.submission && this.submission.status === 'published' && !this.feedbackReviewed) {
      await this.markReviewFeedbackAsRead();
    }
    this.goToNextTask();
  }

  /**
   * Go to the next task
   */
  goToNextTask() {
    // skip "continue workflow" && instant redirect user, when:
    // - review action (this.action == 'review')
    // - fromPage = events (check AssessmentRoutingModule)
    if (this.action === 'review' ||
      (this.action === 'assessment' && this.fromPage === 'events')
    ) {
      return this.navigateBack();
    }

    this.newRelic.actionText('Navigate to next task.');
    this.continueBtnLoading = true;
    this.activityService.gotoNextTask(this.activityId, 'assessment', this.id, this.submitted).then(redirect => {
      this.continueBtnLoading = false;
      if (redirect) {
        this._navigate(redirect);
      }
    });
  }

  /**
   * - check if fastfeedback is available
   * - show next sequence if submission successful
   */
  private async pullFastFeedback() {
    this.continueBtnLoading = true;
    // check if this assessment have plus check turn on, if it's on show plus check and toast message
    if (!this.assessment.pulseCheck) {
      this.continueBtnLoading = false;
      return;
    }
    try {
      const modal = await this.fastFeedbackService.pullFastFeedback({ modalOnly: true }).toPromise();
      if (modal && modal.present) {
        await modal.present();
        await modal.onDidDismiss();
      }
      this.continueBtnLoading = false;
    } catch (err) {
      const toasted = await this.notificationService.alert({
        header: 'Error retrieving pulse check data',
        message: err.msg || JSON.stringify(err)
      });
      this.continueBtnLoading = false;
      throw new Error(err);
    }
  }

  /**
   * handle submission and autosave
   * @param saveInProgress set true for autosaving or it treat the action as final submision
   * @param goBack use to unlock team assessment when leave assessment by clicking back button
   * @param isManualSave use to detect manual progress save
   */
  async submit(saveInProgress: boolean, goBack?: boolean, isManualSave?: boolean): Promise<any> {

    /**
     * checking if this is a submission or progress save
     * - if it's a submission
     *    - assign true to saving variable to disable duplicate saving
     *    - change submitting variable value to true
     * - if it's a progress save
     *    - if this is a manual save or there is no other auto save in progress
     *      - change saving variable value to true to disable duplicate saving
     *      - make manual save button disable
     *      - change savingMessage variable value to 'Saving...' to show save in progress
     *    - if this is not manual save or there is one save in progress
     *      - do nothing
     */
    if (saveInProgress) {
      if (isManualSave || !this.saving) {
        this.savingMessage = 'Saving...';
        this.savingButtonDisabled = true;
      } else {
        return;
      }
    } else {
      this.submitting = true;
    }
    this.saving = true;

    const answers = [];
    let questionId = 0;
    let assessment: AssessmentSubmitParams;

    assessment = {
      id: this.id
    };
    if (saveInProgress) {
      assessment.inProgress = true;
    }
    if (this.submission && this.submission.id) {
      assessment.submissionId = this.submission.id;
    }

    // form submission answers
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

    // form feedback answers
    if (this.doReview) {
      assessment = Object.assign(assessment, {
        reviewId: this.review.id
      });

      this.utils.each(this.questionsForm.value, (answer, key) => {
        if (!this.utils.isEmpty(answer)) {
          answer.questionId = +key.replace('q-', '');
          answers.push(answer);
        }
      });
    }

    // check if all required questions have answer when assessment done
    const requiredQuestions = this.compulsoryQuestionsAnswered(answers);
    if (!saveInProgress && requiredQuestions.length > 0) {
      this.submitting = false;
      // display a pop up if required question not answered
      return this.notificationService.popUp('shortMessage', {
        message: 'Required question answer missing!'
      });
    }

    // save the submission/feedback
    this.assessmentService.saveAnswers(
      assessment,
      answers,
      this.action
    ).subscribe(
      result => {
        if (saveInProgress) {
          this.newRelic.actionText('Saved progress.');
          // display message for successfull saved answers
          this.savingMessage = 'Last saved ' + this._getCurrentTime();
          this.savingButtonDisabled = false;
        } else {
          this.newRelic.actionText('Assessment Submitted.');
          this.submitting = false;
          this.submitted = true;
          this.changeStatus.emit({
            id: +this.id,
            status: this.assessment.type === 'moderated' ? 'pending review' : 'done'
          });
          // disabled all forms controls
          Object.keys(this.questionsForm.controls).forEach(key => this.questionsForm.controls[key].disable());
          return this.pullFastFeedback();
        }
      },
      (err: { msg?: string, message?: string }) => {
        this.newRelic.noticeError(JSON.stringify(err));

        this.submitting = false;
        this.savingButtonDisabled = false;
        if (saveInProgress) {
          // display message when saving answers failed
          this.savingMessage = 'Auto save unavailable';
        } else {
          // display a pop up if submission failed
          this.notificationService.alert({
            header: 'Submission failed',
            message: 'Please refresh the page and try it again later',
            buttons: [
              {
                text: 'OK',
                role: 'cancel'
              }
            ]
          });
          throw new Error(err.msg || err.message || JSON.stringify(err));
        }
      }
    );
    // if saveInProgress and isManualSave true renabling save without wait 10 second
    if (saveInProgress && isManualSave) {
      this.saving = false;
    }
    // if timeout, reset this.saving flag to false, to enable saving again
    setTimeout(() => this.saving = false, SAVE_PROGRESS_TIMEOUT);
  }

  /**
   * Mark review feedback as read
   */
  async markReviewFeedbackAsRead(): Promise<void> {
    // do nothing if feedback is already mark as read
    if (this.feedbackReviewed) {
      return;
    }
    this.continueBtnLoading = true;
    let result;
    this.newRelic.actionText('Waiting for review feedback read.');
    // Mark feedback as read
    try {
      result = await this.assessmentService.saveFeedbackReviewed(this.submission.id).toPromise();
      this.feedbackReviewed = true;
      this.newRelic.actionText('Review feedback read.');
      this.continueBtnLoading = false;
    } catch (err) {
      this.continueBtnLoading = false;
      // @TODO - Removed the popup for now until we implement proper way to handle API error
      /**const toasted = await this.notificationService.alert({
        header: 'Marking feedback as read failed',
        message: err.msg || JSON.stringify(err)
      });
      throw new Error(err);
      **/
    }

    // After marking feedback as read, popup review rating modal if
    // 1. review is successfully marked as read (from above) - removing because above @TODO reason
    // 2. hasReviewRating (activation): program configuration is set to enable review rating
    if (!this.storage.getUser().hasReviewRating) {
      return;
    }
    this.continueBtnLoading = true;
    this.newRelic.actionText('Waiting for review rating API response.');
    try {
      // display review rating modal
      await this.assessmentService.popUpReviewRating(this.review.id, false);
      this.continueBtnLoading = false;
    } catch (err) {
      const msg = 'Can not get review rating information';
      this.newRelic.noticeError(msg);
      await this.notificationService.alert({
        header: msg,
        message: err.msg || JSON.stringify(err)
      });
      this.continueBtnLoading = false;
      throw new Error(err);
    }
  }

  showQuestionInfo(info) {
    this.newRelic.actionText('Read question info.');
    this.notificationService.popUp('shortMessage', {message: info});
  }

  private _getCurrentTime() {
    return new Intl.DateTimeFormat('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: 'numeric'
    }).format(new Date());
  }

  hasFooter() {
    return this.doAssessment || this.doReview || this.footerText();
  }

  submissionStatus() {
    switch (this.submission.status) {
      case 'published':
        if (this.feedbackReviewed) {
          return 'done';
        }
        return 'feedback available';
      case 'pending approval':
        return 'pending review';
      default:
        return this.submission.status;
    }
  }

  doAssessmentDoReviewStatus() {
    if (this.submitting) {
      return 'submitting';
    }

    if (this.submitted) {
      if (this.assessment.type === 'moderated') {
        if (this.doAssessment) {
          return 'pending review';
        }
        return 'review submitted';
      }
      return 'submitted';
    }
    // display the submit button, don't need the text in the footer
    return false;
  }

  /**
   * Get the text on the left of the footer.
   * Return false if it shouldn't be displayed
   */
  footerText(): string | boolean {
    // if it is to do assessment or do review
    if (this.doAssessment || this.doReview) {
      return this.doAssessmentDoReviewStatus();
    } else if (this.action === 'review' || !this.submission) {
      return false;
    } else {
      return this.submissionStatus();
    }
  }

}
