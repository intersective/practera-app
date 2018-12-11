import { Component, OnInit, Input } from '@angular/core';

interface Activity {
  id:number,
  name: string,
  is_locked: boolean,
  lead_image: string,
  hasFeedback: boolean
}

@Component({
  selector: 'app-activity-card',
  templateUrl: './activity-card.component.html',
  styleUrls: ['./activity-card.component.scss']
})
export class ActivityCardComponent implements OnInit {
  
  constructor() {}

  @Input() activity: Activity;
  
  ngOnInit() {}
}
