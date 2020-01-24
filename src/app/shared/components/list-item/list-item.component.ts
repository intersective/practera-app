import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss']
})
export class ListItemComponent {
  @Input() loading: boolean;
  @Input() lines = '';
  @Input() leadingIcon: string;
  @Input() title: string;
  @Input() subtitle1: string;
  @Input() subtitle2: string;
  @Input() endingText: string;
  @Input() endingIcon: string;
  @Input() endingIconColor: string;
  // whether hightlight the background or not
  @Input() active: boolean;
}
