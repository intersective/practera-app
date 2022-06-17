import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss']
})
export class ListItemComponent {
  @Input() loading: boolean;
  @Input() lines = '';
  @Input() leadingIcon: string;
  @Input() leadingIconColor: string;
  @Input() leadingIconPulsing: boolean;
  @Input() leadImage: string;
  @Input() title: string;
  @Input() titleColor: string;
  @Input() subtitle1: string;
  @Input() subtitle1Color: string;
  @Input() subtitle2: string;
  @Input() subtitle2Color: string;
  @Input() label: string;
  @Input() labelColor: string;
  @Input() endingText: string | number;
  @Input() endingTextColor: string;
  @Input() endingIcon: string;
  @Input() endingIconColor: string;
  @Input() endingProgress: number;
  // whether hightlight the background or not
  @Input() active: boolean;
  @Input() isEventItem: boolean;
  @Input() eventExpired: boolean;
  @Input() eventVideoConference: {
    provider: string;
  };
  @Input() eventFullyBooked: boolean;
  @Input() eventDayCount: string;

  // used if there are ending action buttons
  @Input() endingActionBtnIcons: string[];
  @Output() actionBtnClick = new EventEmitter<number>();
}
