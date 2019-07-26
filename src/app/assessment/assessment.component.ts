import { Component, Input } from '@angular/core';
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
  loadingFeedbackReviewed = true;
  loadingAssessment = true;
  loadingSubmission = true;
  questionsForm = new FormGroup({});
  submitting: boolean | string = false;
  savingButtonDisabled = true;
  savingMessage: string;
  saving: boolean;
  fromPage = '';
  markingAsReview = 'Continue';

  constructor (
    public router: Router,
    private route: ActivatedRoute,
    private assessmentService: AssessmentService,
    public utils: UtilsService,
    private notificationService: NotificationService,
    public storage: BrowserStorageService,
    public sharedService: SharedService,
    private activityService: ActivityService,
    private fastFeedbackService: FastFeedbackService
  ) {
    super(router);
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
      .subscribe(assessment => {
        this.assessment = assessment;
        this.populateQuestionsForm();
        if (this.doAssessment && this.assessment.isForTeam && !this.storage.getUser().teamId) {
          return this.notificationService.alert({
            message: 'To do this assessment, you have to be in a team.',
            buttons: [
              {
                text: 'OK',
                role: 'cancel',
                handler: () => {
                  if (this.activityId) {
                    this.router.navigate(['app', 'activity', this.activityId ]);
                  } else {
                    this.router.navigate(['app', 'home']);
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
      return this.router.navigate(['app', 'reviews']);
    }
    if (this.fromPage && this.fromPage === 'events') {
      return this.router.navigate(['events']);
    }
    if (this.activityId) {
      return this.router.navigate(['app', 'activity', this.activityId ]);
    }
    return this.router.navigate(['app', 'home']);
  }

  back(): Promise<void | boolean> {
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
              return this.router.navigate(['app', 'activity', this.activityId]);
            },
          },
          {
            text: 'Yes',
            handler: () => {
              return this.markReviewFeedbackAsRead().then(() => {
                return this.notificationService.customToast({
                  message: 'Assessment completed! Please proceed to the next learning task.'
                }).then(() => this.router.navigate([
                  'app',
                  'activity',
                  this.activityId,
                ]));
              });
            }
          }
        ]
      });
    }

    // force saving progress
    this.submit(true , true);
    return this.navigationRoute();
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

  // allow progression if milestone isnt completed yet
  async redirectToNextMilestoneTask(activity, options? : {
    routeOnly: boolean;
  }): Promise<any> {
    const nextTask = await this.getNextSequence(activity);

    if (this.activityId !== activity.id) {
      await this.notificationService.alert({
        header: 'Activity completed!',
        message: 'You may now proceed to the next activity.',
        buttons: [
          {
            text: 'Ok',
            role: 'cancel',
          }
        ]
      });
    }

    let route = ['app', 'activity', activity.id];

    switch (nextTask.type) {
      case 'assessment':
        route = ['assessment', 'assessment', activity.id, nextTask.context_id, nextTask.id];
        break;

      case 'topic':
        route = ['topic', activity.id, nextTask.id];
        break;
    }

    if (options && options.routeOnly) {
      return route;
    }

    return this.router.navigate(route);
  }

  // get sequence detail and move on to next new task
  async skipToNextTask(options?): Promise<boolean> {
    try {
      const activity = await this.activityService.getTasksByActivityId(this.storage.getUser().projectId, this.activityId);
      return this.redirectToNextMilestoneTask(activity, options);
    } catch (err) {
      const toasted = await this.notificationService.alert({
        header: 'Project overview API Error',
        message: err
      });

      if (this.submitting) {
        this.submitting = false;
      }
      throw new Error(err);
    }
  }

  /**
   * - check if fastfeedback is available
   * - show next sequence if submission successful
   */
  private async pullFeedbackAndShowNext(): Promise<boolean> {
    this.submitting = 'Retrieving new task...';
    // check if user has new fastFeedback request
    try {
      await this.fastFeedbackService.pullFastFeedback().toPromise();
    } catch (err) {
      const toasted = await this.notificationService.alert({
        header: 'Error retrieving pulse check data',
        message: err
      });
      this.submitting = false;
      throw new Error(err);
    }

    await this.notificationService.customToast({
      message: 'You may continue to the next learning task.'
    });

    const nextTask = await this.skipToNextTask();
    this.submitting = false;
    return nextTask;
  }

  /**
   * handle submission and autosave
   * @param {boolean} saveInProgress set true for autosaving or it treat the action as final submision
   */
  submit(saveInProgress: boolean, goBack?: boolean) {

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
            message: err,
            buttons: [
              {
                text: 'OK',
                role: 'cancel'
              }
            ]
          });
          throw new Error(err);
        }
      }
    );

    // if timeout, reset this.saving flag to false, to enable saving again
    setTimeout(() => this.saving = false, SAVE_PROGRESS_TIMEOUT);
  }

  // mark review as read
  async markReviewFeedbackAsRead(): Promise<void | boolean> {
    // step 1.0: allow only if it hasnt reviewed
    if (!this.feedbackReviewed) {
      let result: { success: boolean; };
      this.markingAsReview = 'Marking as read...';
      this.feedbackReviewed = true;

      // step 1.1: Mark feedback as read
      try {
        result = await this.assessmentService.saveFeedbackReviewed(this.submission.id).toPromise();
        this.loadingFeedbackReviewed = false;
      } catch (err) {
        const toasted = await this.notificationService.alert({
          header: 'Error marking feedback as completed',
          message: err
        });

        this.feedbackReviewed = false;
        this.loadingFeedbackReviewed = false;
        this.markingAsReview = 'Continue';
        throw new Error(err);
      }

      // step 1.2: after feedback marked as read, popup review rating screen
      try {
        // display review rating modal and then redirect to task screen under proper activity.
        // Conditions:
        // 1. if review is successfully mark as read (from above) and
        // 2. hasReviewRating (activation): program configuration is set enabled presenting review rating screen
        if (result.success && this.storage.getUser().hasReviewRating === true) {
          this.markingAsReview = 'Retrieving New Task...';

          const nextSequence = await this.skipToNextTask({routeOnly: true});
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
          message: err
        });
        this.loadingFeedbackReviewed = false;
        this.markingAsReview = 'Continue';
        throw new Error(err);
      }
    }

    // step 2.0: if feedback had been marked as read beforehand,
    //         straightaway redirect user to the next task instead.
    this.markingAsReview = 'Retrieving New Task...';
    const nextSequence = await this.skipToNextTask();
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

  private async getNextSequence(activity?): Promise<OverviewTask> {
    let nextTask: OverviewTask;
    const options = {
      id: this.id,
      teamId: this.storage.getUser().teamId
    };

    if (!activity) {
      try {
        activity = await this.activityService.getTasksByActivityId(this.storage.getUser().projectId, this.activityId);
      } catch (err) {
        const toasted = await this.notificationService.alert({
          header: 'Project overview API Error',
          message: err
        });
        throw new Error(err);
      }
    }
    nextTask = this.activityService.findNext(activity.Tasks, options);

    return nextTask;
  }
}
