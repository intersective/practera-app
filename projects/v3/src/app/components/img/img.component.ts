import { Component, Input, isDevMode, OnChanges } from '@angular/core';
import { getData, getAllTags } from 'exif-js';

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

  ngOnChanges() {
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


  imageLoaded(e) {
    const imgElement = e.target;
    getData(imgElement, () => {
      const allMetaData = getAllTags(imgElement);
      const orientationClassFix = getImageClassToFixOrientation(allMetaData.Orientation);

      if (orientationClassFix) {
        imgElement.classList.add(orientationClassFix);
      }

      if (allMetaData.Orientation >= 5) {
        swapWidthAndHeight(imgElement);
      }
    });
  }
}
