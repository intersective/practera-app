import { Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit, Renderer2, SimpleChanges } from '@angular/core';
import { BrowserStorageService } from '@v3/app/services/storage.service';

@Directive({
  standalone: false,
  selector: '[appBackgroundImage]'
})
export class BackgroundImageDirective implements OnInit, OnChanges, OnDestroy {
  @Input() appBackgroundImage: string;
  /**
   * Optional CSS gradient / color string (e.g. `linear-gradient(135deg, #14b8a6, #0f766e)`) to
   * use when the primary image URL fails to load.  When provided this takes priority over the
   * legacy activityCardImage / programImage fallbacks.
   */
  @Input() appBackgroundImageFallback: string | null = null;
  private img = new Image();

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private storageService: BrowserStorageService,
  ) { }

  ngOnInit() {
    this._load(this.appBackgroundImage);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['appBackgroundImage'] && !changes['appBackgroundImage'].firstChange) {
      this._load(this.appBackgroundImage);
    }
  }

  private _load(src: string) {
    this.img.onload = null;
    this.img.onerror = null;

    if (!src) {
      this._applyFallback();
      return;
    }

    this.img.src = src;

    this.img.onload = () => {
      this.renderer.setStyle(this.el.nativeElement, 'backgroundImage', `url(${src})`);
    };

    this.img.onerror = () => {
      this._applyFallback();
    };
  }

  private _applyFallback() {
    if (this.appBackgroundImageFallback) {
      // Caller supplied a gradient — use it directly as backgroundImage
      this.renderer.setStyle(this.el.nativeElement, 'backgroundImage', this.appBackgroundImageFallback);
      return;
    }
    // Legacy fallback: try programme-level images from storage
    const activityCardImage = this.storageService.getUser().activityCardImage;
    const programImage = this.storageService.getUser().programImage;
    const fallbackUrl = activityCardImage || programImage;
    if (fallbackUrl) {
      this.renderer.setStyle(this.el.nativeElement, 'backgroundImage', `url(${fallbackUrl})`);
    }
  }

  ngOnDestroy() {
    this.img.onload = null;
    this.img.onerror = null;
  }
}
