import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationsService, TodoItem } from '@v3/app/services/notifications.service';
import { UtilsService } from '@v3/app/services/utils.service';
import { trigger, transition, useAnimation } from '@angular/animations';
import { fadeIn } from '@v3/app/animations';
import { ModalController } from '@ionic/angular';
import { DOCUMENT } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
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
export class NotificationsPage implements OnInit, OnDestroy {
  @Input() mode?: string; // optional value: "modal"
  loadingTodoItems: boolean;
  todoItems: TodoItem[] = [];
  eventReminders = [];
  subscriptions: Subscription[] = [];
  window; // document view

  constructor(
    private utils: UtilsService,
    private notificationsService: NotificationsService,
    private router: Router,
    private modalController: ModalController,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.window = this.document.defaultView;
  }

  ngOnInit() {
    this.subscriptions[0] = this.notificationsService.notification$.subscribe(items => {
      this.todoItems = this.todoItems.concat(items);
    });
    this.subscriptions[1] = this.notificationsService.eventReminder$.subscribe(session => {
      if (!this.utils.isEmpty(session)) {
        this.eventReminders.push(session);
      }
    });

    this.subscriptions[2] = this.notificationsService.newMessage$.subscribe(chatMessage => {
      if (!this.utils.isEmpty(chatMessage)) {
        this._addChatTodoItem(chatMessage);
      }
    });

    this.utils.getEvent('notification').subscribe(event => {
      const todoItem = this.notificationsService.getTodoItemFromEvent(event);
      if (!this.utils.isEmpty(todoItem)) {
        // add todo item to the list if it is not empty
        this.todoItems.push(todoItem);
      }
    });

    this.utils.getEvent('chat:new-message').subscribe(() => {
      this.notificationsService.getChatMessage().subscribe(chatMessage => {
        if (!this.utils.isEmpty(chatMessage)) {
          this._addChatTodoItem(chatMessage);
        }
      });
    });

    this.utils.getEvent('event-reminder').subscribe(event => {
      this.notificationsService.getReminderEvent(event).subscribe(session => {
        if (!this.utils.isEmpty(session)) {
          this.eventReminders.push(session);
        }
      });
    });
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

  get isMobile() {
    return this.utils.isMobile();
  }

  async dismiss(): Promise<boolean> {
    return this.modalController.dismiss({
      'dismissed': true
    });
  }

  showEventDetail(event) {
    if (this.utils.isMobile()) {
      return this.notificationsService.modal(
        {},
        { event },
        { cssClass: 'event-detail-popup' }
      );
    } else {
      // go to the events page with the event selected
      this.router.navigate(['v3', 'events', { event_id: event.id }]);
    }
  }

  timeFormatter(startTime) {
    return this.utils.timeFormatter(startTime);
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
    if (this.utils.isMobile()) {
      this.router.navigate([
        'assessment-mobile',
        'assessment',
        activityId,
        contextId,
        assessmentId
      ]);
    } else {
      this.router.navigate([
        'v3',
        'activity-desktop',
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
    if (this.utils.isMobile()) {
      this.router.navigate([
        'v3',
        'reviews',
        contextId,
        assessmentId,
        submissionId
      ]);
    } else {
      this.router.navigate([
        'v3',
        'review-desktop',
        submissionId
      ]);
    }
  }

  goToChat(todoItem?: TodoItem) {
    return this.router.navigate(['v3', 'messages']);
  }

  goBack(): Promise<boolean | void> {
    if (!this.isMobile) {
      return this.dismiss();
    }
    return this.window.history.back();
  }
}
