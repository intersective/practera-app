import { Component, OnInit, Input } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';


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
  constructor ( @Inject(DOCUMENT) private document: Document ) { }

  ngOnInit() {
    this.backgroundImageStyle = '';
    if (this.activity.leadImage) {
      this.backgroundImageStyle = 'url(' + this.activity.leadImage + '), linear-gradient( rgba(0, 0, 0, .4), rgba(0, 0, 0, 0.2) )';
    }
  }
}

