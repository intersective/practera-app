import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AssessmentService } from './assessment.service';

@Component({
  selector: 'app-assessment',
  templateUrl: 'assessment.component.html',
  styleUrls: ['assessment.component.scss']
})
export class AssessmentComponent implements OnInit {
  
  // assessment id
  id = 0;
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
  // structure of submission
  submission = {

  };
  doAssessment = false;
  doReview = false;

  constructor (
    private route: ActivatedRoute,
    private assessmentService: AssessmentService 
  ) {}

  ngOnInit() {
    this.action = this.route.snapshot.data.action;
    this.id = parseInt(this.route.snapshot.paramMap.get('id'));
    this.assessmentService.getAssessment(this.id)
      .subscribe(assessment => this.assessment = assessment);
    this.assessmentService.getSubmission(this.id)
      .subscribe(submission => this.submission = submission);
  };

  back() {

  }
  
}
