import { Directive, ElementRef, Input, HostListener, OnInit } from '@angular/core';

@Directive({
  selector: '[appAutoresize]'
})
export class AutoresizeDirective implements OnInit {

  // tslint:disable-next-line:no-input-rename
  @Input('autoresize') maxHeight: number;

  @HostListener('input', ['$event.target'])
  onInput(textArea: HTMLTextAreaElement): void {
    console.log('HostListener');
    this.adjust();
  }

  constructor(public element: ElementRef) { }

  ngOnInit(): void {
    this.adjust();
  }

  adjust(): void {
    console.log('adjust');
    const ta = this.element.nativeElement.querySelector('textarea');
    let newHeight;
    if (ta) {
      ta.style.overflow = 'hidden';
      ta.style.height = 'auto';
      if (this.maxHeight) {
      console.log('this.maxHeight', this.maxHeight);
      newHeight = Math.min(ta.scrollHeight, this.maxHeight);
      console.log('newHeight', newHeight);
      } else {
        newHeight = ta.scrollHeight;
      }
      ta.style.height = newHeight + 'px';
    }
  }

}
