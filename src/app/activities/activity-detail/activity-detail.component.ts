import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-activity-detail',
  templateUrl: './activity-detail.component.html',
  styleUrls: ['./activity-detail.component.scss']
})
export class ActivityDetailComponent implements OnInit {
   
  activity$: Observable<Activity>; 

  constructor(
    private route: ActivatedRoute,
    private service: ActivitiesService
  ) { }


  ngOnInit() {
    this.activity$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.service.getActivity(params.get('id')))
    );
  }

}
