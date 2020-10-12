import { Component, OnInit, Input } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';
import { UtilsService } from '@services/utils.service';


@Component({
  selector: 'app-activity-card',
  templateUrl: './activity-card.component.html',
  styleUrls: ['./activity-card.component.scss']
})
export class ActivityCardComponent implements OnInit {
  @Input() loading: boolean;
  @Input() activity: {
    id: number;
    name: string;
    isLocked?: boolean;
    progress?: number;
    leadImage?: string;
    highlighted?: boolean;
  };
  backgroundImageStyle = '';
  // card image CDN
  cdn = 'https://cdn.filestackcontent.com/resize=fit:crop,width:';

  constructor ( @Inject(DOCUMENT) private document: Document, public utils: UtilsService ) {
  }

  ngOnInit() {
    this.backgroundImageStyle = '';
    if (this.activity.leadImage) {
      this.backgroundImageStyle = 'url(' + this.activity.leadImage + '), linear-gradient( rgba(0, 0, 0, .4), rgba(0, 0, 0, 0.2) )';
      this.activity.leadImage = this._getLeadImage();
    }
  }

  // loading pragram image to settings page by resizing it depend on device.
  // in mobile we are not showing card with image but in some mobile phones on landscape mode desktop view is loading.
  // because of that we load image also in mobile view.
  private _getLeadImage () {
      let imagewidth = 600;
      const imageId = this.activity.leadImage.split('/').pop();
      if (!this.utils.isMobile()) {
        imagewidth = 1024;
      }
      return `${this.cdn}${imagewidth}/${imageId}`;
    }
}

