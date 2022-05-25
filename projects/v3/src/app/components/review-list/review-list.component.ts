import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AssessmentReview } from '@v3/app/services/assessment.service';
import { Review } from '@v3/app/services/review.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';

const STATUSES = {
  pending: false,
  completed: true,
};

@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.scss'],
})
export class ReviewListComponent implements OnInit, OnChanges {
  @Input() reviews: Review[];
  @Input() currentReview: Review;
  @Input() goToFirstOnSwitch: boolean;
  @Output() navigate = new EventEmitter();
  public showDone: boolean;
  public selectedGroup;
  public filteredReviews: Review[];

  constructor(
    public router: Router,
    public utils: UtilsService,
    public storage: BrowserStorageService,
  ) { }

  ngOnInit() {
    // this.showDone = false;
    this.filteredReviews = this.reviews;
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('currentReview::', this.currentReview);
    if (this.currentReview?.isDone === true) {
      this.selectedGroup = 'completed';
    }
    this.switchStatus();
  }

  // go to the review
  goto(review: Review) {
    this.navigate.emit(review);
  }

  switchStatus(event?) {
    if (event) {
      this.showDone = STATUSES[event.currentTarget?.value];
    }

    if (this.goToFirstOnSwitch) {
      this.showDone = false; // default for first visit
      this.filteredReviews = this.reviews.filter(review => {
        return review.isDone === this.showDone;
      });
    }

    if (this.showDone != undefined) {
      this.filteredReviews = this.reviews.filter(review => {
        return review.isDone === this.showDone;
      });
    }

    if (this.utils.isEmpty(this.filteredReviews)) {
      this.filteredReviews = this.reviews;
    }

    this.navigate.emit(this.filteredReviews);
  }

  // return the message if there is no review to display
  get noReviews() {
    if (this.reviews === null) {
      return '';
    }
    const filteredReviews = (this.reviews || []).filter(review => {
      return review.isDone === this.showDone;
    });
    if (filteredReviews) {
      return '';
    }
    return this.showDone ? 'completed' : 'pending';
  }
}
