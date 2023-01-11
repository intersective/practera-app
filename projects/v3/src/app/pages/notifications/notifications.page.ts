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
    this.subscriptions.push(this.notificationsService.notification$.subscribe(items => {
      this.todoItems = items;
    }));

    this.subscriptions.push(this.notificationsService.eventReminder$.subscribe(session => {
      if (!this.utils.isEmpty(session)) {
        this.eventReminders.push(session);
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  get isMobile() {
    return this.utils.isMobile();
  }

  async dismiss(keyboardEvent?: KeyboardEvent): Promise<boolean> {
    if (keyboardEvent && (keyboardEvent?.code === 'Space' || keyboardEvent?.code === 'Enter')) {
      keyboardEvent.preventDefault();
    } else if (keyboardEvent) {
      return;
    }

    return this.modalController.dismiss({
      'dismissed': true
    });
  }

  showEventDetail(event, keyboardEvent?: KeyboardEvent) {
    if (keyboardEvent && (keyboardEvent?.code === 'Space' || keyboardEvent?.code === 'Enter')) {
      keyboardEvent.preventDefault();
    } else if (keyboardEvent) {
      return;
    }

    if (this.utils.isMobile()) {
      return this.notificationsService.modal(
        {},
        { event },
        { cssClass: 'event-detail-popup' }
      );
    }

    // go to the events page with the event selected
    return this.router.navigate(['v3', 'events', { event_id: event.id }]);
  }

  timeFormatter(startTime) {
    return this.utils.timeFormatter(startTime);
  }

  async clickTodoItem(eventOrTodoItem, keyboardEvent?: KeyboardEvent) {
    if (keyboardEvent && (keyboardEvent?.code === 'Space' || keyboardEvent?.code === 'Enter')) {
      keyboardEvent.preventDefault();
    } else if (keyboardEvent) {
      return;
    }

    const {
      activity_id,
      context_id,
      assessment_id,
      assessment_submission_id,
    } = eventOrTodoItem?.meta;

    switch (eventOrTodoItem.type) {
      case 'feedback_available':
        await this.goToAssessment(activity_id, context_id, assessment_id);
        break;

      case 'review_submission':
        await this.goToReview(context_id, assessment_id, assessment_submission_id);
        break;

      case 'chat':
        await this.goToChat(eventOrTodoItem);
        break;

      case 'assessment_submission_reminder':
        await this.goToAssessment(activity_id, context_id, assessment_id);
        break;

      default: // event doesnt has type
        await this.showEventDetail(eventOrTodoItem);
        break;
    }
    const hasModal = await this.modalController.getTop();
    if (hasModal) {
      this.dismiss(); // dismiss modal
    }
  }

  async goToAssessment(activityId, contextId, assessmentId): Promise<void> {
    if (this.utils.isMobile()) {
      await this.router.navigate([
        'assessment-mobile',
        'assessment',
        activityId,
        contextId,
        assessmentId
      ]);
    } else {
      await this.router.navigate([
        'v3',
        'activity-desktop',
        contextId,
        activityId,
        assessmentId,
      ]);
    }
  }

  async goToReview(contextId, assessmentId, submissionId): Promise<any> {
    if (this.utils.isMobile()) {
      await this.router.navigate([
        'assessment-mobile',
        'review',
        contextId,
        assessmentId,
        submissionId,
        { from: 'reviews' }
      ]);
    } else {
      await this.router.navigate([
        'v3',
        'review-desktop',
        submissionId
      ]);
    }
    return await this.dismiss();
  }

  goToChat(_todoItem?: TodoItem) {
    return this.router.navigate(['v3', 'messages']);
  }

  goBack(keyboardEvent?: KeyboardEvent): Promise<boolean | void> {
    if (keyboardEvent && (keyboardEvent?.code === 'Space' || keyboardEvent?.code === 'Enter')) {
      keyboardEvent.preventDefault();
    } else if (keyboardEvent) {
      return;
    }

    if (!this.isMobile) {
      return this.dismiss();
    }
    return this.window.history.back();
  }
}
