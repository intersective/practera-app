import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { HomeService, TodoItem } from './home.service';
import { Router, NavigationEnd } from '@angular/router';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';
import { Achievement, AchievementsService } from '@app/achievements/achievements.service';
import { Event, EventListService } from '@app/event-list/event-list.service';
import { Intercom } from 'ng-intercom';
import { environment } from '@environments/environment';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { trigger, state, transition, style, animate, useAnimation } from '@angular/animations';
import { fadeIn } from '../../animations';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss'],
  animations: [
    trigger('newLoaded', [
      transition(':enter, * => 0, * => -1', [
        useAnimation(fadeIn, {
          params: { time: '250ms' }
        })
      ]),
    ]),
  ]
})
export class HomeComponent implements OnDestroy, OnInit {
  @Input() refresh: Observable<any>;

  progress = 0;
  loadingProgress = true;
  todoItems: Array<TodoItem> = [];
  eventReminders: Array<Event> = [];
  loadingTodoItems = true;
  subscriptions: Subscription[] = [];
  achievements: Array<Achievement>;
  progressConfig: any;
  loadingAchievements = true;

  constructor(
    private intercom: Intercom,
    public router: Router,
    private homeService: HomeService,
    public utils: UtilsService,
    public storage: BrowserStorageService,
    public achievementService: AchievementsService,
    private eventsService: EventListService,
    private newRelic: NewRelicService
  ) {
    const role = this.storage.getUser().role;
    this.utils.getEvent('notification').subscribe(event => {
      const todoItem = this.homeService.getTodoItemFromEvent(event);
      if (!this.utils.isEmpty(todoItem)) {
        // add todo item to the list if it is not empty
        this.todoItems.push(todoItem);
      }
    });
    this.utils.getEvent('team-message').subscribe(event => {
      this.homeService.getChatMessage().subscribe(chatMessage => {
        if (!this.utils.isEmpty(chatMessage)) {
          this._addChatTodoItem(chatMessage);
        }
      });
    });
    this.utils.getEvent('event-reminder').subscribe(event => {
      this.homeService.getReminderEvent(event).subscribe(session => {
        if (!this.utils.isEmpty(session)) {
          this.eventReminders.push(session);
        }
      });
    });
    if (role !== 'mentor') {
      const noMentorMsgEvent = this.utils.getEvent('team-no-mentor-message');
      if (noMentorMsgEvent) {
        noMentorMsgEvent.subscribe(event => {
          this.homeService.getChatMessage().subscribe(chatMessage => {
            if (!this.utils.isEmpty(chatMessage)) {
              this._addChatTodoItem(chatMessage);
            }
          });
        });
      }
    }
  }

  ngOnInit() {
    this.refresh.subscribe(params => {
      this.onEnter();
    });
  }

  private _initialise() {
    this.todoItems = [];
    this.eventReminders = [];
    this.loadingTodoItems = true;
    this.loadingProgress = true;
    this.achievements = [];
    this.loadingAchievements = true;
  }

  onEnter() {
    this._initialise();
    this.subscriptions.push(
      this.homeService.getTodoItems().subscribe(todoItems => {
        this.todoItems = this.todoItems.concat(todoItems);
        this.loadingTodoItems = false;
      })
    );
    // only get the number of chats if user is in team
    if (this.storage.getUser().teamId) {
      this.subscriptions.push(
        this.homeService.getChatMessage().subscribe(chatMessage => {
          if (!this.utils.isEmpty(chatMessage)) {
            this._addChatTodoItem(chatMessage);
          }
          this.loadingTodoItems = false;
        })
      );
    }
    this.subscriptions.push(
      this.homeService.getProgress().subscribe(progress => {
        this.progress = progress;
        this.progressConfig = {percent: progress};
        this.loadingProgress = false;
      })
    );

    this.subscriptions.push(
      this.achievementService.getAchievements('desc').subscribe(achievements => {
        const earned = [];
        const unEarned = [];
        achievements.forEach(item => {
          if (item.isEarned === false) {
            unEarned.push(item);
          } else {
            earned.push(item);
          }
        });

        // retrict quantity of achievements to max 3
        if (achievements.length <= 3) {
          this.achievements = achievements;
        } else if (!earned.length || earned.length === achievements.length) {
          this.achievements = achievements;
          this.achievements.length = 3;
        } else if (earned.length === 1 && unEarned.length > 1) {
          this.achievements[0] = earned[0];
          this.achievements[1] = unEarned[0];
          this.achievements[2] = unEarned[1];
        } else if (earned.length > 1 && unEarned.length > 0) {
          this.achievements[0] = earned[0];
          this.achievements[1] = earned[1];
          this.achievements[2] = unEarned[0];
        }
        this.loadingAchievements = false;
      })
    );

    if (typeof environment.intercom !== 'undefined' && environment.intercom === true) {
      this.intercom.boot({
        app_id: environment.intercomAppId,
        name: this.storage.getUser().name, // Full name
        email: this.storage.getUser().email, // Email address
        user_id: this.storage.getUser().id, // current_user_id
        // Supports all optional configuration.
        widget: {
          'activator': '#intercom'
        }
      });
    }
  }

  goTo(destination) {
    this.router.navigate(destination);
  }

  clickTodoItem(eventOrTodoItem) {
    switch (eventOrTodoItem.type) {
      case 'feedback_available':
        return this.goToAssessment(eventOrTodoItem.meta.activity_id, eventOrTodoItem.meta.context_id, eventOrTodoItem.meta.assessment_id);
      case 'review_submission':
        return this.goToReview(eventOrTodoItem.meta.context_id, eventOrTodoItem.meta.assessment_id, eventOrTodoItem.meta.assessment_submission_id);
      case 'chat':
        return this.goToChat(eventOrTodoItem);
      case 'assessment_submission_reminder':
        return this.goToAssessment(eventOrTodoItem.meta.activity_id, eventOrTodoItem.meta.context_id, eventOrTodoItem.meta.assessment_id);

      default: // event doesnt has type
        this.showEventDetail(eventOrTodoItem);
        break;
    }
  }

  goToAssessment(activityId, contextId, assessmentId) {
    this.newRelic.actionText('goToAssessment');
    if (this.utils.isMobile()) {
      this.router.navigate([
        'assessment',
        'assessment',
        activityId,
        contextId,
        assessmentId
      ]);
    } else {
      this.router.navigate([
        'app',
        'activity',
        activityId,
        {
          task: 'assessment',
          task_id: assessmentId,
          context_id: contextId
        }
      ]);
    }
  }

  goToReview(contextId, assessmentId, submissionId) {
    this.newRelic.actionText('goToReview');
    if (this.utils.isMobile()) {
      this.router.navigate([
        'assessment',
        'review',
        contextId,
        assessmentId,
        submissionId
      ]);
    } else {
      this.router.navigate([
        'app',
        'reviews',
        submissionId
      ]);
    }
  }

  goToChat(todoItem?: TodoItem) {
    this.newRelic.actionText('goToChat');
    if (!this.utils.isMobile()) {
      return this.router.navigate(['app', 'chat']);
    }

    if (this.utils.isEmpty(todoItem.meta)) {
      return this.router.navigate(['app', 'chat']);
    }

    if (todoItem.meta.team_member_id) {
      return this.router.navigate(['chat', 'chat-room', todoItem.meta.team_id, todoItem.meta.team_member_id]);
    }
    return this.router.navigate(['chat', 'chat-room', 'team', todoItem.meta.team_id, todoItem.meta.participants_only]);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private _addChatTodoItem(chatTodoItem) {
    let currentChatTodoIndex = -1;
    const currentChatTodo = this.todoItems.find((todoItem, index) => {
      if (todoItem.type === 'chat') {
        currentChatTodoIndex = index;
        return true;
      }
    });
    if (currentChatTodo) {
      this.todoItems.splice(currentChatTodoIndex, 1);
    }
    this.todoItems.push(chatTodoItem);
  }

  showEventDetail(event) {
    this.newRelic.actionText('showEventDetail');
    if (this.utils.isMobile()) {
      this.eventsService.eventDetailPopUp(event);
    } else {
      // go to the events page with the event selected
      this.router.navigate(['app', 'events', {event_id: event.id}]);
    }
  }

}
