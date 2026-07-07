import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { Review } from '@v3/app/services/review.service';
import { SegmentChangeEventDetail, SegmentValue } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.scss'],
})
export class ReviewListComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() reviews: Review[];
  @Input() currentReview: Review;
  @Input() goToFirstOnSwitch: boolean;
  @Output() navigate = new EventEmitter();
  @ViewChildren('reviewItem', { read: ElementRef }) reviewItems: QueryList<ElementRef<HTMLElement>>;
  public showDone = false;
  public searchTerm = '';
  public filteredReviews: Review[] = [];
  public segmentValue: 'pending' | 'completed' = 'pending';
  public resultsAnnouncement = '';
  private readonly idSuffix = Math.random().toString(36).slice(2, 9);
  readonly listLabelId = `review-list-heading-${this.idSuffix}`;
  readonly listId = `review-listbox-${this.idSuffix}`;
  readonly searchLabelId = `review-search-label-${this.idSuffix}`;
  readonly searchHintId = `review-search-hint-${this.idSuffix}`;
  private focusPending = false;

  ngOnInit() {
    this.showDone = false;
    this.applyFilters();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentReview'] && this.currentReview) {
      this.setSegmentByCurrentReview();
      this.focusPending = true;
    }

    if (changes['reviews'] || changes['currentReview']) {
      this.applyFilters();
    }
  }

  ngAfterViewInit() {
    this.reviewItems.changes.subscribe(() => {
      this.tryFocusActiveReview();
    });
    this.tryFocusActiveReview();
  }

  // go to the review
  goto(review: Review, keyboardEvent?: Event) {
    if (keyboardEvent instanceof KeyboardEvent) {
      if (keyboardEvent.code === 'Space' || keyboardEvent.code === 'Enter') {
        keyboardEvent.preventDefault();
      } else {
        return;
      }
    }

    this.navigate.emit(review);
  }

  switchStatus(event?: CustomEvent<SegmentChangeEventDetail>) {
    if (!event) {
      return;
    }

    const value = this.parseSegmentValue(event.detail?.value);

    const segment: 'pending' | 'completed' = value === 'completed' ? 'completed' : 'pending';
    this.segmentValue = segment;
    this.showDone = segment === 'completed';
    this.applyFilters();
    this.focusPending = true;

    const nextReview = this.filteredReviews[0];
    if (this.goToFirstOnSwitch) {
      if (nextReview) {
        this.navigate.emit(nextReview);
      }
      return;
    }

    if (this.currentReview && this.currentReview.isDone !== this.showDone && nextReview) {
      this.navigate.emit(nextReview);
    }
  }

  // return the message if there is no review to display
  get noReviews(): string {
    if (this.reviews === null) {
      return '';
    }
    if (this.searchTerm && this.filteredReviews.length === 0) {
      return '';
    }
    if (this.filteredReviews.length > 0) {
      return '';
    }
    return this.showDone ? $localize`completed` : $localize`pending`;
  }

  get hasSearchWithoutResults(): boolean {
    return !!this.searchTerm && Array.isArray(this.reviews) && this.filteredReviews.length === 0;
  }

  onSearchTermChange(value: string) {
    this.searchTerm = (value || '').trim();
    this.applyFilters();
  }

  trackBySubmission(_: number, review: Review) {
    return review?.submissionId;
  }

  private setSegmentByCurrentReview() {
    if (!this.currentReview) {
      return;
    }
    this.segmentValue = this.currentReview.isDone ? 'completed' : 'pending';
    this.showDone = this.currentReview.isDone === true;
  }

  private applyFilters() {
    if (!this.reviews) {
      this.filteredReviews = [];
      this.updateResultsAnnouncement();
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredReviews = this.reviews.filter(review => {
      if (!review) {
        return false;
      }
      const matchesStatus = review.isDone === this.showDone;
      if (!matchesStatus) {
        return false;
      }
      if (!term) {
        return true;
      }
      return (review.name || '').toLowerCase().includes(term);
    });
    this.updateResultsAnnouncement();
  }

  private parseSegmentValue(value: SegmentValue): string {
    return typeof value === 'string' ? value : 'pending';
  }

  private tryFocusActiveReview() {
    if (!this.focusPending || !this.currentReview || !this.reviewItems) {
      return;
    }

    const index = this.filteredReviews.findIndex(review => {
      return review?.submissionId === this.currentReview?.submissionId;
    });

    if (index === -1) {
      this.focusPending = false;
      return;
    }

    const items = this.reviewItems.toArray();
    const element = items[index]?.nativeElement;

    if (!element) {
      this.focusPending = false;
      return;
    }

    setTimeout(() => {
      if (typeof element.scrollIntoView === 'function') {
        element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
      if (typeof element.focus === 'function') {
        element.focus();
      }
      this.focusPending = false;
    });
  }

  private updateResultsAnnouncement() {
    if (!Array.isArray(this.reviews)) {
      this.resultsAnnouncement = '';
      return;
    }

    const statusLabel = this.showDone ? $localize`completed` : $localize`pending`;
    const count = this.filteredReviews.length;

    if (count === 0) {
      this.resultsAnnouncement = this.searchTerm
        ? $localize`No ${statusLabel} reviews match your search.`
        : $localize`No ${statusLabel} reviews available.`;
      return;
    }

    if (count === 1) {
      this.resultsAnnouncement = $localize`1 ${statusLabel} review available.`;
      return;
    }

    this.resultsAnnouncement = $localize`${count} ${statusLabel} reviews available.`;
  }
}
