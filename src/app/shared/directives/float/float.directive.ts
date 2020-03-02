import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { UtilsService } from '@services/utils.service';

const PRACTERA_CARD_SHADOW = '0 4px 16px rgba(0,0,0,.12)';
const ACTIVITY_CARD_SHADOW = '-3px 3px 4px rgba(0, 0, 0, 0.21)';

@Directive({
  selector: '[appFloat]'
})
export class FloatDirective {
  @Input() isActivityCard = false;
  constructor(private el: ElementRef, private utils: UtilsService) { }

  @HostListener('mouseleave') onMouseLeave() {
    this.float(null);
  }

  @HostListener('wheel') onScroll() {
    this.float(null);
  }

  private float(color: string): void {
    this.el.nativeElement.style.backgroundColor = color;
    this.isDisplaying(this.el.nativeElement);
  }

  /**
   * @description preliminary test to calculate a DOM's appearance in screen
   * @param {HTML DOM} element targeted DOM
   */
  private isDisplaying(element): void {
    const cards = element.getElementsByTagName('ion-card');
    this.utils.each(cards, card => {
      this.getBoundaryRect(card);
    });
  }

  /**
   * @description get boundary information of an valid HTML DOM, and apply styles based on
   *              the returned boundary information
   * @param {HTML DOM} element targeted HTML DOM
   */
  getBoundaryRect(element): void {
    const child = element.getBoundingClientRect();
    const el = this.el.nativeElement.getBoundingClientRect();
    element.style.transition = 'all 0.1s ease';

    if (el.top > (child.top - 5)) { // top
      this.renderStyle(element, true);
    } else {
      this.renderStyle(element, false);
    }
  }

  /**
   * @description to apply boxShadow to targeted element (if isActivityCard == true, apply ACTIVITY_CARD_SHADOW instead of generic shadow)
   * @param {HTML DOM} element  targeted HTML DOM
   * @param {boolean} hideShadow true: hide shadow, false: show shadow
   */
  renderStyle(element, hideShadow: boolean): void {
    if (hideShadow && element.style.boxShadow !== 'none') {
      element.style.boxShadow = 'none';
      return;
    }

    if (!hideShadow && element.style.boxShadow === 'none') {
      element.style.boxShadow = this.isActivityCard ? ACTIVITY_CARD_SHADOW : PRACTERA_CARD_SHADOW;
      return;
    }
  }
}
