import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task } from '@v3/app/services/activity.service';

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
  @Input() task?: Task;
  @Input() endingText: string | number;
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

}
