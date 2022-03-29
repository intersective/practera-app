import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Assessment, AssessmentService, Review, Submission } from '@v3/app/services/assessment.service';
import { BrowserStorageService } from '@v3/app/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { BehaviorSubject, interval } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.page.html',
  styleUrls: ['./reviews.page.scss'],
})
export class ReviewsPage implements OnInit {
  routeUrl = '/app/reviews';
  assessmentId: number;
  submissionId: number;
  contextId: number;

  currentReview$ = new BehaviorSubject<any>({});
  reviews$ = new BehaviorSubject<any[]>([]);

  currentAssessment: Assessment;
  loadingAssessment: boolean = true;

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
  currentReview: Review = {
    id: 0,
    answers: {},
    status: '',
    modified: ''
  };
  doAssessment = true;

  reviews = [
    {
      title: 'Final Report',
      icon: 'cog',
      submitter: 'John Doe',
      team: 'Team 1',
      status: 'pending',
      date: 'Feb',
    },
    {
      title: 'Final Report',
      icon: 'cog',
      submitter: 'Alys Harwood',
      team: 'Team 1',
      status: 'pending',
      date: 'Feb',
    },
    {
      title: 'Team Survey',
      icon: 'cog',
      submitter: 'John Doe',
      team: 'Team 1',
      status: 'pending',
      date: 'Feb',
    },
    {
      title: 'Feedback Loop',
      icon: 'cog',
      submitter: 'Tyreese Castillo',
      team: 'Team 3',
      status: 'pending',
      date: 'Feb',
    },
    {
      title: 'Test 1',
      icon: 'cog',
      submitter: 'submitter 1',
      team: 'Team 1',
      status: 'pending',
      date: 'Feb',
    },
    {
      title: 'Test 2',
      icon: 'cog',
      submitter: 'submitter 2',
      team: 'Team 2',
      status: 'pending',
      date: 'Feb',
    },
    {
      title: 'Test 3',
      icon: 'cog',
      submitter: 'submitter 3',
      team: 'Team 3',
      status: 'completed',
      date: 'Feb',
    },
  ];

  constructor(
    readonly utils: UtilsService,
    public router: Router,
    private route: ActivatedRoute,
    private assessmentService: AssessmentService,
    private storage: BrowserStorageService,
  ) {
    this.currentAssessment = {
      name: '',
      type: '',
      description: '',
      isForTeam: false,
      dueDate: '',
      isOverdue: false,
      groups: [],
      pulseCheck: false,
    };

    this.route.queryParams.subscribe(params => {
      console.log('ReviewsPageParams::', params);
      this.onEnter();
    });
  }

  ngOnInit() {
    /* interval(1000).pipe(take(10)).subscribe(x => {
      const result = parseFloat((Math.random() * x * 100).toFixed(0));
      this.currentReview$.next({
        something: (result % 2 == 0) ? true : false,
        value: result
      });
    }); */
    this.reviews$.next(this.reviews);
  }

  get isMobile() {
    return this.utils.isMobile();
  }

  onEnter(): void {
    this.currentReview$.next({
      name: '',
      type: '',
      description: '',
      isForTeam: false,
      dueDate: '',
      isOverdue: false,
      groups: [],
      pulseCheck: false,
    });
    this.submissionId = +this.route.snapshot.paramMap.get('submissionId');

    // get assessment structure and populate the question form
    this.assessmentService.getAssessment().subscribe(
      result => {
        this.currentAssessment = result.assessment;
        this.loadingAssessment = false;
        this._handleSubmissionData(result.submission);
        // display pop up if it is team assessment and user is not in team
        // if (this.doAssessment && this.assessment.isForTeam && !this.storage.getUser().teamId) {
        //   this.isNotInATeam = true;
        //   return;
        // }
        // this.isNotInATeam = false;
        this._handleReviewData(result.review);
        this.currentReview$.next(result.assessment);
      },
      error => {
        console.log(error);
      }
    );
  }

  // display the review content in the right pane, and highlight on the left pane
  goto(event) {
    if (!event) {
      this.submissionId = null;
      return;
    }
    this.assessmentId = +event.assessmentId;
    this.submissionId = +event.submissionId;
    this.contextId = +event.contextId;
    // trigger onEnter after the element get generated
    /* setTimeout(() => {
      this.assessment.onEnter();
    }); */
  }

  private _handleSubmissionData(submission) {
    this.submission = submission;
    // If team assessment is locked, set the page to readonly mode.
    // set doAssessment, doReview to false - when assessment is locked, user can't do both.
    // set submission status to done - we need to show readonly answers in question components.
    if (this.submission && this.submission.isLocked) {
      // this.doAssessment = false;
      // this.doReview = false;
      // this.savingButtonDisabled = true;
      this.submission.status = 'done';
      return;
    }

    // this component become a page for doing assessment if
    // - submission is empty or
    // - submission.status is 'in progress'
    if (this.utils.isEmpty(this.submission) || this.submission.status === 'in progress') {
      // this.doAssessment = true;
      // this.doReview = false;
      // if (this.submission && this.submission.status === 'in progress') {
      //   this.savingMessage = 'Last saved ' + this.utils.timeFormatter(this.submission.modified);
      //   this.savingButtonDisabled = false;
      // }
      return;
    }


    if (this.currentAssessment.type === 'moderated') {
      // this component become a page for doing review, if
      // - the submission status is 'pending review' and
      // - this.action is review
      // if (this.submission.status === 'pending review' && this.action === 'review') {
      //   this.doReview = true;
      // }
    }

    // this.feedbackReviewed = this.submission.completed;
  }

  private _handleReviewData(review) {
    // this.review = review;
    // if (!review && this.action === 'review' && !this.doReview) {
    //   return this.notificationsService.alert({
    //     message: 'There are no assessments to review.',
    //     buttons: [
    //       {
    //         text: 'OK',
    //         role: 'cancel',
    //         handler: () => {
    //           this._navigate(['v3', 'home']);
    //         }
    //       }
    //     ]
    //   });
    // }
    // if (this.doReview && review.status === 'in progress') {
    //   this.savingMessage = 'Last saved ' + this.utils.timeFormatter(review.modified);
    //   this.savingButtonDisabled = false;
    // }
  }
}
