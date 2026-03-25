import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Review, ReviewService } from '@v3/app/services/review.service';
import { UtilsService } from '@v3/services/utils.service';

@Component({
  standalone: false,
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
    private utils: UtilsService,
  ) { }

  ngOnInit(): void {
    this.utils.setPageTitle('Reviews - Practera');
    this.reviewService.reviews$.subscribe(res => this.reviews = res);
    this.route.queryParams.subscribe(_params => {
      this.reviewService.getReviews();
    });
  }

  goto(review: Review) {
    this.router.navigate(['assessment-mobile', 'review', review.contextId, review.assessmentId, review.submissionId, { from: 'reviews' }]);
  }

}
