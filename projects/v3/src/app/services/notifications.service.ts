import { Injectable } from '@angular/core';
import { ModalController, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { AlertOptions, ToastOptions, ModalOptions, LoadingOptions } from '@ionic/core';
import { PopUpComponent } from '../components/pop-up/pop-up.component';
import { AchievementPopUpComponent } from '../components/achievement-pop-up/achievement-pop-up.component';
import { ActivityCompletePopUpComponent } from '../components/activity-complete-pop-up/activity-complete-pop-up.component';
import { Achievement, AchievementService } from './achievement.service';
import { UtilsService } from '@v3/services/utils.service';
import { ReviewRatingComponent } from '../components/review-rating/review-rating.component';
import { LockTeamAssessmentPopUpComponent } from '../components/lock-team-assessment-pop-up/lock-team-assessment-pop-up.component';
import { FastFeedbackComponent } from '../components/fast-feedback/fast-feedback.component';
import { Observable, of, Subject } from 'rxjs';
import { RequestService } from 'request';
import { BrowserStorageService } from './storage.service';
import { map, shareReplay } from 'rxjs/operators';
import { ApolloService } from './apollo.service';
import { EventService } from './event.service';
import { NetworkService } from './network.service';
import { ModalService } from './modal.service';
import { environment } from '@environments/environment';
import { DemoService } from './demo.service';
import { UnlockIndicatorModel, UnlockIndicatorService, UnlockedTask } from './unlock-indicator.service';

export interface CustomTostOptions {
  message: string;
  icon: string;
  duration?: string;
}

export interface Choice {
  id: number;
  title: string;
}

export interface Question {
  id: number;
  title: string;
  description: string;
  choices: Array<Choice>;
}

export interface Meta {
  context_id: number;
  team_id: number;
  target_user_id: number;
  team_name: string;
  assessment_name: string;
}

export interface TodoItem {
  unreadMessages?: number; // for chat
  type?: string;
  name?: string;
  description?: string;
  time?: string;
  meta?: {
    activity_id?: number;
    context_id?: number;
    assessment_id?: number;
    assessment_submission_id?: number;
    assessment_name?: string;
    reviewer_name?: string;
    team_id?: number;
    team_member_id?: number;
    participants_only?: boolean;
    due_date?: string;
  };
}

const api = {
  get: {
    todoItem: 'api/v2/motivations/todo_item/list.json',
    events: 'api/v2/act/event/list.json',
  },
  post: {
    todoItem: 'api/v2/motivations/todo_item/edit.json'
  }
};

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  private _notification$ = new Subject<TodoItem[]>();
  notification$ = this._notification$.pipe(shareReplay(1));

  private _eventReminder$ = new Subject<any>();
  eventReminder$ = this._eventReminder$.pipe(shareReplay(1));

  private notifications: TodoItem[];

  private connection = {
    informed: false,
    isOnline: true,
  };

  constructor(
    private readonly demo: DemoService,
    private modalService: ModalService,
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    readonly achievementService: AchievementService,
    readonly utils: UtilsService,
    private request: RequestService,
    private storage: BrowserStorageService,
    private apolloService: ApolloService,
    private eventsService: EventService,
    private networkService: NetworkService,
    private unlockIndicatorService: UnlockIndicatorService,
  ) {
    // after messages read need to update chat notification data on notification service
    this.utils.getEvent('chat-badge-update').subscribe(event => {
      this.getChatMessage().subscribe();
    });

    this.networkService.isOnline.subscribe(isOnline => {
      this.connection.isOnline = isOnline;

      if (!isOnline) {
        this.connection.informed = true;
        return window.alert($localize`You've disconnected from internet, you may not be able to perform any action now.`);
      }
      if (this.connection.informed === true && isOnline) {
        this.presentToast($localize`You are back online.`, {
          color: 'success',
          icon: 'checkmark-circle'
        });
      }
    });
  }

  dismiss() {
    return this.modalController.dismiss();
  }

  get notificationsCount(): number {
    return this.notifications?.length || 0;
  }

  addNewNotification(newNotification): void {
    this.notifications = this.notifications.concat(newNotification);
    this._notification$.next(this.notifications);
  }

  /**
   * @name modalConfig
   * @description futher customised filter
   */
  private modalConfig({ component, componentProps }, options = {}): ModalOptions {
    const config = Object.assign(
      {
        component,
        componentProps,
      },
      options
    );

    return config;
  }

  // show pop up message
  // this is using pop-up.component.ts as the view
  // put redirect = false if don't need to redirect
  async popUp(type, data, redirect: any = false) {
    const component = PopUpComponent;
    const componentProps = {
      type,
      data,
      redirect,
    };
    const modal = await this.modal(component, componentProps);
    return modal;
  }

  async modal(component, componentProps, options?, event?): Promise<void> {
    return this.modalOnly(component, componentProps, options, event);
  }

  async modalOnly(component, componentProps, options?, event?): Promise<void> {
    const modalConfig = this.modalConfig({ component, componentProps }, options);
    return this.modalService.addModal(modalConfig, event);
  }

  async alert(config: AlertOptions) {
    const alert = await this.alertController.create(config);
    return await alert.present();
  }

  // toast message pop up, by default, shown success message for 2 seconds.
  async presentToast(message: string, options?: any) {
    let toastOptions: ToastOptions = {
      message: message,
      duration: 3000,
      position: 'top',
      color: 'danger'
    };
    toastOptions = Object.assign(toastOptions, options);
    const toast = await this.toastController.create(toastOptions);
    return toast.present();
  }

  /**
   * show assessment submission response status toast
   *
   * @param   {boolean}  isFail  flag to show success or fail message
   *
   * @return  {Promise<void>}
   */
  assessmentSubmittedToast(option?: {
    isFail: boolean;
    label?: string;
  }): void | Promise<void> {
    if (!this.connection.isOnline) {
      return alert('You are offline, please check your internet connection and try again.');
    }

    if (option?.isFail === true) {
      if (option?.label) {
        return this.presentToast(option.label, {
          color: 'danger',
          icon: 'close-circle'
        });
      }

      return this.presentToast($localize`Submission failed. Please try again.`, {
        color: 'danger',
        icon: 'close-circle'
      });
    }
    return this.presentToast($localize`Assessment Submitted.`, {
      color: 'success',
      icon: 'checkmark-circle'
    });
  }

  /**
   * pop up achievement notification and detail
   * sample call for notification popup
   * NotificationsService.achievementPopUp('notification', {
   *   image: 'url' (optinal - have default one)
   *   name: "Sample Headding"
   * });
   * sample call for info popup
   * NotificationsService.achievementPopUp('', {
   *    image: 'url' (optinal - have default one)
   *    name: "Sample Headding",
   *    points: "100",
   *    description: "qwert yuiop asdfg asdff"
   * });
   */
  async achievementPopUp(type: string, achievement: Achievement, options?) {
    const component = AchievementPopUpComponent;
    const componentProps = {
      type,
      achievement
    };
    if (type === 'notification') {
      if (environment.demo) {
        return this.demo.normalResponse();
      }
      this.markTodoItemAsDone('Achievement-' + achievement.id).subscribe();
    }
    const modal = await this.modal(component, componentProps, {
      cssClass: this.utils.isMobile() ? 'practera-popup achievement-popup mobile-view' : 'practera-popup achievement-popup desktop-view',
      keyboardClose: false,
      backdropDismiss: false
    },
      () => { // Added to support accessibility - https://www.w3.org/TR/WCAG21/#no-keyboard-trap
        if (options && options.activeElement && options.activeElement.focus) {
          options.activeElement.focus();
        }
      });

    return modal;
  }

  /**
   * pop up to show user click on locked team assessment.
   * @param data
   * sample data object
   * NotificationsService.lockTeamAssessmentPopUp({
   *    image: 'url' (optinal - have default one),
   *    name: "Alice"
   * });
   */
  async lockTeamAssessmentPopUp(data, event) {
    const componentProps = {
      name: data.name,
      image: data.image
    };
    const component = LockTeamAssessmentPopUpComponent;
    const modal = await this.modal(
      component, componentProps,
      {
        cssClass: this.utils.isMobile() ? 'practera-popup lock-assessment-popup' : 'practera-popup lock-assessment-popup desktop-view',
      },
      event
    );
    return modal;
  }

  /**
   * pop up activity complete notification and detail
   *
   * sample call for activity complete popup
   * NotificationsService.activityCompletePopUp(3);
   *
   */
  async activityCompletePopUp(activityId: number, activityCompleted: boolean): Promise<void> {
    let cssClass = 'practera-popup activity-complete-popup';
    if (this.utils.isMobile()) {
      cssClass += ' mobile-view';
    }
    return this.modal(
      ActivityCompletePopUpComponent,
      { activityId, activityCompleted },
      {
        cssClass: cssClass,
        keyboardClose: false,
        backdropDismiss: false
      }
    );
  }

  async loading(opts?: LoadingOptions): Promise<void> {
    const loading = await this.loadingController.create(opts || {
      spinner: 'dots',

    });
    return loading.present();
  }


  /**
   * trigger reviewer rating modal
   *
   * @param   {number}          reviewId  submission review record id
   * @param   {string[]<void>}  redirect  array: routeUrl, boolean: disable
   *                                      routing (stay at same component)
   *
   * @return  {Promise<void>}             deferred ionic modal
   */
  async popUpReviewRating(reviewId, redirect: string[] | boolean): Promise<void> {
    return this.modalOnly(ReviewRatingComponent, {
      reviewId,
      redirect
    }, {
      id: `review-popup-${reviewId}`,
      backdropDismiss: false,
    });
  }

  /**
   * Pop up the fast feedback modal window
   */
  fastFeedbackModal(
    props: {
      questions?: Array<Question>;
      meta?: Meta | Object;
    },
    modalOnly: boolean = false
  ): Promise<HTMLIonModalElement | void> {
    if (modalOnly) {
      return this.modalOnly(FastFeedbackComponent, props, {
        backdropDismiss: false,
        showBackdrop: false,
      });
    }

    return this.modal(FastFeedbackComponent, props, {
      backdropDismiss: false,
      showBackdrop: false,
    });
  }

  getTodoItems(): Observable<any> {
    return this.request.get(api.get.todoItem, {
      params: {
        project_id: this.storage.getUser().projectId
      }
    }).pipe(map(response => {
      if (response.success && response.data) {
        const normalised = this._normaliseTodoItems(response.data);
        this.notifications = normalised;
        this._notification$.next(this.notifications);
        return normalised;
      }
    }));
  }

  private _normaliseTodoItems(data): Array<TodoItem> {
    let todoItems = [];
    let unlockedTasks: UnlockedTask[] = [];
    if (!Array.isArray(data)) {
      this.request.apiResponseFormatError('TodoItem array format error');
      return [];
    }

    data.forEach(todoItem => {
      if (!this.utils.has(todoItem, 'identifier') ||
        !this.utils.has(todoItem, 'is_done') ||
        !this.utils.has(todoItem, 'meta')) {
        return this.request.apiResponseFormatError('TodoItem format error');
      }
      // skip if the todoitem is already done
      if (todoItem.is_done) {
        return;
      }

      // todo item for user to see the feedback
      if (todoItem.identifier.includes('AssessmentSubmission-')) {
        todoItems = this._addTodoItemForFeedbackAvailable(todoItem, todoItems);
      }

      // todo item for user to do the review
      if (todoItem.identifier.includes('AssessmentReview-')) {
        todoItems = this._addTodoItemForReview(todoItem, todoItems);
      }

      // todo item for user to see the achievement earned message
      if (todoItem.identifier.includes('Achievement-')) {
        this.achievementPopUp('notification', {
          id: todoItem.meta.id,
          name: todoItem.meta.name,
          description: todoItem.meta.description,
          points: todoItem.meta.points,
          image: todoItem.meta.badge
        });
      }

      if (todoItem.name === 'New Item') {
        unlockedTasks.push({ [UnlockIndicatorModel[todoItem.model]]: todoItem.foreign_key });
      }

      if (todoItem.identifier.includes('EventReminder-')) {
        // when we get a Event Reminder todo item,
        // fire an 'event-reminder' event, same as when we get this from Pusher
        this.utils.broadcastEvent('event-reminder', {
          meta: todoItem.meta
        });
      }

      // todo item for user to submit the assessment
      if (todoItem.identifier.includes('AssessmentSubmissionReminder-')) {
        todoItems = this._addTodoItemSubmissionReminder(todoItem, todoItems);
      }
    });

    if (unlockedTasks.length > 0) {
      this.unlockIndicatorService.unlockTasks(unlockedTasks);
    }
    return todoItems;
  }

  private _addTodoItemForFeedbackAvailable(todoItem, todoItems) {
    const item: TodoItem = {
      type: '',
      name: '',
      description: '',
      time: '',
      meta: {}
    };
    item.type = 'feedback_available';
    if (!this.utils.has(todoItem, 'meta.assessment_name') ||
      !this.utils.has(todoItem, 'meta.reviewer_name') ||
      !this.utils.has(todoItem, 'created')) {
      this.request.apiResponseFormatError('TodoItem meta format error');
      return todoItems;
    }
    item.name = $localize`New Feedback`;
    item.description = $localize`Feedback received from ${todoItem.meta.reviewer_name} for ${todoItem.meta.assessment_name}`;
    item.time = this.utils.timeFormatter(todoItem.created);
    item.meta = todoItem.meta;
    todoItems.push(item);
    return todoItems;
  }

  private _addTodoItemForReview(todoItem, todoItems) {
    const item: TodoItem = {
      type: '',
      name: '',
      description: '',
      time: '',
      meta: {}
    };
    item.type = 'review_submission';
    if (!this.utils.has(todoItem, 'meta.assessment_name') ||
      !this.utils.has(todoItem, 'created')) {
      this.request.apiResponseFormatError('TodoItem meta format error');
      return todoItems;
    }
    item.name = $localize`New Submission for Review`;
    item.description = $localize`Submission received from ${todoItem.meta.submitter_name} for ${todoItem.meta.assessment_name}`;
    item.time = this.utils.timeFormatter(todoItem.created);
    item.meta = todoItem.meta;
    todoItems.push(item);
    return todoItems;
  }

  private _addTodoItemSubmissionReminder(todoItem, todoItems) {
    const item: TodoItem = {
      type: '',
      name: '',
      description: '',
      time: '',
      meta: {}
    };
    item.type = 'assessment_submission_reminder';
    if (!this.utils.has(todoItem, 'meta.assessment_name') ||
      !this.utils.has(todoItem, 'meta.context_id') ||
      !this.utils.has(todoItem, 'meta.activity_id') ||
      !this.utils.has(todoItem, 'meta.assessment_id') ||
      !this.utils.has(todoItem, 'meta.due_date')) {
      this.request.apiResponseFormatError('TodoItem meta format error');
      return todoItems;
    }
    item.name = $localize`Submission Reminder`;
    item.description = $localize`Remember to send ${todoItem.meta.assessment_name} task`;
    if (todoItem?.meta?.due_date) {
      item.description = $localize`Remember to send ${todoItem.meta.assessment_name} task before ${this.utils.dueDateFormatter(todoItem.meta.due_date, true)}`;
    }
    item.time = this.utils.timeFormatter(todoItem.created);
    item.meta = todoItem.meta;
    todoItems.push(item);
    return todoItems;
  }

  getChatMessage() {
    return this.apolloService.chatGraphQLQuery(
      `query getChannels {
        channels{
          name unreadMessageCount lastMessage lastMessageCreated
        }
      }`
    ).pipe(map(response => {
      if (response.data) {
        const normalized = this._normaliseChatMessage(response.data);
        if (!this.utils.isEmpty(normalized)) {
          this._addChatTodoItem(normalized);
        } else {
          this._removeChatTodoItem();
        }

        this._notification$.next(this.notifications);
        return normalized;
      }
    }));
  }

  private _normaliseChatMessage(data): TodoItem {
    const result = JSON.parse(JSON.stringify(data.channels));
    if (!Array.isArray(result)) {
      this.request.apiResponseFormatError('Chat array format error');
      return {};
    }
    let unreadMessages = 0;
    let noOfChats = 0;
    let todoItem: TodoItem;
    result.forEach(message => {
      if (!this.utils.has(message, 'unreadMessageCount') ||
        !this.utils.has(message, 'name') ||
        !this.utils.has(message, 'lastMessage') ||
        !this.utils.has(message, 'lastMessageCreated')) {
        return this.request.apiResponseFormatError('Chat object format error');
      }

      // if there is any unread message
      if (message.unreadMessageCount > 0) {
        todoItem = {
          type: 'chat',
          name: '',
          description: '',
          time: '',
        };

        todoItem.name = $localize`Unread Messages`;
        unreadMessages += message.unreadMessageCount;
        noOfChats++;
        todoItem.time = this.utils.timeFormatter(message.lastMessageCreated);
        todoItem.unreadMessages = unreadMessages;
        todoItem.description = $localize`You have ${unreadMessages} unread messages in ${noOfChats} chats`;
      }
    });

    // group the chat notifiations
    if (unreadMessages === 1) {
      todoItem.name = $localize`Unread Message`;
      todoItem.description = $localize`You have 1 unread message in 1 chat`;
    }

    if (todoItem) {
      todoItem.meta = {};
    }

    return todoItem;
  }

  /**
   * Will add chat notification to the notification list.
   *  - before it add check is there any other chat notification there.
   *  - if it is, it will replace that with the new chat notification todo item.
   *  - if not will add chat notification todo item to notification list.
   * and after this will update _notifications$ subject to broadcast the new update
   * @param chatTodoItem normalized Todo item for chat
   */
  private _addChatTodoItem(chatTodoItem) {
    let currentChatTodoIndex = -1;
    const currentChatTodo = this.notifications?.find((todoItem, index) => {
      if (todoItem.type === 'chat') {
        currentChatTodoIndex = index;
        return true;
      }
    });
    if (currentChatTodo) {
      this.notifications.splice(currentChatTodoIndex, 1);
    }
    this.notifications.push(chatTodoItem);
  }

  /**
  * Will remove chat notification to the notification list.
  * This method use when there are no unread messages but old chat notification still on the notification list.
  *  - before it execute any codes for remove notifications. it checks is there any chat notification todo items.
  *  - if it is, it will remove chat notification todo item from notification list
  * and after this will update _notifications$ subject to broadcast the new update
  */
  private _removeChatTodoItem() {
    let currentChatTodoIndex = -1;
    const currentChatTodo = this.notifications?.find((todoItem, index) => {
      if (todoItem.type === 'chat') {
        currentChatTodoIndex = index;
        return true;
      }
    });
    if (currentChatTodo) {
      this.notifications.splice(currentChatTodoIndex, 1);
    }
  }

  /**
   * When we get a notification event from Pusher, normalise the data to todo item and return it.
   * @param  {Obj}   event [The event data get from Pusher]
   * @return {TodoItem}       [Normalised todo item]
   */
  getTodoItemFromEvent(event): TodoItem {
    if (!this.utils.has(event, 'type')) {
      this.request.apiResponseFormatError('Pusher notification event format error');
      return {};
    }

    let result: TodoItem;
    switch (event.type) {
      // This is a feedback available event
      case 'assessment_review_published':
        if (!this.utils.has(event, 'meta.AssessmentReview.assessment_name') ||
          !this.utils.has(event, 'meta.AssessmentReview.reviewer_name') ||
          !this.utils.has(event, 'meta.AssessmentReview.published_date') ||
          !this.utils.has(event, 'meta.AssessmentReview.assessment_id') ||
          !this.utils.has(event, 'meta.AssessmentReview.activity_id') ||
          !this.utils.has(event, 'meta.AssessmentReview.context_id')
        ) {
          this.request.apiResponseFormatError('Pusher notification event meta format error');
          return {};
        }
        const review = event.meta.AssessmentReview;
        result = {
          type: 'feedback_available',
          name: $localize`New Feedback`,
          description: $localize`Feedback received from ${review.reviewer_name} for ${review.assessment_name}`,
          time: this.utils.timeFormatter(review.published_date),
          meta: {
            activity_id: review.activity_id,
            context_id: review.context_id,
            assessment_id: review.assessment_id,
            assessment_name: review.assessment_name,
            reviewer_name: review.reviewer_name,
          }
        };
        break;

      // This is a submission ready for review event
      case 'assessment_review_assigned':
        if (!this.utils.has(event, 'meta.AssessmentReview.assessment_name') ||
          !this.utils.has(event, 'meta.AssessmentReview.assigned_date') ||
          !this.utils.has(event, 'meta.AssessmentReview.assessment_id') ||
          !this.utils.has(event, 'meta.AssessmentReview.context_id') ||
          !this.utils.has(event, 'meta.AssessmentReview.assessment_submission_id')
        ) {
          this.request.apiResponseFormatError('Pusher notification event meta format error');
          return {};
        }
        result = {
          type: 'review_submission',
          name: $localize`New Submission for Review`,
          description: $localize`Submission received from ${event.meta.AssessmentReview.submitter_name} for ${event.meta.AssessmentReview.assessment_name}`,
          time: this.utils.timeFormatter(event.meta.AssessmentReview.assigned_date),
          meta: {
            context_id: event.meta.AssessmentReview.context_id,
            assessment_id: event.meta.AssessmentReview.assessment_id,
            assessment_name: event.meta.AssessmentReview.assessment_name,
            assessment_submission_id: event.meta.AssessmentReview.assessment_submission_id,
          }
        };
        break;

      case 'assessment_submission_reminder':
        if (!this.utils.has(event, 'meta.AssessmentSubmissionReminder.assessment_name') ||
          !this.utils.has(event, 'meta.AssessmentSubmissionReminder.context_id') ||
          !this.utils.has(event, 'meta.AssessmentSubmissionReminder.activity_id') ||
          !this.utils.has(event, 'meta.AssessmentSubmissionReminder.assessment_id') ||
          !this.utils.has(event, 'meta.AssessmentSubmissionReminder.due_date') ||
          !this.utils.has(event, 'meta.AssessmentSubmissionReminder.reminded_date')
        ) {
          this.request.apiResponseFormatError('TodoItem meta format error');
          return {};
        }
        result = {
          type: 'assessment_submission_reminder',
          name: $localize`Submission Reminder`,
          description: $localize`Remember to send ${event.meta.AssessmentSubmissionReminder.assessment_name} task`,
          time: this.utils.timeFormatter(event.meta.AssessmentSubmissionReminder.reminded_date),
          meta: {
            context_id: event.meta.AssessmentSubmissionReminder.context_id,
            assessment_id: event.meta.AssessmentSubmissionReminder.assessment_id,
            assessment_name: event.meta.AssessmentSubmissionReminder.assessment_name,
            activity_id: event.meta.AssessmentSubmissionReminder.activity_id,
            due_date: event.meta.AssessmentSubmissionReminder.due_date
          }
        };

        if (event?.meta?.AssessmentSubmissionReminder?.due_date) {
          result.description = $localize`Remember to send ${event.meta.AssessmentSubmissionReminder.assessment_name} task before ${this.utils.dueDateFormatter(event.meta.AssessmentSubmissionReminder.due_date, true)}`;
        }
        break;
    }

    if (!this.utils.isEmpty(result)) {
      this.addNewNotification(result);
    }

    return result;
  }

  /**
   * When we get a notification event from Pusher about event reminder, we are querying API to get the event detail and normalise it
   * @param {Obj} data [The event data from Pusher notification]
   */
  getReminderEvent(data) {
    if (!this.utils.has(data, 'meta.id')) {
      this.request.apiResponseFormatError('Pusher notification event format error');
      return of(null);
    }
    return this.request.get(api.get.events, {
      params: {
        type: 'activity_session',
        id: data.meta.id
      }
    }).pipe(map(response => {
      if (this.utils.isEmpty(response.data)) {
        return null;
      }
      const event = this.eventsService.normaliseEvents(response.data)[0];
      if (event.isPast) {
        // mark the todo item as done if event starts
        this.postEventReminder(event);
        return null;
      }

      this._eventReminder$.next(event);
      return event;
    }));
  }

  postEventReminder(event) {
    return this.markTodoItemAsDone(`EventReminder-${event.id}`).subscribe();
  }

  /**
   * Mark the todo item as done
   * @param {Obj} todoItem 
   */
  markTodoItemAsDone(identifier: string) {
    return this.request.post({
      endPoint: api.post.todoItem,
      data: {
        identifier,
        project_id: this.storage.getUser().projectId,
        is_done: true
      }
    });
  }
}
