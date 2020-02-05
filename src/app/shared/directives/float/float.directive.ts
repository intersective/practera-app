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

  private float(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
    this.isDisplaying(this.el.nativeElement);
  }

  renderStyle(element): void {
    element.style = {
      border: '1px solid',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    };
  }

  getBoundaryRect(element) {
    const child = element.getBoundingClientRect();
    const el = this.el.nativeElement.getBoundingClientRect();
    element.style.transition = 'all 0.1s ease';

    if (el.top < (child.top - 10)) { // top
      this.renderStyle(element);
    } else {
      element.style.border = 'none';
      element.style.boxShadow = 'none';
    }

    if (el.bottom < (child.bottom + 10)) { // bottom
      element.style.border = 'none';
      element.style.boxShadow = 'none';
    }
  }

  // preliminary test to calculate appearance in screen
  private isDisplaying(element) {
    const cards = element.getElementsByTagName('ion-card');

    if (cards.length > 0) {
      this.utils.each(cards, card => {
        this.getBoundaryRect(card);
      });
    }
  }
}
