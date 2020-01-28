import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { UtilsService } from '@services/utils.service';
import { RouterEnter } from '@services/router-enter.service';
import { BrowserStorageService } from '@services/storage.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent extends RouterEnter {
  routeUrl = '/app/reviews';
  assessmentId: number;
  submissionId: number;
  contextId: number;
  @ViewChild('reviewList') reviewList;
  @ViewChild('assessment') assessment;
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    public storage: BrowserStorageService,
    public utils: UtilsService
  ) {
    super(router);
  }

  onEnter() {
    this.submissionId = +this.route.snapshot.paramMap.get('submissionId');
    // trigger onEnter after the element get generated
    setTimeout(() => {
      this.reviewList.onEnter();
    });
  }

  // display the review content in the right pane, and highlight on the left pane
  goto(event) {
    if (!event) {
      this.submissionId = null;
      return ;
    }
    this.assessmentId = +event.assessmentId;
    this.submissionId = +event.submissionId;
    this.contextId = +event.contextId;
    // trigger onEnter after the element get generated
    setTimeout(() => {
      this.assessment.onEnter();
    });
  }

}
