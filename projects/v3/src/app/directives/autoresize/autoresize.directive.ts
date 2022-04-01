import { Directive, ElementRef, Input, HostListener, OnInit } from '@angular/core';

@Directive({
  selector: '[appAutoresize]'
})
export class AutoresizeDirective implements OnInit {

  // tslint:disable-next-line:no-input-rename
  @Input('appAutoresize') maxHeight;

  @HostListener('input', ['$event.target'])
  onInput(textArea: HTMLTextAreaElement): void {
    this.adjust();
  }

  constructor(public element: ElementRef) { }

  ngOnInit(): void {
    this.adjust();
  }

  /**
   * in this method we resize textarea releted to text in side it.
   * when user type on textarea it will expand untill scroll height lower than max height.
   *  if scroll height biger than max height textare will not expand and it will scroll content.
   * - select textare.
   * - set 'aoto' to height and overflow properties.
   * - check min value from scrollheight and maxheight and get it as the newheight.
   * - set that new height to textarea height.
   */
  adjust(): void {
    const ta = this.element.nativeElement.querySelector('textarea');
    let newHeight;
    if (ta) {
      ta.style.overflow = 'auto';
      ta.style.height = 'auto';
      if (this.maxHeight) {
        this.maxHeight = Number(this.maxHeight);
        newHeight = Math.min(ta.scrollHeight, this.maxHeight);
      } else {
        newHeight = ta.scrollHeight;
      }
      ta.style.height = newHeight + 'px';
    }
  }

}
