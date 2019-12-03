import { Component, Input, NgZone } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, of, forkJoin, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ActivityService, Activity, OverviewActivity, Task } from './activity.service';
import { UtilsService } from '../services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { BrowserStorageService } from '@services/storage.service';
import { RouterEnter } from '@services/router-enter.service';
import { Event, EventsService } from '@app/events/events.service';
import { SharedService } from '@services/shared.service';
import { FastFeedbackService } from '../fast-feedback/fast-feedback.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent extends RouterEnter {
  getActivity: Subscription;
  getEventPusher: Subscription;
  getEvents: Subscription;
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
    public fastFeedbackService: FastFeedbackService,
    private newRelic: NewRelicService,
    private ngZone: NgZone
  ) {
    super(router);

    // update event list after book/cancel an event
    this.getEventPusher = this.utils.getEvent('update-event').subscribe(
      event => {
        this._getEvents();
      },
      (error) => {
        this.newRelic.noticeError(error);
      }
    );
  }

  // force every navigation happen under radar of angular
  private navigate(direction): Promise<boolean> {
    return this.ngZone.run(() => {
      return this.router.navigate(direction);
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
    this.newRelic.setPageViewName('activity components');
    this._initialise();
    this.id = +this.route.snapshot.paramMap.get('id');
    this._getActivity();
    this._getEvents();

    this.fastFeedbackService.pullFastFeedback().subscribe();
  }

  private _getActivity() {
    this.getActivity = this.activityService.getActivity(this.id)
      .subscribe(
        activity => {
          if (activity) {
            this.activity = activity;
            this.loadingActivity = false;
            this.newRelic.setPageViewName(`Activity ${this.activity.name}, ID: ${this.id}`);
          }
        },
        (error) => {
          this.newRelic.noticeError(error);
        }
      );
  }

  private _getEvents(events?: Event[]) {
    this.events = events || [];
    if (events === undefined) {
      this.loadingEvents = true;
      this.getEvents = this.eventsService.getEvents(this.id).subscribe(
        res => {
          this.events = res;
          this.loadingEvents = false;
        },
        error => {
          this.newRelic.noticeError(error);
        }
      );
    }
  }

  back() {
    this.navigate([ 'app', 'project' ]);
    this.newRelic.actionText('Back button pressed on Activities Page.');
  }

  goto(task) {
    this.newRelic.actionText(`Selected Task (${task.type}): ID ${task.id}`);

    switch (task.type) {
      case 'Assessment':
        if (task.isForTeam && !this.storage.getUser().teamId) {
          this.notificationService.popUp('shortMessage', {message: 'To do this assessment, you have to be in a team.'});
          break;
        }
        // check if assessment is locked by other team members
        if (task.isLocked) {
          this.notificationService.lockTeamAssessmentPopUp(
            {
              name: task.submitter.name,
              image: task.submitter.image
            } ,
            (data) => {
              if (data.data) {
                this.navigate(['assessment', 'assessment', this.id , task.contextId, task.id]);
              }
            }
          );
          return ;
        }
        this.navigate(['assessment', 'assessment', this.id , task.contextId, task.id]);
        break;
      case 'Topic':
        this.navigate(['topic', this.id, task.id]);
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
