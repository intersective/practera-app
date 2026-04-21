import { Component, Input, isDevMode, SimpleChanges, OnChanges } from '@angular/core';
import { parse } from 'exifr';

const getImageClassToFixOrientation = (orientation) => {
  switch (orientation) {
    case 2:
      return ('flip');
    case 3:
      return ('rotate-180');
    case 4:
      return ('flip-and-rotate-180');
    case 5:
      return ('flip-and-rotate-270');
    case 6:
      return ('rotate-90');
    case 7:
      return ('flip-and-rotate-90');
    case 8:
      return ('rotate-270');
  }
};

const swapWidthAndHeight = img => {
  const currentHeight = img.height;
  const currentWidth = img.width;
  img.height = currentWidth;
  img.width = currentHeight;
};

@Component({
  standalone: false,
  selector: 'app-img',
  templateUrl: './img.component.html',
  styleUrls: ['./img.component.scss']
})
export class ImgComponent implements OnChanges {
  @Input() alt: string;
  @Input() imgSrc: string;
  proxiedImgSrc: string;

  constructor() {
    if (!this.alt) {
      this.alt = '';
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // In development mode, replace the Practera file URL with a proxied URL to avoid CORS issues.
    const hostname = window.location.hostname;
    const isLocalhost = /(^localhost$)|(^127\.)|(^::1$)/.test(hostname);

    if (
      isDevMode() &&
      isLocalhost &&
      this.imgSrc?.startsWith('https://file.practera.com')
    ) {
      this.proxiedImgSrc = this.imgSrc.replace(
        /^https?:\/\/file\.practera\.com(\/.*)/,
        '/practera-proxy$1'
      );
    }
  }


  async imageLoaded(e: Event) {
    const imgElement = e.target as HTMLImageElement;
    try {
      const metadata = await parse(imgElement.src, { pick: ['Orientation'] });
      if (!metadata?.Orientation) return;

      const orientationClassFix = getImageClassToFixOrientation(metadata.Orientation);
      if (orientationClassFix) {
        imgElement.classList.add(orientationClassFix);
      }
      if (metadata.Orientation >= 5) {
        swapWidthAndHeight(imgElement);
      }
    } catch {
      // EXIF parsing not available for this image (missing EXIF data or CORS restriction)
    }
  }
}
