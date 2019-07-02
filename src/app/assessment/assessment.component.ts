import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AssessmentService, Assessment, Submission, Review } from './assessment.service';
import { UtilsService } from '../services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BrowserStorageService } from '@services/storage.service';
import { RouterEnter } from '@services/router-enter.service';
import { SharedService } from '@services/shared.service';
import { ActivityService } from '../activity/activity.service';
import { FastFeedbackService } from '../fast-feedback/fast-feedback.service';

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
  submitting = false;
  savingButtonDisabled = true;
  savingMessage: string;
  saving: boolean;
  fromPage = '';

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
        // put 'required' validator in FormControl
        if (question.isRequired) {
          validator = [Validators.required];
        } else {
          validator = [];
        }

        this.questionsForm.addControl('q-' + question.id, new FormControl('', validator));
      });
    });
  }

  navigationRoute() {
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

  back() {
    // save answer before go back (if it's not a team assessment)
    if (this.assessment.isForTeam && !this.questionsForm.pristine) {
      return this.notificationService.alert({
        header: 'Confirm leaving?',
        message: 'All the unsubmitted answers would not be saved.',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Ok',
            handler: () => {
              return this.navigationRoute();
            }
          }
        ]
      });
    }

    this.submit(true);
    return this.navigationRoute();
  }

  /**
   * @name compulsoryQuestionsAnswered
   * @description to check if every compulsory question has been answered
   * @param {Object[]} answers a list of answer object (in submission-based format)
   */
  compulsoryQuestionsAnswered(answers) {
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
   * handle submission and autosave
   * @name submit
   * @param {boolean} saveInProgress set true for autosaving or it treat the action as final submision
   */
  submit(saveInProgress: boolean) {
    // team submission only accept submit and no save
    if (this.assessment.isForTeam && saveInProgress === true) {
      return;
    }

    if (saveInProgress) {
      this.savingMessage = 'Saving...';
      this.savingButtonDisabled = true;
    } else {
      this.submitting = true;
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
    };

    assessment = {
      id: this.id,
      in_progress: false,
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
        this.submitting = false;
        this.savingButtonDisabled = false;
        if (saveInProgress) {
          // display message for successfull saved answers
          this.savingMessage = 'Last saved ' + this._getCurrentTime();
        } else {

          this.fastFeedbackService.pullFastFeedback().subscribe(
            res => {
              // display a pop up for successful submission
              const nextSequence = this.getNextSequence();
              if (nextSequence) {
                return this.notificationService.alert({
                  header: 'Submission successful!',
                  message: 'You may continue to the next learning task.',
                  buttons: [
                    {
                      text: 'CONTINUE',
                      handler: () => {
                        // check if user has new fastFeedback request
                          return this.navigateBySequence(nextSequence);
                      }
                    }
                  ]
                });
              }
            },
            error => {
              console.log(error);
              return this.router.navigate(['app', 'home']);
            }
          );
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
            message: 'Submission failed, please check that all required questions have been answered.',
            buttons: [
              {
                text: 'OK',
                role: 'cancel'
              }
            ]
          });
        }
      }
    );

    // if timeout, reset this.saving flag to false, to enable saving again
    setTimeout(() => this.saving = false, SAVE_PROGRESS_TIMEOUT);
  }

  reviewFeedback() {
    this.feedbackReviewed = true;
    this.assessmentService.saveFeedbackReviewed(this.submission.id).subscribe(result => {
      // if review is successfully mark as read and program is configured to enable review rating,
      // display review rating modal and then redirect to activity page.
      if (result.success && this.storage.getUser().hasReviewRating === true) {
        this.assessmentService.popUpReviewRating(this.review.id, ['app', 'home']);
      }
    });
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

  private async getNextSequence() {
    let tasks = this.sharedService.getCache('tasks');
    let nextTask = null;
    const options = {
      id: this.id,
      teamId: this.storage.getUser().teamId
    };

    // reuse cached tasks (if cache present, so no extra API call needed)
    if (tasks && tasks.length > 0) {
      nextTask = this.activityService.findNext(tasks, options);
    } else {
      tasks = await this.activityService.getTaskWithStatusByActivityId(this.activityId);
      this.sharedService.setCache('tasks', tasks);
      nextTask = this.activityService.findNext(tasks, options);
    }

    return nextTask;
  }

  /**
   * @name navigateBySequence
   * @param {[type]} sequence [description]
   */
  private navigateBySequence(sequence) {
    const { contextId, isForTeam, id, type } = sequence;

    switch (type) {
      case 'Assessment':
        return this.router.navigate(['assessment', 'assessment', this.activityId , contextId, id]);
      case 'Topic':
        this.router.navigate(['topic', this.activityId, id]);
        break;

      default:
        return this.router.navigate(['app', 'activity', this.activityId]);
    }
  }
}
