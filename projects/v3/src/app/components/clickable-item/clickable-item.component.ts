import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-clickable-item',
  templateUrl: './clickable-item.component.html',
  styleUrls: ['./clickable-item.component.scss']
})
export class ClickableItemComponent {
  @Input() lines;
  @Input() backgroundColor;
  @Input() isSwitcherCard?;
  @Input() active;
  @Input() isCustomizedCard?;
  @Input() isChatCard?;
  @Input() isTodoCard?;
  @Input() isEventItem: boolean;
  constructor() {}
}
