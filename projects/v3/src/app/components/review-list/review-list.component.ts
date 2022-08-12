import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Review } from '@v3/app/services/review.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';

@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.scss'],
})
export class ReviewListComponent implements OnInit {
  @Input() reviews: Review[];
  @Input() currentReview: Review;
  @Input() goToFirstOnSwitch: boolean;
  @Output() navigate = new EventEmitter();
  public showDone = false;

  constructor(
    public router: Router,
    public utils: UtilsService,
    public storage: BrowserStorageService,
  ) { }

  ngOnInit() {
    this.showDone = false;
  }

  // go to the review
  goto(review: Review, keyboardEvent?: KeyboardEvent) {
    if (keyboardEvent && (keyboardEvent?.code === 'Space' || keyboardEvent?.code === 'Enter')) {
      keyboardEvent.preventDefault();
    } else if (keyboardEvent) {
      return;
    }

    this.navigate.emit(review);
  }

  switchStatus() {
    this.showDone = !this.showDone;
    if (this.goToFirstOnSwitch) {
      this.navigate.emit(this.reviews.find(review => {
        return review.isDone === this.showDone;
      }));
    }
  }

  // return the message if there is no review to display
  get noReviews() {
    if (this.reviews === null) {
      return '';
    }
    const review = this.reviews.find(review => {
      return review.isDone === this.showDone;
    });
    if (review) {
      return '';
    }
    return this.showDone ? 'completed' : 'pending';
  }
}
