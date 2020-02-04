import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appFloat]'
})
export class FloatDirective {
  constructor(private el: ElementRef) { }

  @HostListener('mouseenter') onMouseEnter() {
    this.float('yellow');
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.float(null);
  }

  private float(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
    this.isDisplaying(this.el.nativeElement);
  }

  // preliminary test to calculate appearance in screen
  private isDisplaying(element) {
    const el = element.getBoundingClientRect();
    const parent = element.parentElement.getBoundingClientRect();
    console.log(el, parent);
  }
}
