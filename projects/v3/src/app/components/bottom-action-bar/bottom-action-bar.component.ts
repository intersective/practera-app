import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-bottom-action-bar',
  templateUrl: 'bottom-action-bar.component.html',
  styleUrls: ['./bottom-action-bar.component.scss'],
})
export class BottomActionBarComponent implements OnChanges, OnDestroy {
  @Input() showResubmit: boolean = false;
  @Input() text: string;
  @Input() color: string = 'primary';
  @Input() disabled$?: BehaviorSubject<boolean>; // assessment only
  @Input() showLoadingOnClick: boolean = false;
  @Output() handleClick = new EventEmitter();
  @Output() handleResubmit = new EventEmitter();
  @Input() buttonType: string = '';
  @Input() hasCustomContent: boolean = false;

  loading = false;

  private disabledSubscription?: Subscription;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.disabled$) {
      return;
    }

    this.disabledSubscription?.unsubscribe();
    this.disabledSubscription = this.disabled$?.subscribe(disabled => {
      if (disabled === false) {
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.disabledSubscription?.unsubscribe();
  }

  onClick(clickEvent: Event) {
    // if disabled or already processing, do nothing
    if (this.disabled$?.getValue() === true || this.loading) {
      return;
    }

    // make sure it's the click event that triggers "handleClick"
    if (clickEvent.type === 'click') {
      if (this.showLoadingOnClick) {
        this.loading = true;
      }
      return this.handleClick.emit(clickEvent);
    }

    return;
  }

  onResubmit(clickEvent: Event) {
    return this.handleResubmit.emit(clickEvent);
  }
}
