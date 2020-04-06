import { Component, Input } from '@angular/core';
import * as exif from 'exif-js';

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
export class ImgComponent {

  @Input() imgSrc: any;

  imageLoaded(e) {
    exif.getData(e.target, function () {
      const allMetaData = exif.getAllTags(this);
      const orientationClassFix = getImageClassToFixOrientation(allMetaData.Orientation);
      this.classList.add(orientationClassFix);
      if (allMetaData.Orientation >= 5) {
        swapWidthAndHeight(this);
      }
    });
  }
}
