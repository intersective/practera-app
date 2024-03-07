import { Component, EventEmitter, Input, Output } from '@angular/core';
interface CTABtnType {
  name: string;
  color: string;
}

@Component({
  selector: 'app-list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss']
})
export class ListItemComponent {
  @Input() loading?: boolean = false;
  @Input() lines? = '';
  @Input() leadingIcon: string;
  @Input() notificationIcon: string;
  @Input() leadingIconColor: string;
  @Input() leadingIconPulsing: boolean;
  @Input() leadImage: string;
  @Input() leadImageClass?: string;
  @Input() title: string;
  @Input() titleColor?: string;
  @Input() subtitle1?: string;
  @Input() subtitle1Color: string;
  @Input() subtitle2: string;
  @Input() subtitle2Color: string;
  @Input() callToActionBtn: CTABtnType;
  @Input() label: string;
  @Input() labelColor: string;
  @Input() endingText: string | number;
  @Input() endingTextColor: string;
  @Input() endingIcon: string;
  @Input() endingIconColor: string;
  @Input() endingProgress: number = undefined;
  // whether hightlight the background or not
  @Input() active: boolean;
  @Input() isEventItem: boolean;
  @Input() eventExpired: boolean;
  @Input() eventVideoConference: {
    provider: string;
  };
  @Input() eventFullyBooked: boolean;
  @Input() eventDayCount: string;
  @Input() redDot: boolean = false; // red dot on the top right corner (for notifications in home page)

  // used if there are ending action buttons
  @Input() endingActionBtnIcons: string[];
  // named as "any" to support any callback parameter format
  @Output() anyBtnClick = new EventEmitter<any>();
  @Output() actionBtnClick = new EventEmitter<number>();

  statusDescriptions(iconName): string {
    switch (iconName) {
      case 'lock-closed':
        return 'locked';
      case 'chevron-forward':
        return null;
      case 'checkmark-circle':
        return 'completed';
      default:
        return null;
    }
  }
}
