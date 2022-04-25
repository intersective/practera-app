import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationsService, TodoItem } from '@v3/app/services/notifications.service';
import { UtilsService } from '@v3/app/services/utils.service';
import { trigger, transition, useAnimation } from '@angular/animations';
import { fadeIn } from '@v3/app/animations';

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
export class NotificationsPage implements OnInit {
  loadingTodoItems: boolean;
  todoItems: TodoItem[] = [];
  eventReminders = [];

  constructor(
    private utils: UtilsService,
    private notificationsService: NotificationsService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  get isMobile() {
    return this.utils.isMobile();
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
      this.router.navigate(['app', 'events', { event_id: event.id }]);
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
    return this.router.navigate(['v3', 'chat']);
  }
}
