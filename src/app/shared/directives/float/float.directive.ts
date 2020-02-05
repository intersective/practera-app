import { Directive, ElementRef, HostListener } from '@angular/core';
import { UtilsService } from '@services/utils.service';

const ION_DEFAULT_CARD_SHADOW = '0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12)';

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

  renderStyle(element, options = {
    activate: true
  }): void {
    if (options.activate === true) {
      element.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    } else {
      element.style.boxShadow = ION_DEFAULT_CARD_SHADOW;
    }
  }

  getBoundaryRect(element) {
    const child = element.getBoundingClientRect();
    const el = this.el.nativeElement.getBoundingClientRect();
    element.style.transition = 'all 0.1s ease';

    if (el.top < (child.top - 5)) { // top
      this.renderStyle(element);
    } else {
      this.renderStyle(element, { activate: false});
    }

    if (el.bottom < (child.bottom + 5)) { // bottom
      this.renderStyle(element, { activate: false});
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
