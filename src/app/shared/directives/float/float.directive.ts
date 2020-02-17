import { Directive, ElementRef, HostListener } from '@angular/core';
import { UtilsService } from '@services/utils.service';

const PRACTERA_CARD_SHADOW = '0 4px 16px rgba(0,0,0,.12)';

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

  // preliminary test to calculate appearance in screen
  private isDisplaying(element) {
    const cards = element.getElementsByTagName('ion-card');
    this.utils.each(cards, card => {
      this.getBoundaryRect(card);
    });
  }

  getBoundaryRect(element) {
    const child = element.getBoundingClientRect();
    const el = this.el.nativeElement.getBoundingClientRect();
    element.style.transition = 'all 0.1s ease';

    if (el.top > (child.top - 5)) { // top
      this.renderStyle(element, true);
    } else {
      this.renderStyle(element, false);
    }
  }

  renderStyle(element, hideShadow): void {
    if (hideShadow && element.style.boxShadow !== 'none') {
      element.style.boxShadow = 'none';
      return;
    }
    if (!hideShadow && element.style.boxShadow === 'none') {
      element.style.boxShadow = PRACTERA_CARD_SHADOW;
      return;
    }
  }
}
