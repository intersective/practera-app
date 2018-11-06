import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ActivityService } from './activity.service';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit {
  
  id = 0;
  activity = {
    name: '',
    description: '',
    tasks: []
  };

  constructor(
    private route: ActivatedRoute,
    private activityService: ActivityService
  ) { }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.activityService.getActivity(this.id)
      .subscribe(activity => this.activity = activity);
  }

  back() {
    console.log('go back');
  }

  goto(type, id) {
    console.log('go to ', type, ' with id ', id);
  }

}
