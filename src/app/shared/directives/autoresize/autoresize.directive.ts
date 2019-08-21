import { Directive, ElementRef, Input, HostListener, OnInit } from '@angular/core';

@Directive({
  selector: '[appAutoresize]'
})
export class AutoresizeDirective implements OnInit {

  // tslint:disable-next-line:no-input-rename
  @Input('appAutoresize') maxHeight: number;

  @HostListener('input', ['$event.target'])
  onInput(textArea: HTMLTextAreaElement): void {
    this.adjust();
  }

  constructor(public element: ElementRef) { }

  ngOnInit(): void {
    this.adjust();
  }

  adjust(): void {
    const ta = this.element.nativeElement.querySelector('textarea');
    let newHeight;
    if (ta) {
      ta.style.overflow = 'auto';
      ta.style.height = 'auto';
      if (this.maxHeight) {
      newHeight = Math.min(ta.scrollHeight, this.maxHeight);
      } else {
        newHeight = ta.scrollHeight;
      }
      ta.style.height = newHeight + 'px';
    }
  }

}
