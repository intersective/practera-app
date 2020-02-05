import { Directive, ElementRef, HostListener } from '@angular/core';
import { UtilsService } from '@services/utils.service';

@Directive({
  selector: '[appFloat]'
})
export class FloatDirective {
  constructor(private el: ElementRef, private utils: UtilsService) { }

  @HostListener('mouseleave') onMouseLeave() {
    this.float(null);
  }

  @HostListener('wheel') onScroll() {
    this.float('yellow');
  }

  @HostListener('mousewheel') onMouseScroll() {
    console.log('~mousewheel~');
  }

  private float(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
    this.isDisplaying(this.el.nativeElement);
  }

  getBoundaryRect(element) {
    const child = element.getBoundingClientRect();
    const el = this.el.nativeElement.getBoundingClientRect();

    // const parent = element.parentElement.getBoundingClientRect();
    console.log(el, child);
    if (el.top < parent.top) {
      element.style.border = '1px solid';
    } else {
      element.style.border = 'none';
    }
  }

  // preliminary test to calculate appearance in screen
  private isDisplaying(element) {
    const cards = element.getElementsByTagName('ion-card');
    console.log(cards);

    if (cards.length > 0) {
      this.utils.each(cards, card => {
        this.getBoundaryRect(card);
      });
    }
  }
}
