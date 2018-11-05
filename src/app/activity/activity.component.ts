import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityDetailComponent implements OnInit {
   
  activity: {}; 

  constructor(
    private route: ActivatedRoute,
    private service: ActivitiesService
  ) { }

  ngOnInit() {
  }

}
