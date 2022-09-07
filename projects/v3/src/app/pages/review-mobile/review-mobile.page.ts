import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Review, ReviewService } from '@v3/app/services/review.service';

@Component({
  selector: 'app-review-mobile',
  templateUrl: './review-mobile.page.html',
  styleUrls: ['./review-mobile.page.scss'],
})
export class ReviewMobilePage implements OnInit {
  reviews: Review[];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reviewService: ReviewService,
  ) { }

  ngOnInit(): void {
    this.reviewService.reviews$.subscribe(res => this.reviews = res);
    this.route.queryParams.subscribe(_params => {
      this.reviewService.getReviews();
    });
  }

  goto(review: Review) {
    this.router.navigate(['assessment-mobile', 'review', review.contextId, review.assessmentId, review.submissionId, { from: 'reviews' }]);
  }

}
