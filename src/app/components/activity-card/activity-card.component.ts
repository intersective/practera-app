import { Component, OnInit, Input } from '@angular/core';
//import { Review} from '../reviews/reviews.service';

@Component({
  selector: 'app-activity-card',
  templateUrl: './activity-card.component.html',
  styleUrls: ['./activity-card.component.scss']
})
export class ActivityCardComponent implements OnInit {
  
  constructor() {}

  @Input() activity: {};
  @Input () review:{} ;
  @Input () toggle: boolean; 

  ngOnInit() {}
}
