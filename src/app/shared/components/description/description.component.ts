import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChange } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
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
export class DescriptionComponent implements AfterViewInit, OnChanges {
  heightLimit = 90;
  isTruncating = true;
  heightExceeded = false;
  elementHeight: number;
  @Input() content;
  @ViewChild('description') descriptionRef: ElementRef;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: { [propKey: string]: SimpleChange}) {
    this.content = this.sanitizer.bypassSecurityTrustHtml(changes.content.currentValue);
  }

  ngAfterViewInit() {
    // if it is used in modal window, the clientHeight is 0 here, so we delayed 500 ms to check it
    setTimeout(
      () => {
        this.elementHeight = this.descriptionRef.nativeElement.clientHeight;
        this.heightExceeded = this.elementHeight >= this.heightLimit;
      },
      500
    );
  }

}
