import { Component, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-description',
  templateUrl: 'description.component.html',
  styleUrls: ['./description.component.scss']
})
export class DescriptionComponent {
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
