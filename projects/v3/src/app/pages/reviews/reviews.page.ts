import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Assessment, AssessmentService, AssessmentReview } from '@v3/app/services/assessment.service';
import { ReviewListService } from '@v3/app/services/review-list.service';
import { BrowserStorageService } from '@v3/app/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.page.html',
  styleUrls: ['./reviews.page.scss'],
})
export class ReviewsPage implements OnInit {
  assessmentId: number;
  submissionId: number;
  contextId: number;

  currentReview$ = new BehaviorSubject<any>({});
  reviews$ = this.reviewsService.reviews$;
  // reviews$ = this.assessmentService.review$;
  submission$ = this.assessmentService.submission$;

  currentAssessment: Assessment;
  loadingAssessment: boolean = true;


  currentReview: AssessmentReview = {
    id: 0,
    answers: {},
    status: '',
    modified: '',
  };
  doAssessment = false;

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
    private route: ActivatedRoute,
    private assessmentService: AssessmentService,
    private storage: BrowserStorageService,
    private reviewsService: ReviewListService,
  ) {
    this.currentAssessment = {
      id: 0,
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
    // this.reviews$.next(this.reviews);
  }

  get isMobile() {
    return this.utils.isMobile();
  }

  onEnter(): void {
    this.currentReview$.next({
      assessment: {
        name: '',
        type: '',
        description: '',
        isForTeam: false,
        dueDate: '',
        isOverdue: false,
        groups: [],
        pulseCheck: false,
      }
    });
    this.submissionId = +this.route.snapshot.paramMap.get('submissionId');
    this.loadingAssessment = false;
  }
}
