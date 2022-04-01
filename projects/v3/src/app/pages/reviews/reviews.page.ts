import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AssessmentService, AssessmentReview } from '@v3/app/services/assessment.service';
import { ReviewListService } from '@v3/app/services/review-list.service';
import { BrowserStorageService } from '@v3/app/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.page.html',
  styleUrls: ['./reviews.page.scss'],
})
export class ReviewsPage {
  assessmentId: number;
  submissionId: number;
  contextId: number;

  currentReview$ = this.assessmentService.review$;
  reviews$ = this.reviewsService.reviews$;
  submission$ = this.assessmentService.submission$;

  currentAssessment$ = this.assessmentService.assessment$;
  loadingAssessment: boolean = true;


  currentReview: AssessmentReview = {
    id: 0,
    answers: {},
    status: '',
    modified: '',
  };
  doAssessment = false;

  constructor(
    readonly utils: UtilsService,
    private route: ActivatedRoute,
    private assessmentService: AssessmentService,
    private storage: BrowserStorageService,
    private reviewsService: ReviewListService,
  ) {
    /* this.currentAssessment = {
      id: 0,
      name: '',
      type: '',
      description: '',
      isForTeam: false,
      dueDate: '',
      isOverdue: false,
      groups: [],
      pulseCheck: false,
    }; */

    this.route.queryParams.subscribe(params => {
      console.log('ReviewsPageParams::', params);
      // this.submissionId = params.submissionId;
      this.onEnter();
    });
  }

  get isMobile() {
    return this.utils.isMobile();
  }

  onEnter(): void {
    this.reviewsService.getReviews();
    this.loadingAssessment = false;
  }

  goto(currentReview) {
    console.log('currentReview::', currentReview);
    this.assessmentService.getAssessment(11150, 'review', 1, 1);
  }
}
