import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appFallbackImage]'
})
export class FallbackImageDirective {
  @Input() appFallbackImage: string; // fallback image URL

  constructor(private el: ElementRef) { }

  // Listen for the error event on the element
  @HostListener('error') onError() {
    const element: HTMLImageElement = this.el.nativeElement;
    element.src = this.appFallbackImage;
  }
}
