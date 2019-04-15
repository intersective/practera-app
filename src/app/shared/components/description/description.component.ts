import { Component, Input, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import { trigger, state, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-description',
  templateUrl: 'description.component.html',
  styleUrls: ['./description.component.scss'],
  animations: [
    trigger('truncation', [
      state('show', style({
        'max-height': '1000px',
        'overflow-y': 'scroll',
      })),
      state('hide', style({
        'max-height': '90px',
        'overflow-y': 'hidden',
      })),
      transition('* <=> *', [
        animate('0.5s ease-out')
      ])
    ]),
  ]
})
export class DescriptionComponent implements AfterViewInit {
  heightLimit = 90;
  isTruncating = true;
  heightExceeded = false;
  elementHeight: number;
  @Input() content = '';
  @ViewChild('description') descriptionRef: ElementRef;

  ngAfterViewInit() {
    this.elementHeight = this.descriptionRef.nativeElement.clientHeight;
    setTimeout(() => {
      this.heightExceeded = this.elementHeight >= this.heightLimit;
    });
  }

}
