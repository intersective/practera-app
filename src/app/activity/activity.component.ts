import { Component, Input, NgZone, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, forkJoin, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ActivityService, Activity, Task } from './activity.service';
import { UtilsService } from '../services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { BrowserStorageService } from '@services/storage.service';
import { Event, EventListService } from '@app/event-list/event-list.service';
import { SharedService } from '@services/shared.service';
import { FastFeedbackService } from '../fast-feedback/fast-feedback.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent {
  @Input() id: number;
  @Input() currentTask;
  @Output() navigate = new EventEmitter();
  // when tasks are ready, emit tasks to the parent component so that the parent component can decide which task to display
  @Output() tasksReady = new EventEmitter();
  getActivity: Subscription;
  getEventPusher: Subscription;
  getEvents: Subscription;
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
    private activityService: ActivityService,
    public utils: UtilsService,
    private notificationService: NotificationService,
    public storage: BrowserStorageService,
    public eventListService: EventListService,
    public sharedService: SharedService,
    public fastFeedbackService: FastFeedbackService,
    private newRelic: NewRelicService,
    private ngZone: NgZone
  ) {

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
  private _navigate(direction) {
    if (this.utils.isMobile()) {
      // redirect to topic/assessment page for mobile
      return this.ngZone.run(() => {
        return this.router.navigate(direction);
      });
    } else {
      // emit event to parent component(task component)
      switch (direction[0]) {
        case 'topic':
          this.navigate.emit({
            type: 'topic',
            topicId: direction[2]
          });
          break;
        case 'assessment':
          this.navigate.emit({
            type: 'assessment',
            contextId: direction[3],
            assessmentId: direction[4]
          });
          break;
        default:
          return this.ngZone.run(() => {
            return this.router.navigate(direction);
          });
      }
    }
  }

  onEnter() {
    this.newRelic.setPageViewName('activity components');
    this.activity = {
      id: 0,
      name: '',
      description: '',
      tasks: []
    };
    this.loadingActivity = true;
    this._getActivity();
    this._getEvents();
    this.fastFeedbackService.pullFastFeedback().subscribe();
  }

  private _getActivity() {
    this.getActivity = this.activityService.getActivity(this.id)
      .subscribe(
        activity => {
          if (!activity) {
            // activity is null by default
            return ;
          }
          this.activity = activity;
          this.loadingActivity = false;
          this.newRelic.setPageViewName(`Activity ${this.activity.name}, ID: ${this.id}`);
          this.tasksReady.emit(activity.tasks);
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
      this.getEvents = this.eventListService.getEvents(this.id).subscribe(
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
    this._navigate([ 'app', 'home' ]);
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
            },
            data => {
              if (data.data) {
                this._navigate(['assessment', 'assessment', this.id , task.contextId, task.id]);
              }
            }
          );
          return ;
        }
        this._navigate(['assessment', 'assessment', this.id , task.contextId, task.id]);
        break;
      case 'Topic':
        this._navigate(['topic', this.id, task.id]);
        break;
      case 'Locked':
        this.notificationService.popUp('shortMessage', {message: 'This part of the app is still locked. You can unlock the features by engaging with the app and completing all tasks.'});
        break;
    }
  }

  gotoEvent(event?) {
    // go to the event page without choosing any event
    if (!event) {
      return this.router.navigate(['app', 'events', {activity_id: this.id}]);
    }
    // display the event pop up for mobile
    if (this.utils.isMobile()) {
      return this.eventListService.eventDetailPopUp(event);
    }
    // go to the event page with an event selected
    return this.router.navigate(['app', 'events', {activity_id: this.id, event_id: event.id}]);
  }

  /**
   * Manually change the status of a task
   * @param type   The type of the task('Assessment', 'Topic')
   * @param id     The id of the task
   * @param status The status
   */
  changeTaskStatus(type: string, id: number, status: string) {
    const index = this.activity.tasks.findIndex(t => t.id === +id && t.type === type);
    if (index < 0) {
      return;
    }
    this.activity.tasks[index].status = status;
  }

  /******************
    Used for task layout
  ******************/
  taskLeadingIcon(task) {
    switch (task.type) {
      case 'Locked':
        return 'lock-closed-outline';
      case 'Topic':
        return 'reader-outline';
      case 'Assessment':
        return 'clipboard-outline';
    }
  }

  assessmentNotSubmitted(task) {
    return task.type === 'Assessment' && (!task.status || task.status === '' || task.status === 'in progress');
  }

  taskSubtitle2(task) {
    if (task.type === 'Locked') {
      return '';
    }
    let title = task.type + ' ';
    title += task.isLocked ? '- Locked by ' + task.submitter.name : task.status;
    return title;
  }

  taskEndingIcon(task) {
    if (task.isLocked) {
      return 'lock-closed-outline';
    }
    switch (task.status) {
      case 'done':
        return 'checkmark';
      case 'pending review':
        return 'hourglass-outline';
      case 'feedback available':
      case 'in progress':
      default:
        return 'arrow-forward';
    }
  }

}
