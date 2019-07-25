import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ActivityService, Activity, OverviewActivity, Task } from './activity.service';
import { UtilsService } from '../services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { BrowserStorageService } from '@services/storage.service';
import { RouterEnter } from '@services/router-enter.service';
import { Event, EventsService } from '@app/events/events.service';
import { SharedService } from '@services/shared.service';
import { FastFeedbackService } from '../fast-feedback/fast-feedback.service';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent extends RouterEnter {

  routeUrl = '/app/activity';
  id: number;
  activity: Activity = {
    id: 0,
    name: '',
    description: '',
    tasks: []
  };
  loadingActivity = true;
  events: Array<Event>;
  loadingEvents = true;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private activityService: ActivityService,
    public utils: UtilsService,
    private notificationService: NotificationService,
    public storage: BrowserStorageService,
    private eventsService: EventsService,
    public sharedService: SharedService,
    public fastFeedbackService: FastFeedbackService
  ) {
    super(router);
    // update event list after book/cancel an event
    this.utils.getEvent('update-event').subscribe(event => {
      this._getEvents();
    });
  }

  private _initialise() {
    this.activity = {
      id: 0,
      name: '',
      description: '',
      tasks: []
    };
    this.loadingActivity = true;
  }

  onEnter() {
    this._initialise();
    this.id = +this.route.snapshot.paramMap.get('id');
    this._getActivity();
    this._getEvents();

    this.fastFeedbackService.pullFastFeedback().subscribe();
  }

  private _getActivity() {
    this.activityService.getActivity(this.id)
      .subscribe(activity => {
        this.activity = activity;
        this.loadingActivity = false;

        this._getTasksProgress();
      });
  }

  private _parallelAPI(requests) {
    return forkJoin(requests)
      .pipe(catchError(val => of(`API Response error: ${val}`)))
      .subscribe(tasks => {
        // throw error when it's string
        if (typeof tasks === 'string') {
          throw tasks;
        }

        tasks.forEach((res: Task) => {
          const taskIndex = this.activity.tasks.findIndex(task => {
            return task.id === res.id && task.type === 'Assessment';
          });

          this.activity.tasks[taskIndex] = res;
        });
      });
  }

  /**
   * extract and insert "progress" & "status='done'" (for topic) value to the tasks element
   */
  private _getTasksProgress(): void {
    this.activityService.getTasksProgress({
      model_id: this.activity.id,
      tasks: this.activity.tasks,
    }).subscribe(tasks => {
        this.activity.tasks = tasks;

        const requests = [];
        this.activity.tasks.forEach((task, index) => {
          if (task.type === 'Assessment') {
            requests.push(this._getAssessmentStatus(index));
          }
        });

        return this._parallelAPI(requests);
      });
  }

  /**
   * involving in calling get submission API to get and evaluate assessment status based on latest submission status
   * @param {number} index task array index value
   */
  private _getAssessmentStatus(index): Observable<any> {
    return this.activityService.getAssessmentStatus(this.activity.tasks[index]);
  }

  private _getEvents() {
    this.loadingEvents = true;
    this.events = [];
    this.eventsService.getEvents(this.id).subscribe(events => {
      this.events = events;
      this.loadingEvents = false;
    });
  }

  back() {
    this.router.navigate([ 'app', 'project' ]);
  }

  // check assessment lock or not before go to assessment.
  checkAssessment(task) {
    if (task.isLocked) {
      this.notificationService.lockTeamAssessmentPopUp(
        {
          name: task.submitter.name,
          image: task.submitter.image
        } ,
        (data) => {
          if (data.data) {
            this.goto(task.type, task.id);
          }
        }
      );
      return ;
    }
    this.goto(task.type, task.id);
  }

  goto(type, id) {
    switch (type) {
      case 'Assessment':
        // get the context id of this assessment
        let contextId = 0;
        let isForTeam = false;
        this.utils.each(this.activity.tasks, task => {
          if (task.type === 'Assessment' && task.id === id) {
            contextId = task.contextId;
            isForTeam = task.isForTeam;
          }
        });
        if (isForTeam && !this.storage.getUser().teamId) {
          this.notificationService.popUp('shortMessage', {message: 'To do this assessment, you have to be in a team.'});
          break;
        }
        this.router.navigate(['assessment', 'assessment', this.id , contextId, id]);
        break;
      case 'Topic':
        this.router.navigate(['topic', this.id, id]);
        break;
      case 'Locked':
        this.notificationService.popUp('shortMessage', {message: 'This part of the app is still locked. You can unlock the features by engaging with the app and completing all tasks.'});
        break;
    }
  }

  displayEventTime(event) {
    return this.utils.utcToLocal(event.startTime) + ' - ' + this.utils.utcToLocal(event.endTime, 'time');
  }
}
