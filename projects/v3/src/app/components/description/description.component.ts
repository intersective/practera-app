import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChange, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { BrowserStorageService } from '@v3/services/storage.service';

@Component({
  selector: 'app-description',
  templateUrl: 'description.component.html',
  styleUrls: ['./description.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  /*animations: [
    trigger('truncation', [
      state('show', style({
        'max-height': '1000px !important',
      })),
      state('hide', style({
        'max-height': '90px !important',
      })),
      transition('* <=> *', [
        animate('0.5s ease-in-out')
      ])
    ]),
  ]*/
})
export class DescriptionComponent implements OnChanges {
  heightLimit = 145; // more accurately adjusted
  isTruncating: boolean;
  heightExceeded: boolean;
  elementHeight: number;
  hasBeenTruncated: boolean; // prevent onChange replace the collapsed content

  @Input() name; // unique identity of parent element
  @Input() content;
  @Input() isInPopup;
  @Input() nonCollapsible?: boolean;
  @Output() hasExpanded? = new EventEmitter();
  @ViewChild('description') descriptionRef: ElementRef;

  constructor(
    private storage: BrowserStorageService,
  ) {
    this.hasBeenTruncated = false;
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange}) {
        // reset to default
    if (this.hasBeenTruncated === false) {
      this.isTruncating = false;
      this.heightExceeded = false;
    }

    this.content = changes.content.currentValue;
    this.calculateHeight();
  }

  calculateHeight(): void {
    if (this.nonCollapsible === true) {
      return;
    }

    if (!this.storage.getUser().truncateDescription) {
      return;
    }
    setTimeout(
      () => {
        this.elementHeight = this.descriptionRef.nativeElement.clientHeight;
        this.heightExceeded = this.elementHeight >= this.heightLimit;

        if (this.heightExceeded) {
          this.isTruncating = true;
          this.hasBeenTruncated = true;
        }
              },
      700
    );
  }

  openShut(): void {
    this.isTruncating = !this.isTruncating;
    this.hasExpanded.emit(!this.isTruncating);
    return;
  }
}

