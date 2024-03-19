import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-bottom-action-bar',
  templateUrl: 'bottom-action-bar.component.html',
  styleUrls: ['./bottom-action-bar.component.scss'],
})
export class BottomActionBarComponent {
  @Input() showResubmit: boolean = false;
  @Input() text: string;
  @Input() color: string = 'primary';
  @Input() disabled$?: BehaviorSubject<boolean>; // assessment only
  @Output() handleClick = new EventEmitter();
  @Output() handleResubmit = new EventEmitter();
  @Input() buttonType: string = '';

  constructor() {}

  onClick(clickEvent: Event) {
    // if disabled, do nothing
    if (this.disabled$?.getValue() === true) {
      return;
    }

    // make sure it's the click event that triggers "handleClick"
    if (clickEvent.type === 'click') {
      return this.handleClick.emit(clickEvent);
    }

    return;
  }

  onResubmit(clickEvent: Event) {
    return this.handleResubmit.emit(clickEvent);
  }
}

