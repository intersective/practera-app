import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-bottom-action-bar',
  templateUrl: 'bottom-action-bar.component.html',
  styleUrls: ['./bottom-action-bar.component.scss'],
})
export class BottomActionBarComponent {

  @Input() text: string;
  @Input() color: string = 'primary';
  @Input() disabled: boolean;
  @Output() handleClick = new EventEmitter();
  @Input() buttonType: string = '';

  constructor() {}
}

