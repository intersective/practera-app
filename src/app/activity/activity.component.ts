import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ActivityService } from './activity.service';
import { UtilsService } from '../services/utils.service';

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
    private router: Router,
    private route: ActivatedRoute,
    private activityService: ActivityService,
    private utils: UtilsService,
  ) { }

  ngOnInit() {
    this.id = parseInt(this.route.snapshot.paramMap.get('id'));
    this.activityService.getActivity(this.id)
      .subscribe(activity => this.activity = activity);
  }

  back() {
    
  }

  goto(type, id) {
    switch (type) {
      case 'Assessment':
        // get the context id of this assessment
        let contextId = 0;
        this.utils.each(this.activity.tasks, task => {
          if (task.type === 'Assessment' && task.id == this.id) {
            contextId = task.contextId;
          }
        });
        this.router.navigate(['/assessment/assessment', this.id , contextId, id]);
        break;
      case 'Topic':

        break;
      case 'Comm':

        break;
    }
    console.log('go to ', type, ' with id ', id);
  }

}
