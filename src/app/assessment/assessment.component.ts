import { Component, Input, NgZone } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AssessmentService, Assessment, Submission, Review, AssessmentSubmission } from './assessment.service';
import { UtilsService } from '../services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BrowserStorageService } from '@services/storage.service';
import { RouterEnter } from '@services/router-enter.service';
import { SharedService } from '@services/shared.service';
import { ActivityService, OverviewActivity, OverviewTask } from '../activity/activity.service';
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
  getAssessment: Subscription;
  getSubmission: Subscription;
  routeUrl = '/assessment/';
  // assessment id
  id: number;
  // activity id
  activityId: number;
  // context id
  contextId: number;
  // action = 'assessment' is for user to do assessment
  // action = 'reivew' is for user to do review for this assessment
  submissionId: number;
  action: string;
  // the structure of assessment
  assessment: Assessment = {
    name: '',
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
    submitterImage: '',
    reviewerName: ''
  };
  review: Review = {
    id: 0,
    answers: {},
    status: '',
    modified: ''
  };

  // @TECHDEBT: we should be able to identify 2 following flags by just using `this.action` (review/assessment)
  // we'll need to manage assesmsent.status:
  // - pending approval
  // - pending review
  // - pending approval + done (AssessmentReview)
  doAssessment = false;
  doReview = false;

  feedbackReviewed = false;
  loadingFeedbackReviewed: boolean;
  loadingAssessment = true;
  loadingSubmission = true;
  questionsForm = new FormGroup({});
  submitting: boolean | string = false;
  savingButtonDisabled = true;
  savingMessage: string;
  saving: boolean;
  fromPage = '';
  markingAsReview = 'Continue';
  isRedirectingToNextMilestoneTask: boolean;

  constructor (
    public router: Router,
    private route: ActivatedRoute,
    private assessmentService: AssessmentService,
    public utils: UtilsService,
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

  // force every navigation happen under radar of angular
  private navigate(direction, params?): Promise<boolean> {
    return this.ngZone.run(() => {
      return this.router.navigate(direction, params);
    });
  }

  private _initialise() {
    this.assessment = {
      name: '',
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
    this.loadingSubmission = true;
    this.loadingFeedbackReviewed = true;
    this.saving = false;
    this.doAssessment = false;
    this.doReview = false;
    this.feedbackReviewed = false;
    this.questionsForm = new FormGroup({});
    this.submitting = false;
    this.savingButtonDisabled = true;
    this.savingMessage = '';
    this.markingAsReview = 'Continue';
    this.isRedirectingToNextMilestoneTask = false;
  }

  onEnter() {
    this._initialise();

    this.action = this.route.snapshot.data.action;
    this.fromPage = this.route.snapshot.paramMap.get('from');
    if (!this.fromPage) {
      this.fromPage = this.route.snapshot.data.from;
    }
    this.id = +this.route.snapshot.paramMap.get('id');
    this.activityId = +this.route.snapshot.paramMap.get('activityId');
    this.contextId = +this.route.snapshot.paramMap.get('contextId');
    this.submissionId = +this.route.snapshot.paramMap.get('submissionId');

    // get assessment structure and populate the question form
    this.assessmentService.getAssessment(this.id, this.action)
      .subscribe(
        assessment => {
          this.assessment = assessment;
          this.newRelic.setPageViewName(`Assessment: ${this.assessment.name} ID: ${this.id}`);
          this.populateQuestionsForm();

          this.loadingAssessment = false;
          this._getSubmission();

          if (this.doAssessment && this.assessment.isForTeam && !this.storage.getUser().teamId) {
            return this.notificationService.alert({
              message: 'To do this assessment, you have to be in a team.',
              buttons: [
                {
                  text: 'OK',
                  role: 'cancel',
                  handler: () => {
                    if (this.activityId) {
                      this.navigate(['app', 'activity', this.activityId ]);
                    } else {
                      this.navigate(['app', 'home']);
                    }
                  }
                }
              ]
            });
          }

        },
        (error) => {
          this.newRelic.noticeError(error);
        }
      );
  }

  ionViewWillLeave() {
    this.sharedService.stopPlayingVideos();
  }

  // get the submission answers &/| review answers
  private _getSubmission() {
    this.getSubmission = this.assessmentService.getSubmission(
      this.id,
      this.contextId,
      this.action,
      this.submissionId
    ).subscribe(
      result => {
        const { submission, review } = result;
        this.submission = submission;
        this.review = review;
        this.loadingSubmission = false;

        // If team assessment locked set readonly view.
        // set doAssessment, doReview to false - because when assessment lock we can't do both.
        // set submission status to done - because we need to show readonly answers in question components.
        if (this.submission.isLocked) {
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
          this.doAssessment = true;
          this.doReview = false;
          if (this.submission.status === 'in progress') {
            this.savingMessage = 'Last saved ' + this.utils.timeFormatter(this.submission.modified);
            this.savingButtonDisabled = false;
          }
          return;
        }

        if (review.status === 'in progress') {
          this.savingMessage = 'Last saved ' + this.utils.timeFormatter(review.modified);
          this.savingButtonDisabled = false;
        }

        // this component become a page for doing review, if
        // - the submission status is 'pending review' and
        // - this.action is review
        //
        // @TECHDEBT: why can't we just treat the entire assessment as "review" when
        // `this.action` is equal to "review"?
        if (this.submission.status === 'pending review' && this.action === 'review') {
          this.doReview = true;
        }

        // call todo item to check if the feedback has been reviewed or not
        if (this.submission.status === 'published') {
          this.assessmentService.getFeedbackReviewed(this.submission.id)
            .subscribe(
              (feedbackReviewed) => {
                this.feedbackReviewed = feedbackReviewed;
                this.loadingFeedbackReviewed = false;
              },
              (error: any) => {
                this.newRelic.noticeError(`${JSON.stringify(error)}`);
              }
            );
        }
      },
      (error) => {
        this.newRelic.noticeError(`${JSON.stringify(error)}`);
      });
  }

  // Populate the question form with FormControls.
  // The name of form control is like 'q-2' (2 is an example of question id)
  populateQuestionsForm() {
    let validator = [];
    this.assessment.groups.forEach(group => {
      group.questions.forEach(question => {
        // check if the compulsory is mean for current user's role
        if (question.isRequired && question.audience.includes(this.storage.getUser().role)) {
          // put 'required' validator in FormControl
          validator = [Validators.required];
        } else {
          validator = [];
        }

        this.questionsForm.addControl('q-' + question.id, new FormControl('', validator));
      });
    });
  }

  navigationRoute(): Promise<boolean> {
    if (this.fromPage && this.fromPage === 'reviews') {
      return this.navigate(['app', 'reviews']);
    }
    if (this.fromPage && this.fromPage === 'events') {
      return this.navigate(['events']);
    }
    if (this.activityId) {
      return this.navigate(['app', 'activity', this.activityId ]);
    }
    return this.navigate(['app', 'home']);
  }

  back(): Promise<boolean | void> {
    this.newRelic.actionText('Back to previous page.');

    if (this.action === 'assessment'
      && this.submission.status === 'published'
      && !this.feedbackReviewed) {
      return this.notificationService.alert({
        header: `Mark feedback as read?`,
        message: 'Would you like to mark the feedback as read?',
        buttons: [
          {
            text: 'No',
            handler: () => {
              return this.navigationRoute();
            },
          },
          {
            text: 'Yes',
            handler: () => {
              return this.markReviewFeedbackAsRead().then(() => {
                return this.navigationRoute();
              });
            }
          }
        ]
      });
    } else {
      // force saving progress
      this.submit(true , true, true);
      return this.navigationRoute();
    }
  }

  /**
   * @name compulsoryQuestionsAnswered
   * @description to check if every compulsory question has been answered
   * @param {Object[]} answers a list of answer object (in submission-based format)
   */
  compulsoryQuestionsAnswered(answers): object[] {
    const missing = [];
    const required = {};
    this.assessment.groups.forEach(group => {
      group.questions.forEach(question => {
        if (question.isRequired) {
          required[question.id] = question;
        }
      });
    });

    if (!this.utils.isEmpty(required)) {
      const answered = {}
      answers.map(answer => {
        answered[answer.assessment_question_id] = answer;
      });

      this.utils.each(required, question => {
        if (this.utils.isEmpty(answered[question.id]) || this.utils.isEmpty(answered[question.id].answer)) {
          missing.push(question);
        }
      });
    }

    return missing;
  }

  /**
   * allow progression if milestone isnt completed yet
   * @param  {boolean;   }}          options
   * @return {Promise<any>}
   */
  async redirectToNextMilestoneTask(options: {
    continue?: boolean; // extra parameter to allow "options" appear as well-defined variable
    routeOnly?: boolean; // routeOnly: True, return route in string. False, return navigated route (promise<void>)
  } = {}): Promise<any> {
    // skip "continue workflow" && instant redirect user, when:
    // - review action (this.action == 'review')
    // - fromPage = events (check AssessmentRoutingModule)
    if (
      this.action === 'review'
      || (this.action === 'assessment' && this.fromPage === 'events')
    ) {
      return this.navigationRoute();
    }

    if (options && options.continue) {
      this.isRedirectingToNextMilestoneTask = true;
    }

    let route: Array<string | number> = ['app', 'project'];
    let navigationParams: any;
    const { activity, nextTask } = await this.getNextSequence();

    // to next incompleted task in current activity
    if (activity.id === this.activityId && nextTask) {
      switch (nextTask.type) {
        case 'assessment':
          route = ['assessment', 'assessment', activity.id, nextTask.context_id, nextTask.id];
          break;

        case 'topic':
          route = ['topic', activity.id, nextTask.id];
          break;
      }
    }

    if (options.routeOnly === true) {
      return route;
    }

    // if found new activity, force back to milestone page
    if (activity.id !== this.activityId) {
      navigationParams = { queryParams: { activityId: activity.id } };

      if (options.continue !== true) {
        await this.notificationService.alert({
          header: 'Congratulations!',
          message: 'You have successfully completed this activity.<br>Let\'s take you to the next one.',
          buttons: [
            {
              text: 'Ok',
              role: 'cancel',
            }
          ]
        });
      }
    }

    // submitting is true, when awaiting submission response
    if (this.submitting) {
      this.submitting = 'redirecting';
      return setTimeout(
        async () => {
          await this.navigate(route, navigationParams);
          this.isRedirectingToNextMilestoneTask = false;
          return;
        },
        2000
      );
    } else {
      await this.navigate(route, navigationParams);
      this.isRedirectingToNextMilestoneTask = false;
      return;
    }
  }

  /**
   * - check if fastfeedback is available
   * - show next sequence if submission successful
   */
  private async pullFeedbackAndShowNext(): Promise<boolean> {
    this.submitting = 'Retrieving new task...';

    // check if this assessment have plus check turn on, if it's on show plus check and toast message
    if (this.assessment.pulseCheck) {
      try {
        const modal = await this.fastFeedbackService.pullFastFeedback({ modalOnly: true }).toPromise();

        if (modal && modal.present) {
          const presentedModal = await modal.present();
          this.notificationService.presentToast('Submission successful!', false, '', true);
          await modal.onDidDismiss();
        }
      } catch (err) {
        const toasted = await this.notificationService.alert({
          header: 'Error retrieving pulse check data',
          message: err.msg || JSON.stringify(err)
        });
        this.submitting = false;
        throw new Error(err);
      }
    }

    const nextTask = await this.redirectToNextMilestoneTask();
    return nextTask;
  }

  /**
   * handle submission and autosave
   * @param {boolean} saveInProgress set true for autosaving or it treat the action as final submision
   * @param {boolean} goBack use to unlock team assessment when leave assessment by clicking back button
   * @param {boolean} isManualSave use to detect manual progress save
   */
  async submit(saveInProgress: boolean, goBack?: boolean, isManualSave?: boolean): Promise<any> {

    /**
     * checking is this a submission or progress save
     * - if it's a submission
     *    - assign false to saving variable to disable save
     *    - changing submitting variable value to 'Submitting'
     * - if it's a progress save
     *    - if this is a manual save or there are no any auto save in progress
     *      - change saving variable value to true to enable save
     *      - make manual save button disable
     *      - change savingMessage variable value to 'Saving...' to show save in progress
     *    - if this not manual save or there is one save in progress
     *      - do nothing
     */
    if (saveInProgress) {
      if (isManualSave || !this.saving) {
        this.savingMessage = 'Saving...';
        this.saving = true;
        this.savingButtonDisabled = true;
      } else {
        return;
      }
    } else {
      this.submitting = 'Submitting...';
      this.saving = false;
    }

    const answers = [];
    let questionId = 0;
    let assessment: AssessmentSubmission;

    assessment = {
      id: this.id,
      in_progress: false
    };

    // form submission answers
    if (this.doAssessment) {
      assessment.context_id = this.contextId;

      if (saveInProgress) {
        assessment.in_progress = true;
      }
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
              answer = '';
            }
          });
        }
        answers.push({
          assessment_question_id: questionId,
          answer: answer
        });
      });
    }

    // form feedback answers
    if (this.doReview) {
      assessment = Object.assign(assessment, {
        review_id: this.review.id,
        submission_id: this.submission.id,
        in_progress: (saveInProgress) ? true : false,
      });

      this.utils.each(this.questionsForm.value, (answer, key) => {
        if (!this.utils.isEmpty(answer)) {
          answer.assessment_question_id = +key.replace('q-', '');
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
    /*this.assessmentService.saveAnswers(
      assessment,
      answers,
      this.action,
      this.submission.id
    ).subscribe(
      (result: any) => {
        this.savingButtonDisabled = false;
        if (saveInProgress) {
          this.newRelic.actionText('Saved progress.');
          this.submitting = false;
          // display message for successfull saved answers
          this.savingMessage = 'Last saved ' + this._getCurrentTime();
        } else {
          this.newRelic.actionText('Submit answer.');

          return this.pullFeedbackAndShowNext();
        }
      },
      (err: {msg: string}) => {
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
            message: err.msg || JSON.stringify(err),
            buttons: [
              {
                text: 'OK',
                role: 'cancel'
              }
            ]
          });
          throw new Error(err.msg || JSON.stringify(err));
        }
      }
    );
    // if saveInProgress and isManualSave true renabling save without wait 10 second
    if (saveInProgress && isManualSave) {
      this.saving = false;
    }
    // if timeout, reset this.saving flag to false, to enable saving again
    setTimeout(() => this.saving = false, SAVE_PROGRESS_TIMEOUT);
    */
  }

  // mark review as read
  async markReviewFeedbackAsRead(): Promise<void | boolean> {
    let nextSequence;

    // step 1.0: allow only if it hasnt reviewed
    if (!this.feedbackReviewed) {
      let result: { success: boolean; };
      this.markingAsReview = 'Marking as read...';
      this.feedbackReviewed = true;
      this.isRedirectingToNextMilestoneTask = true;

      // step 1.1: Mark feedback as read
      try {
        this.newRelic.actionText('Waiting for fast feedback data.');
        result = await this.assessmentService.saveFeedbackReviewed(this.submission.id).toPromise();
        this.loadingFeedbackReviewed = false;
        this.newRelic.actionText('Fast feedback answered.');
      } catch (err) {
        const toasted = await this.notificationService.alert({
          header: 'Error marking feedback as completed',
          message: err.msg || JSON.stringify(err)
        });

        // deactivate loading indicator on fail
        this.feedbackReviewed = false;
        this.isRedirectingToNextMilestoneTask = false;
        this.loadingFeedbackReviewed = false;
        this.markingAsReview = 'Continue';
        throw new Error(err);
      }

      // mark as read successful
      // @TODO need to show three dots and tick icon

      // step 1.2: after feedback marked as read, popup review rating screen
      try {
        // display review rating modal and then redirect to task screen under proper activity.
        // Conditions:
        // 1. if review is successfully mark as read (from above) and
        // 2. hasReviewRating (activation): program configuration is set enabled presenting review rating screen
        if (result.success && this.storage.getUser().hasReviewRating === true) {
          this.markingAsReview = 'Retrieving New Task...';
          this.isRedirectingToNextMilestoneTask = true;

          this.newRelic.actionText('Evaluate & navigate to next task.');
          nextSequence = await this.redirectToNextMilestoneTask({routeOnly: true});
          this.newRelic.actionText('Waiting for rating API response.');
          const popup = await this.assessmentService.popUpReviewRating(
            this.review.id,
            nextSequence
          );

          this.loadingFeedbackReviewed = false;
          this.markingAsReview = 'Continue';
          return popup;
        }
      } catch (err) {
        const msg = 'Error retrieving rating page';
        this.newRelic.noticeError(msg);
        const toasted = await this.notificationService.alert({
          header: msg,
          message: err.msg || JSON.stringify(err)
        });

        // deactivate loading indicator on fail
        this.loadingFeedbackReviewed = false;
        this.isRedirectingToNextMilestoneTask = false;
        this.markingAsReview = 'Continue';
        throw new Error(err);
      }
    }

    // step 2.0: if feedback had been marked as read beforehand,
    //         straightaway redirect user to the next task instead.
    this.markingAsReview = 'Retrieving New Task...';
    this.newRelic.actionText('Evaluate & navigate to next task.');
    nextSequence = await this.redirectToNextMilestoneTask({ continue: true });
    this.loadingFeedbackReviewed = false;
    this.markingAsReview = 'Continue';
    return nextSequence;
  }

  showQuestionInfo(info) {
    this.newRelic.actionText('Read question info.');
    this.notificationService.popUp('shortMessage', {message: info});
  }

  private _getCurrentTime() {
    return new Intl.DateTimeFormat('en-GB', {
      hour12: true,
      hour: 'numeric',
      minute: 'numeric'
    }).format(new Date());
  }

  /**
   * when all task in an activity is completed, activity & nextTask are empty
   * when has incompleted task, activity would be available
   * @return {Promise} [description]
   */
  private async getNextSequence(): Promise<{
    activity: OverviewActivity;
    nextTask: OverviewTask;
  }> {
    const options = {
      currentTaskId: this.id,
      teamId: this.storage.getUser().teamId
    };

    try {
      const { projectId } = this.storage.getUser();
      const {
        currentActivity,
        nextTask
      } = await this.activityService.getTasksByActivityId(
        projectId,
        this.activityId,
        options
      );

      return {
        activity: currentActivity,
        nextTask
      };
    } catch (err) {
      const toasted = await this.notificationService.alert({
        header: 'Project overview API Error',
        message: err.msg || JSON.stringify(err)
      });

      if (this.submitting) {
        this.submitting = false;
      }
      throw new Error(err);
    }
  }
}
