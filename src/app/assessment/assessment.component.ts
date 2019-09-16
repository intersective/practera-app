import { Component, Input, NgZone } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AssessmentService, Assessment, Submission, Review } from './assessment.service';
import { UtilsService } from '../services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BrowserStorageService } from '@services/storage.service';
import { RouterEnter } from '@services/router-enter.service';
import { SharedService } from '@services/shared.service';
import { ActivityService, OverviewActivity, OverviewTask } from '../activity/activity.service';
import { FastFeedbackService } from '../fast-feedback/fast-feedback.service';
import { interval, timer } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

const SAVE_PROGRESS_TIMEOUT = 10000;

@Component({
  selector: 'app-assessment',
  templateUrl: 'assessment.component.html',
  styleUrls: ['assessment.component.scss']
})
export class AssessmentComponent extends RouterEnter {

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
    groups: []
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
    private ngZone: NgZone
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
      groups: []
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
    // @TODO only use for testing after complete need to remove, need to add this if assessment have pluscheck and remove from this place
    // commeted because unite test getting failed
    // this.notificationService.presentToast('Submission successful!', false, '', true);
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
      .subscribe(assessment => {
        this.assessment = assessment;
        this.populateQuestionsForm();
        if (this.assessment.isForTeam && !this.storage.getUser().teamId) {
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
        this.loadingAssessment = false;
        this._getSubmission();
      });
  }

  ionViewWillLeave() {
    this.sharedService.stopPlayingViodes();
  }

  // get the submission answers &/| review answers
  private _getSubmission() {
    this.assessmentService.getSubmission(this.id, this.contextId, this.action, this.submissionId)
      .subscribe(result => {
        this.submission = result.submission;
        this.loadingSubmission = false;
        // If team assessment locked set readonly view.
        // set doAssessment, doReview to false - because when assessment lock we can't do both.
        // set submission status to done - because we need to show readonly answers in question components.
        if (this.submission.isLocked) {
          this.doAssessment = false;
          this.doReview = false;
          this.savingButtonDisabled = true;
          this.submission.status = 'done';
          return ;
        }
        // this page is for doing assessment if submission is empty or submission is 'in progress'
        if (this.utils.isEmpty(this.submission) || this.submission.status === 'in progress') {
          this.doAssessment = true;
          this.doReview = false;
          if (this.submission.status === 'in progress') {
            this.savingMessage = 'Last saved ' + this.utils.timeFormatter(this.submission.modified);
            this.savingButtonDisabled = false;
          }
          return ;
        }
        this.review = result.review;
        if (this.review.status === 'in progress') {
          this.savingMessage = 'Last saved ' + this.utils.timeFormatter(this.review.modified);
          this.savingButtonDisabled = false;
        }
        // this page is for doing review if the submission status is 'pending review' and action is review
        if (this.submission.status === 'pending review' && this.action === 'review') {
          this.doReview = true;
        }
        // call todo item to check if the feedback has been reviewed or not
        if (this.submission.status === 'published') {
          this.assessmentService.getFeedbackReviewed(this.submission.id)
            .subscribe(feedbackReviewed => {
              this.feedbackReviewed = feedbackReviewed;
              this.loadingFeedbackReviewed = false;
            });
        }
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

  back() {
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
      this.submit(true , true);
      return this.navigationRoute();
    }
  }

  /**
   * @name compulsoryQuestionsAnswered
   * @description to check if every compulsory question has been answered
   * @param {Object[]} answers a list of answer object (in submission-based format)
   */
  compulsoryQuestionsAnswered(answers): object[] {
    const result = [];
    const missing = [];
    if (answers && answers.length > 0) {
      this.assessment.groups.forEach(group => {
        group.questions.forEach(question => {
          if (question.isRequired && missing.length === 0) {

            // check every answers value has all the compulsory questions covered
            const compulsoryQuestions = answers.filter(answer => {
              return answer.assessment_question_id === +question.id;
            });

            this.utils.each(compulsoryQuestions, answer => {
              if (typeof answer.answer !== 'number' && this.utils.isEmpty(answer.answer)) {
                missing.push(answer);
              }
            });
          }
        });
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
    if (options && options.continue) {
      this.isRedirectingToNextMilestoneTask = true;
    }

    // redirection for reviewer (this.activityId is 0)
    if (!this.activityId && this.activityId === 0) {
      return this.notificationService.alert({
        message: 'Submission Successful!',
        buttons: [
          {
            text: 'OK',
            role: 'cancel',
            handler: () => {
              return this.navigate(['app', 'home']);
            }
          }
        ]
      });
    }

    let route: any = ['app', 'project'];
    let navigationParams;
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

    await this.navigate(route, navigationParams);
    this.isRedirectingToNextMilestoneTask = false;
    return;
  }

  /**
   * - check if fastfeedback is available
   * - show next sequence if submission successful
   */
  private async pullFeedbackAndShowNext(): Promise<boolean> {
    this.submitting = 'Retrieving new task...';
    // check if user has new fastFeedback request
    // need to check puls chaneck on. need to call new api for that.
    try {
      await this.fastFeedbackService.pullFastFeedback().toPromise();
    } catch (err) {
      const toasted = await this.notificationService.alert({
        header: 'Error retrieving pulse check data',
        message: err.msg || JSON.stringify(err)
      });
      this.submitting = false;
      throw new Error(err);
    }

    // only when activityId availabe (reviewer screen dont have it)
    // need to show toast if plus check is turn on
    if (this.activityId) {
      const fastFeedbackIsOpened = this.storage.get('fastFeedbackOpening');
      if (fastFeedbackIsOpened) {
        this.notificationService.presentToast('Submission successful!', false, '', true);
      }
    }

    const nextTask = await this.redirectToNextMilestoneTask();
    this.submitting = false;
    return nextTask;
  }

  /**
   * handle submission and autosave
   * @param {boolean} saveInProgress set true for autosaving or it treat the action as final submision
   */
  async submit(saveInProgress: boolean, goBack?: boolean): Promise<any> {

    if (saveInProgress) {
      this.savingMessage = 'Saving...';
      this.savingButtonDisabled = true;
    } else {
      this.submitting = 'Submitting...';
      this.saving = false;
    }

    const answers = [];
    let questionId = 0;
    let assessment: {
      id: number;
      in_progress: boolean;
      context_id?: number;
      review_id?: number;
      submission_id?: number;
      unlock?: boolean;
    };

    assessment = {
      id: this.id,
      in_progress: false
    };

    if (this.saving) {
      return;
    }
    this.saving = true;

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

      // check if all required questions have answer when assessment done
      const requiredQuestions = this.compulsoryQuestionsAnswered(answers);
      if (!saveInProgress && requiredQuestions.length > 0) {
        this.submitting = false;
        // display a pop up if required question not answered
        return this.notificationService.popUp('shortMessage', {
          message: 'Required question answer missing!'
        });
      }
    }

    // form feedback answers
    if (this.doReview) {
      assessment = Object.assign(assessment, {
        review_id: this.review.id,
        submission_id: this.submission.id,
        in_progress: (saveInProgress) ? true : false,
      });

      this.utils.each(this.questionsForm.value, (answer, key) => {
        if (answer) {
          answer.assessment_question_id = +key.replace('q-', '');
          answers.push(answer);
        }
      });
    }

    // save the submission/feedback
    this.assessmentService.saveAnswers(assessment, answers, this.action, this.submission.id).subscribe(
      result => {
        this.savingButtonDisabled = false;
        if (saveInProgress) {
          this.submitting = false;
          // display message for successfull saved answers
          this.savingMessage = 'Last saved ' + this._getCurrentTime();
        } else {
          return this.pullFeedbackAndShowNext();
        }
      },
      err => {
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

    // if timeout, reset this.saving flag to false, to enable saving again
    setTimeout(() => this.saving = false, SAVE_PROGRESS_TIMEOUT);
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
        result = await this.assessmentService.saveFeedbackReviewed(this.submission.id).toPromise();
        this.loadingFeedbackReviewed = false;
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

          nextSequence = await this.redirectToNextMilestoneTask({routeOnly: true});
          const popup = await this.assessmentService.popUpReviewRating(
            this.review.id,
            nextSequence
          );

          this.loadingFeedbackReviewed = false;
          this.markingAsReview = 'Continue';
          return popup;
        }
      } catch (err) {
        const toasted = await this.notificationService.alert({
          header: 'Error retrieving rating page',
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
    nextSequence = await this.redirectToNextMilestoneTask({ continue: true });
    this.loadingFeedbackReviewed = false;
    this.markingAsReview = 'Continue';
    return nextSequence;
  }

  showQuestionInfo(info) {
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
      const {
        currentActivity,
        nextTask
      } = await this.activityService.getTasksByActivityId(
        this.storage.getUser().projectId,
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
