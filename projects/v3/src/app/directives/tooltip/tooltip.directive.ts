import { Directive, ElementRef, HostListener, Input, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  standalone: false,
  selector: '[appTooltip]'
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') tooltipText: string;
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
  @Input() tooltipClass = '';

  private tooltip: HTMLElement | null = null;
  private arrow: HTMLElement | null = null;
  private hasBeenShown = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter') onMouseEnter(): void {
    this.show();
  }

  @HostListener('mouseleave') onMouseLeave(): void {
    this.hide();
  }

  @HostListener('focus') onFocus(): void {
    this.show();
  }

  @HostListener('blur') onBlur(): void {
    this.hide();
  }

  private show(): void {
    if (this.tooltip || !this.tooltipText) {
      return;
    }

    this.tooltip = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltip, 'app-tooltip');
    if (this.tooltipClass) {
      this.tooltipClass.split(' ').forEach(cls => {
        if (cls) {
          this.renderer.addClass(this.tooltip, cls);
        }
      });
    }
    this.renderer.setProperty(this.tooltip, 'innerHTML', this.tooltipText);

    this.arrow = this.renderer.createElement('div');
    this.renderer.addClass(this.arrow, 'app-tooltip-arrow');

    // append to body (not to component)
    this.renderer.appendChild(this.tooltip, this.arrow);
    this.renderer.appendChild(document.body, this.tooltip);

    // position after a slight delay to ensure proper rendering
    setTimeout(() => {
      this.setPosition();
      this.renderer.addClass(this.tooltip, 'app-tooltip-visible');
      this.hasBeenShown = true;
    }, 20);
  }

  private hide(): void {
    if (!this.tooltip) {
      return;
    }

    this.renderer.removeClass(this.tooltip, 'app-tooltip-visible');

    // remove after transition completes
    setTimeout(() => {
      if (this.tooltip && this.tooltip.parentNode) {
        this.renderer.removeChild(document.body, this.tooltip);
        this.tooltip = null;
        this.arrow = null;
      }
    }, 300);
  }

  private setPosition(): void {
    if (!this.tooltip) {
      return;
    }

    const hostRect = this.el.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (this.position) {
      case 'top':
        top = hostRect.top - tooltipRect.height - 10;
        left = hostRect.left + (hostRect.width / 2) - (tooltipRect.width / 2);
        this.renderer.addClass(this.arrow, 'app-tooltip-arrow-bottom');
        break;
      case 'bottom':
        top = hostRect.bottom + 10;
        left = hostRect.left + (hostRect.width / 2) - (tooltipRect.width / 2);
        this.renderer.addClass(this.arrow, 'app-tooltip-arrow-top');
        break;
      case 'left':
        top = hostRect.top + (hostRect.height / 2) - (tooltipRect.height / 2);
        left = hostRect.left - tooltipRect.width - 10;
        this.renderer.addClass(this.arrow, 'app-tooltip-arrow-right');
        break;
      case 'right':
        top = hostRect.top + (hostRect.height / 2) - (tooltipRect.height / 2);
        left = hostRect.right + 10;
        this.renderer.addClass(this.arrow, 'app-tooltip-arrow-left');
        break;
    }

    // ensure tooltip is within viewport
    if (top < 0) {
      top = hostRect.bottom + 10;
      this.renderer.removeClass(this.arrow, 'app-tooltip-arrow-bottom');
      this.renderer.addClass(this.arrow, 'app-tooltip-arrow-top');
    }

    if (left < 0) {
      left = 10;
    }

    if (left + tooltipRect.width > window.innerWidth) {
      left = window.innerWidth - tooltipRect.width - 10;
    }

    // set arrow position based on host element
    const arrowLeft = hostRect.left - left + (hostRect.width / 2) - 6;
    this.renderer.setStyle(this.arrow, 'left', `${arrowLeft}px`);

    // set tooltip position dynamically
    this.renderer.setStyle(this.tooltip, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltip, 'left', `${left}px`);
  }

  ngOnDestroy(): void {
    if (this.tooltip && this.tooltip.parentNode) {
      this.renderer.removeChild(document.body, this.tooltip);
    }
  }
}
