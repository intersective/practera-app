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
    is_locked?: boolean,
    progress?: number,
    hasFeedback?: boolean,
    lead_image?: string
  }
 constructor ( @Inject(DOCUMENT) private document: Document ) { }

  ngOnInit() {
    if (this.activity.lead_image) 
    this.setBackgroundImage(this.activity.lead_image)
  };

  setBackgroundImage (image) {
   this.document.documentElement.style.setProperty('--practera-card-background-image', "url('"+image+"')");
  }

}
  
