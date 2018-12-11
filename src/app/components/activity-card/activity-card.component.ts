import { Component, OnInit, Input } from '@angular/core';
import { Activity } from '../../project/project.service';

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
