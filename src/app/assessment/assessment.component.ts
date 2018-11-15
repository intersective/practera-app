import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AssessmentService } from './assessment.service';
import { UtilsService } from '../services/utils.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-assessment',
  templateUrl: 'assessment.component.html',
  styleUrls: ['assessment.component.scss']
})
export class AssessmentComponent implements OnInit {
  
  // assessment id
  id = 0;
  // activity id
  activityId = 0;
  // action = 'assessment' is for user to do assessment
  // action = 'reivew' is for user to do review for this assessment
  action = '';
  // the structure of assessment
  assessment = {
    name: '',
    description: '',
    groups: [
      {
        name: '',
        questions: [
          {
            id: '',
            name: '',
            type: '',
            description: '',
            isRequired: false,
            choices: [
              {
                id: '',
                name: ''
              }
            ]
          }
        ]
      }
    ]
  };
  submission = {};
  review = {};
  doAssessment = false;
  doReview = false;
  questionsForm = new FormGroup({});

  constructor (
    private router: Router,
    private route: ActivatedRoute,
    private assessmentService: AssessmentService,
    private utils: UtilsService
  ) {}

  ngOnInit() {
    this.action = this.route.snapshot.data.action;
    this.id = parseInt(this.route.snapshot.paramMap.get('id'));
    this.activityId = parseInt(this.route.snapshot.paramMap.get('activityId'));

    // get assessment structure and populate the question form
    this.assessmentService.getAssessment(this.id)
      .subscribe(assessment => {
        this.assessment = assessment;
        this.populateQuestionsForm();
      });

    // get the submission answers &/| review answers
    this.assessmentService.getSubmission(this.id, this.action)
      .subscribe(result => {
        this.submission = result.submission;
        // this page is for doing assessment if submission is empty
        if (this.utils.isEmpty(this.submission)) {
          this.doAssessment = true;
          this.doReview = false;
          return ;
        }
        this.review = result.review;
        // this page is for doing review if review is empty and action is review
        if (this.utils.isEmpty(this.review) && this.action == 'review') {
          this.doReview = true;
        }
      });
  };

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
    this.router.navigate(['pages', 'tabs', { outlets: { activity: ['activity', this.activityId] } }]);
  }

  submit() {
    console.log(this.questionsForm.value);
  }
  
}
