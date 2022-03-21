import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UtilsService } from '@v3/services/utils.service';

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
  @ViewChild('reviewList') reviewList;
  @ViewChild('assessment') assessment;
  constructor(
    readonly utils: UtilsService,
    public router: Router,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.onEnter();
  }

  get isMobile() {
    return this.utils.isMobile();
  }

  onEnter(): void {
    this.submissionId = +this.route.snapshot.paramMap.get('submissionId');
    // trigger onEnter after the element get generated
    /* setTimeout(() => {
      this.reviewList.onEnter();
    }); */
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

}
