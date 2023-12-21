import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { BrowserStorageService } from '@v3/app/services/storage.service';

@Directive({
  selector: '[appBackgroundImage]'
})
export class BackgroundImageDirective implements OnInit, OnDestroy {
  @Input() appBackgroundImage: string;
  private img = new Image();

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private storageService: BrowserStorageService,
  ) { }

  ngOnInit() {
    this.img.src = this.appBackgroundImage;

    this.img.onload = () => {
      this.renderer.setStyle(this.el.nativeElement, 'backgroundImage', `url(${this.appBackgroundImage})`);
    };

    this.img.onerror = () => {
      const programImage = this.storageService.getUser().programImage;
      this.renderer.setStyle(this.el.nativeElement, 'backgroundImage', `url(${programImage})`);
    };
  }

  ngOnDestroy() {
    this.img.onload = null;
    this.img.onerror = null;
  }
}
