import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AssessmentService, Assessment, Submission, Review } from './assessment.service';
import { UtilsService } from '../services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BrowserStorageService } from '@services/storage.service';

@Component({
  selector: 'app-assessment',
  templateUrl: 'assessment.component.html',
  styleUrls: ['assessment.component.scss']
})
export class AssessmentComponent implements OnInit {
  
  // assessment id
  id: number;
  // activity id
  activityId: number;
  // context id
  contextId: number;
  // action = 'assessment' is for user to do assessment
  // action = 'reivew' is for user to do review for this assessment
  action: string;
  // the structure of assessment
  assessment: Assessment = {
    name: '',
    description: '',
    isForTeam: false,
    groups: [
      {
        name: '',
        questions: [
          {
            id: 0,
            name: '',
            type: '',
            description: '',
            isRequired: false,
            canComment: true,
            canAnswer: true,
            choices: [
              {
                id: 0,
                name: ''
              }
            ]
          }
        ]
      }
    ]
  };
  submission: Submission = {
    id: 0,
    status: '',
    answers: {}
  };
  review: Review = {
    id: 0,
    answers: {}
  };
  doAssessment: boolean = false;
  doReview: boolean = false;
  feedbackReviewed: boolean = false;
  loadingFeedbackReviewed: boolean = true;
  questionsForm = new FormGroup({});
  submitting: boolean = false;

  constructor (
    private router: Router,
    private route: ActivatedRoute,
    private assessmentService: AssessmentService,
    private utils: UtilsService,
    private notificationService: NotificationService,
    private storage: BrowserStorageService    
  ) {}

  ngOnInit() {
    this.action = this.route.snapshot.data.action;
    this.id = parseInt(this.route.snapshot.paramMap.get('id'));
    this.activityId = parseInt(this.route.snapshot.paramMap.get('activityId'));
    this.contextId = parseInt(this.route.snapshot.paramMap.get('contextId'));

    // get assessment structure and populate the question form
    this.assessmentService.getAssessment(this.id, this.action)
      .subscribe(assessment => {
        this.assessment = assessment;
        this.populateQuestionsForm();
        if (this.assessment.isForTeam && !this.storage.getUser().teamId) {
          return this.notificationService.popUp('shortMessage', {message: 'To do this assessment, you have to be in a team.'}, ['app', { outlets: { project: ['activity', this.activityId] } }]);
        }
        this._getSubmission();
      });

  };

  // get the submission answers &/| review answers
  private _getSubmission() { 
    this.assessmentService.getSubmission(this.id, this.contextId, this.action)
      .subscribe(result => {
        this.submission = result.submission;
        // this page is for doing assessment if submission is empty
        if (this.utils.isEmpty(this.submission)) {
          this.doAssessment = true;
          this.doReview = false;
          return ;
        }
        this.review = result.review;
        // this page is for doing review if the submission status is 'pending review' and action is review
        if (this.submission.status == 'pending review' && this.action == 'review') {
          this.doReview = true;
        }
        // call todo item to check if the feedback has been reviewed or not
        if (this.submission.status == 'published') {
          this.assessmentService.getFeedbackReviewed(this.submission.id)
            .subscribe(result => {
              this.feedbackReviewed = result;
              this.loadingFeedbackReviewed = false;
            });
        }
      });
  }

  // Populate the question form with FormControls. 
  // The name of form control is like 'q-2' (2 is an example of question id)
  populateQuestionsForm() {
    let questionsFormObject = {};
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
      })
    });
    this.questionsForm = new FormGroup(questionsFormObject);
  }

  back() {
    this.router.navigate(['app', { outlets: { project: ['activity', this.activityId] } }]);
  }

  // form an object of required questions
  getRequiredQuestions() {
    let requiredQuestions = {};
    this.assessment.groups.forEach(group => {
      group.questions.forEach(question => {
        if (question.isRequired) {
          requiredQuestions[question.id] = true;
        }
      });
    });
    return requiredQuestions;
  }

  submit() {
    this.submitting = true;
    let answers = [];
    let assessment = {};
    let requiredQuestions = this.getRequiredQuestions();
    let questionId = 0;

    // form submission answers
    if (this.doAssessment) {
      assessment = {
        id: this.id,
        context_id: this.contextId
      }
      this.utils.each(this.questionsForm.value, (value, key) => {
        questionId = parseInt(key.replace('q-', ''));
        answers.push({
          assessment_question_id: questionId,
          answer: value
        });
        // unset the required questions object
        if (requiredQuestions[questionId] && value) {
          this.utils.unset(requiredQuestions, questionId);
        }
      });
      // check if all required questions have answer
      if (!this.utils.isEmpty(requiredQuestions)) {
        this.submitting = false;
        // display a pop up if required question not answered
        return this.notificationService.popUp('shortMessage', {message: 'Required question answer missing!'}, false);
      }
    }

    // form feedback answers
    if (this.doReview) {
      assessment = {
        id: this.id,
        review_id: this.review.id,
        submission_id: this.submission.id
      }
      this.utils.each(this.questionsForm.value, (value, key) => {
        if (value) {
          let answer = value;
          answer.assessment_question_id = parseInt(key.replace('q-', ''));
          answers.push(answer);
        }
      });
    }

    // save the submission/feedback
    this.assessmentService.saveAnswers(assessment, answers, this.action)
      .subscribe(result => {
        this.submitting = false;
        if (result.success) {
          let redirect = [];
          // redirect to activity page if it is doing assessment
          if (this.doAssessment) {
            redirect = ['app', { outlets: { project: ['activity', this.activityId] } }];
          }
          // redirect to reviews page if it is doing review
          if (this.doReview) {
            redirect = ['reviews'];
          }
          // display a pop up for successful submission
          return this.notificationService.popUp('shortMessage', {
            message: 'Submitted Successfully!'
          }, redirect);
        } else {
          // display a pop up if submission failed
          return this.notificationService.popUp('shortMessage', {
            message: 'Submission Failed, please try again later.'
          }, false);
        }
      });
  }

  reviewFeedback() {
    this.feedbackReviewed = true;
    this.assessmentService.saveFeedbackReviewed(this.submission.id).subscribe(result => {
      // if review is successfully mark as read and program is configured to enable review rating, display review rating modal and then redirect to activity page.   
      if (result.success && this.storage.getUser().hasReviewRating === true) {
        this.notificationService.reviewRating(this.review.id, ['app', { outlets: { project: ['activity', this.activityId] } }]);
      }
    });
  }

}
