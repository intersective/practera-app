import { Component, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-description',
  templateUrl: 'description.component.html',
  styleUrls: ['./description.component.scss']
})
export class DescriptionComponent {
  heightLimit: number = 90;
  isTruncating: boolean = true;
  heightExceeded: boolean = false;
  @Input() content: string = '';
  @ViewChild('description') descriptionRef: ElementRef

  ngAfterViewInit() {
    setTimeout(() => {
      this.heightExceeded = this.descriptionRef.nativeElement.clientHeight >= this.heightLimit;
    }, 1500);
  }

}
