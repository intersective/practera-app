import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { BrowserStorageService } from '@v3/services/storage.service';

@Component({
  selector: 'app-description',
  templateUrl: 'description.component.html',
  styleUrls: ['./description.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DescriptionComponent implements OnChanges, AfterViewInit {
  heightLimit = 145; // more accurately adjusted
  isTruncating: boolean;
  heightExceeded: boolean;
  elementHeight: number;
  hasBeenTruncated: boolean; // prevent onChange replace the collapsed content

  @Input() name: string; // unique identity of parent element
  @Input() content: SafeHtml;
  @Input() isInPopup: boolean;
  @Input() nonCollapsible?: boolean;
  @Input() ariaLabel?: string;
  @Output() hasExpanded? = new EventEmitter<boolean>();
  @ViewChild('description') descriptionRef: ElementRef;

  constructor(
    private storage: BrowserStorageService,
  ) {
    this.hasBeenTruncated = false;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.content && !changes.content.firstChange) {
      this.hasBeenTruncated = false;
      this.isTruncating = false;
      this.heightExceeded = false;
      this.calculateHeight();
    }
  }

  ngAfterViewInit() {
    this.calculateHeight();
  }

  calculateHeight(): void {
    if (this.nonCollapsible === true || !this.storage.getUser().truncateDescription) {
      return;
    }

    setTimeout(() => {
      if (this.descriptionRef?.nativeElement) {
        this.elementHeight = this.descriptionRef.nativeElement.clientHeight;
        this.heightExceeded = this.elementHeight >= this.heightLimit;

        if (this.heightExceeded && !this.hasBeenTruncated) {
          this.isTruncating = true;
          this.hasBeenTruncated = true;
        }
      }
    }, 300); // Reduced timeout
  }

  openShut(): void {
    this.isTruncating = !this.isTruncating;
    this.hasExpanded.emit(!this.isTruncating);
  }
}

