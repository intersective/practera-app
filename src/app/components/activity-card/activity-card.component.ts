import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-activity-card',
  templateUrl: './activity-card.component.html',
  styleUrls: ['./activity-card.component.scss']
})
export class ActivityCardComponent implements OnInit {
  
  constructor() { }

  @Input() activity: {};
  @Input () review: {};

  ngOnInit() {
  }

}
