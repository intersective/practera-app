import { Component, OnInit, Input } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';


@Component({
  selector: 'app-activity-card',
  templateUrl: './activity-card.component.html',
  styleUrls: ['./activity-card.component.scss']
})
export class ActivityCardComponent implements OnInit {
  @Input() activity: {
    id: number,
    name: string,
    isLocked?: boolean,
    progress?: number,
    hasFeedback?: boolean,
    leadImage?: string,
  }
 constructor ( @Inject(DOCUMENT) private document: Document ) { }

  ngOnInit() {
    this.activity['style'] = '';
    if (this.activity.leadImage) {
      this.activity['style'] = 'url(' + this.activity.leadImage + ')';
    }
  }

}

