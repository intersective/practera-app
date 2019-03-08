import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AssessmentService, Assessment, Submission, Review } from './assessment.service';
import { UtilsService } from '../services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BrowserStorageService } from '@services/storage.service';
import { RouterEnter } from '@services/router-enter.service';

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
    groups: []
  };
  submission: Submission = {
    id: 0,
    status: '',
    answers: {},
    submitterName: '',
    modified: ''
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
  savingButtonDisable = true;
  savingMessage = '';
  fromPage = '';

  constructor (
    public router: Router,
    private route: ActivatedRoute,
    private assessmentService: AssessmentService,
    public utils: UtilsService,
    private notificationService: NotificationService,
    public storage: BrowserStorageService,
  ) {
    super(router);
  }

  private _initialise() {
    this.assessment = {
      name: '',
      description: '',
      isForTeam: false,
      groups: []
    };
    this.submission = {
      id: 0,
      status: '',
      answers: {},
      submitterName: '',
      modified: ''
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
  }

  onEnter() {
    this._initialise();
    this.action = this.route.snapshot.data.action;
    this.fromPage = this.route.snapshot.paramMap.get('from');
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
            this.savingButtonDisable = false;
          }
          return ;
        }
        this.review = result.review;
        if (this.review.status === 'in progress') {
          this.savingMessage = 'Last saved ' + this.utils.timeFormatter(this.review.modified);
          this.savingButtonDisable = false;
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
    const questionsFormObject = {};
    let validator = [];
    this.assessment.groups.forEach(group => {
      group.questions.forEach(question => {
        // put 'required' validator in FormControl
        if (question.isRequired) {
          validator = [Validators.required];
        } else {
          validator = [];
        }
        questionsFormObject['q-' + question.id] = new FormControl('', validator);
      });
    });
    this.questionsForm = new FormGroup(questionsFormObject);
  }

  back() {
    if (this.fromPage && this.fromPage === 'reviews') {
      return this.router.navigate(['app', 'reviews']);
    }
    if (this.activityId) {
      return this.router.navigate(['app', 'activity', this.activityId ]);
    }
    return this.router.navigate(['app', 'home']);
  }

  // form an object of required questions
  getRequiredQuestions() {
    const requiredQuestions = {};
    this.assessment.groups.forEach(group => {
      group.questions.forEach(question => {
        if (question.isRequired) {
          requiredQuestions[question.id] = true;
        }
      });
    });
    return requiredQuestions;
  }



  submit(saveInProgress: boolean) {
    if ( saveInProgress ) {
      this.savingMessage = 'Saving...';
      this.savingButtonDisable = true;
    } else {
      this.submitting = true;
    }
    const answers = [];
    let assessment;
    const requiredQuestions = this.getRequiredQuestions();
    let questionId = 0;

    // form submission answers
    if (this.doAssessment) {
      assessment = {
        id: this.id,
        context_id: this.contextId,
        in_progress: false
      };
      if (saveInProgress) {
        assessment.in_progress = true;
      }
      this.utils.each(this.questionsForm.value, (value, key) => {
        if (value) {
          questionId = +key.replace('q-', '');
          answers.push({
            assessment_question_id: questionId,
            answer: value
          });
          // unset the required questions object
          if (requiredQuestions[questionId]) {
            this.utils.unset(requiredQuestions, questionId);
          }
        }
      });
      // check if all required questions have answer when assessment done
      if (!saveInProgress && !this.utils.isEmpty(requiredQuestions)) {
        this.submitting = false;
        // display a pop up if required question not answered
        return this.notificationService.popUp('shortMessage', {message: 'Required question answer missing!'});
      }
    }

    // form feedback answers
    if (this.doReview) {
      assessment = {
        id: this.id,
        review_id: this.review.id,
        submission_id: this.submission.id,
        in_progress: false
      };
      if (saveInProgress) {
        assessment.in_progress = true;
      }
      this.utils.each(this.questionsForm.value, (value, key) => {
        if (value) {
          const answer = value;
          answer.assessment_question_id = +key.replace('q-', '');
          answers.push(answer);
        }
      });
    }
    // save the submission/feedback
    this.assessmentService.saveAnswers(assessment, answers, this.action, this.submission.id).subscribe(
      result => {
        this.submitting = false;
        this.savingButtonDisable = false;
        if (saveInProgress) {
          // display message for successfull saved answers
          this.savingMessage = 'Last saved a moment ago';
        } else {
          // display a pop up for successful submission
          return this.notificationService.alert({
            message: 'Submission Successful!',
            buttons: [
              {
                text: 'OK',
                role: 'cancel',
                handler: () => {
                  this.router.navigate(['app', 'home']);
                  return;
                }
              }
            ]
          });
        }
      },
      err => {
        this.submitting = false;
        this.savingButtonDisable = false;
        if (saveInProgress) {
          // display message when saving answers failed
          this.savingMessage = 'Auto save failed';
        } else {
          // display a pop up if submission failed
          this.notificationService.alert({
            message: 'Submission Failed, please try again later.',
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

}
