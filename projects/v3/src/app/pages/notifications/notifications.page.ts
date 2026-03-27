import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationsService, TodoItem } from '@v3/app/services/notifications.service';
import { UtilsService } from '@v3/app/services/utils.service';
import { trigger, transition, useAnimation } from '@angular/animations';
import { fadeIn } from '@v3/app/animations';
import { ModalController } from '@ionic/angular';
import { HomeService, Milestone } from '@v3/app/services/home.service';
import { DOCUMENT } from '@angular/common';
import { Subscription, firstValueFrom } from 'rxjs';
import { UnlockIndicatorService } from '@v3/app/services/unlock-indicator.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  standalone: false,
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
  milestones: Milestone[];
  isLockedActivities = {};

  // Unlock indicators functionality
  hasUnlockIndicators: boolean = false;
  markingInProgress: boolean = false;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private utils: UtilsService,
    private notificationsService: NotificationsService,
    private router: Router,
    private modalController: ModalController,
    private readonly homeService: HomeService,
    private unlockIndicatorService: UnlockIndicatorService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.window = this.document.defaultView;
  }

  ngOnInit() {
    this.utils.setPageTitle('Notifications - Practera');
    this.subscriptions.push(this.homeService.milestones$.subscribe(async milestones => {
      if (milestones === null) {
        this.homeService.getMilestones();
      }

      this.milestones = milestones;

      (milestones || []).forEach(milestone => {
        // API won't return activities when milestone is locked
        milestone?.activities?.forEach(activity => {
          this.isLockedActivities[activity.id] = activity.isLocked;
        });
      });
    }));

    this.subscriptions.push(this.notificationsService.notification$.subscribe(items => {
      this.todoItems = items;
    }));

    this.subscriptions.push(this.notificationsService.eventReminder$.subscribe(session => {
      if (!this.utils.isEmpty(session)) {
        this.eventReminders.push(session);
      }
    }));

    // Subscribe to unlock indicators to show/hide "Mark All" button
    this.unlockIndicatorService.unlockedTasks$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(unlockedTasks => {
        this.hasUnlockIndicators = unlockedTasks && unlockedTasks.length > 0;
      });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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

  async clickTodoItem(eventOrTodoItem: TodoItem) {
    const {
      activity_id,
      context_id,
      assessment_id,
      assessment_submission_id,
    } = eventOrTodoItem?.meta;

    switch (eventOrTodoItem.type) {
      case 'feedback_available':
        if (this.isLockedActivities[activity_id] === true) {
          this.notificationsService.presentToast($localize`This activity is locked. Please complete the previous activity first.`, {
            duration: 1500,
          });
          return;
        }
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

  /**
   * Mark all unlock indicators as read
   * This will clear all localStorage entries and mark all corresponding TodoItems as done
   */
  async markAllUnlockIndicatorsAsRead(keyboardEvent?: KeyboardEvent): Promise<void> {
    if (keyboardEvent && (keyboardEvent?.code === 'Space' || keyboardEvent?.code === 'Enter')) {
      keyboardEvent.preventDefault();
    } else if (keyboardEvent) {
      return;
    }

    if (this.markingInProgress) {
      return; // Prevent double-clicking
    }

    const allUnlockedTasks = this.unlockIndicatorService.allUnlockedTasks();
    if (allUnlockedTasks.length === 0) {
      return;
    }

    await this.notificationsService.alert({
      header: $localize`Mark all unlock indicators as read`,
      message: $localize`Are you sure you want to mark all ${allUnlockedTasks.length} unlock indicators as read? This action cannot be undone.`,
      buttons: [
        {
          text: $localize`Cancel`,
          role: 'cancel'
        },
        {
          text: $localize`Confirm`,
          role: 'confirm',
          handler: () => {
            this.performMarkAllAsRead();
          }
        }
      ]
    });
  }

  private async performMarkAllAsRead(): Promise<void> {
    // prevent double trigger
    if (this.markingInProgress) {
      return;
    }

    this.markingInProgress = true;

    try {
      const currentTodoItems = this.notificationsService.getCurrentTodoItems();
      const allUnlockedTasks = this.unlockIndicatorService.allUnlockedTasks();

      if (allUnlockedTasks.length === 0) {
        this.markingInProgress = false;
        return;
      }

      // collect all duplicate todoItems that need to be marked
      const allDuplicatesToMark: {id: number, identifier: string}[] = [];

      allUnlockedTasks.forEach(unlockedTask => {
        const duplicates = this.unlockIndicatorService.findDuplicateTodoItems(currentTodoItems, unlockedTask);
        allDuplicatesToMark.push(...duplicates);
      });

      // remove duplicates
      const uniqueDuplicates = allDuplicatesToMark.filter((item, index, self) =>
        index === self.findIndex(t => t.id === item.id)
      );

      // eslint-disable-next-line no-console
      console.info(`Found ${uniqueDuplicates.length} TodoItems to mark as done for ${allUnlockedTasks.length} unlock indicators`);

      if (uniqueDuplicates.length > 0) {
        const markingOperations = this.notificationsService.markMultipleTodoItemsAsDone(uniqueDuplicates);
        await Promise.all(markingOperations.map(op => firstValueFrom(op).catch(err => console.error(err))));
      }

      // mark the original localStorage entries as done (fallback)
      const fallbackMarkingOps = allUnlockedTasks.map(todo =>
        firstValueFrom(this.notificationsService.markTodoItemAsDone(todo)).catch(err => console.error(err))
      );
      await Promise.all(fallbackMarkingOps);

      this.unlockIndicatorService.clearAllTasks();

      // pull latest TodoItems
      await firstValueFrom(this.notificationsService.getTodoItems());

      this.notificationsService.presentToast(
        $localize`All unlock indicators have been marked as read`,
        { duration: 2000, color: 'success' }
      );

      // eslint-disable-next-line no-console
      console.info(`Successfully marked ${uniqueDuplicates.length} TodoItems and cleared ${allUnlockedTasks.length} unlock indicators`);

    } catch (error) {
      console.error('Error marking all unlock indicators as read:', error);

      this.notificationsService.presentToast(
        $localize`Error marking indicators as read. Please try again.`,
        { duration: 3000, color: 'danger' }
      );
    } finally {
      this.markingInProgress = false;
    }
  }
}
