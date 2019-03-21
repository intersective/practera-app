import { Component, OnInit, Input } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';


@Component({
  selector: 'app-path-card',
  templateUrl: './path-card.component.html',
  styleUrls: ['./path-card.component.scss']
})
export class PathCardComponent implements OnInit {
  @Input() loading: boolean;
  @Input() path: {
    id: number,
    name: string,
    isLocked?: boolean,
    progress?: number,
    hasFeedback?: boolean,
    leadImage?: string,
  }
  backgroundImageStyle: string = '';
  backgroundImageStyle1: string = '';
  backgroundImageStyle2: string = '';
  pathLoading: boolean = true;
  constructor ( @Inject(DOCUMENT) private document: Document ) { }

  ngOnInit() {
    if (!this.path) {
      this.pathLoading = false;
    }
    console.log(this.path);
    this.backgroundImageStyle = '';
    this.backgroundImageStyle1 = 'url(https://egyptinnovate.com/sites/default/files/styles/details_page_image_width_654/public/Project-Management.jpg?itok=SIynbALN)';
    this.backgroundImageStyle2 = 'url(https://smallbiztrends.com/wp-content/uploads/2016/05/shutterstock_311472353.jpg)';
    if (this.path.leadImage) {
      this.backgroundImageStyle = 'url(' + this.path.leadImage + '), linear-gradient( rgba(0, 0, 0, .4), rgba(0, 0, 0, 0.2) )';
    }
  }

}

