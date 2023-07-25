import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-bottom-action-bar',
  templateUrl: 'bottom-action-bar.component.html',
  styleUrls: ['./bottom-action-bar.component.scss'],
})
export class BottomActionBarComponent {

  @Input() text: string;
  @Input() color: string = 'primary';
  @Input() disabled: boolean = false;
  @Output() handleClick = new EventEmitter();

  constructor() {}

  onClick(clickEvent: Event) {
    if (clickEvent.type === 'click' && this.disabled === false) {
      return this.handleClick.emit(clickEvent);
    }

    return;
  }
}

