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

  constructor (
    private router: Router,
    private route: ActivatedRoute,
    private assessmentService: AssessmentService 
  ) {}

  ngOnInit() {
    this.action = this.route.snapshot.data.action;
    this.id = parseInt(this.route.snapshot.paramMap.get('id'));
    this.activityId = parseInt(this.route.snapshot.paramMap.get('activityId'));

    this.assessmentService.getAssessment(this.id)
      .subscribe(assessment => this.assessment = assessment);
    this.assessmentService.getSubmission(this.id, this.action)
      .subscribe(result => {

        this.submission = result.submission;
        // this page is for doing assessment if submission is empty
        if (Object.keys(this.submission).length == 0) {
          this.doAssessment = true;
          this.doReview = false;
          return ;
        }
        this.review = result.review;
        // this page is for doing review if review is empty and action is review
        if (Object.keys(this.review).length == 0 && this.action == 'review') {
          this.doReview = true;
        }
      });
  };

  back() {
    this.router.navigate(['pages', 'tabs', { outlets: { activity: ['activity', this.activityId] } }]);
  }
  
}
