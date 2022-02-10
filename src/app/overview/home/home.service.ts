import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';
import { Activity } from '../project/project.service';
import { Question, Meta} from '../../fast-feedback/fast-feedback.service';
import { NotificationService } from '@shared/notification/notification.service';
import { Event, EventListService } from '@app/event-list/event-list.service';
import { SharedService } from '@services/shared.service';

/**
 * @name api
 * @description list of api endpoint involved in this service
 * @type {Object}
 */
const api = {
  get: {
    todoItem: 'api/v2/motivations/todo_item/list.json',
    progress: 'api/v2/motivations/progress/list.json',
    events: 'api/v2/act/event/list.json',
  },
  post: {
    todoItem: 'api/v2/motivations/todo_item/edit.json'
  }
};

export interface TodoItem {
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

@Injectable({
  providedIn: 'root'
})

export class HomeService {

  constructor(
    private storage: BrowserStorageService,
    private request: RequestService,
    private utils: UtilsService,
    private notification: NotificationService,
    private eventsService: EventListService,
    public sharedService: SharedService
  ) {}

  getTodoItems() {
    return this.request.get(api.get.todoItem, {
        params: {
          project_id: this.storage.getUser().projectId
        }
      })
      .pipe(map(response => {
        if (response.success && response.data) {
          return this._normaliseTodoItems(response.data);
        }
      }));
  }

  private _normaliseTodoItems(data): Array<TodoItem> {
    let todoItems = [];
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
      if (todoItem.is_done) {
        return ;
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
        this.notification.achievementPopUp('notification', {
          id: todoItem.meta.id,
          name: todoItem.meta.name,
          description: todoItem.meta.description,
          points: todoItem.meta.points,
          image: todoItem.meta.badge
        });
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
    item.name = todoItem.meta.assessment_name;
    item.description = todoItem.meta.reviewer_name + ' has provided feedback';
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
    item.name = todoItem.meta.assessment_name;
    item.description = 'Please review the assessment';
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
    item.name = todoItem.meta.assessment_name;
    item.description = this.sharedService.dueDateFormatter(todoItem.meta.due_date);
    item.time = this.utils.timeFormatter(todoItem.created);
    item.meta = todoItem.meta;
    todoItems.push(item);
    return todoItems;
  }

  getChatMessage() {
    return this.request.chatGraphQLQuery(
      `query getChannels {
        channels{
          name unreadMessageCount lastMessage lastMessageCreated
        }
      }`,
      {},
      {
        noCache: true
      }
    )
    .pipe(map(response => {
      if (response.data) {
        return this._normaliseChatMessage(response.data);
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
      if (message.unreadMessageCount > 0) {
        todoItem = {
          type: 'chat',
          name: '',
          description: '',
          time: '',
        };
        unreadMessages += message.unreadMessageCount;
        noOfChats ++;
        todoItem.name = message.name;
        todoItem.description = message.lastMessage;
        todoItem.time = this.utils.timeFormatter(message.lastMessageCreated);
      }
    });
    if (unreadMessages > 1) {
      // group the chat notifiations
      todoItem.name = unreadMessages + ' messages from ' + noOfChats + ' chats';
      todoItem.meta = {};
    }
    return todoItem;
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
        return {
          type: 'feedback_available',
          name: event.meta.AssessmentReview.assessment_name,
          description: event.meta.AssessmentReview.reviewer_name + ' has provided feedback',
          time: this.utils.timeFormatter(event.meta.AssessmentReview.published_date),
          meta: {
            activity_id: event.meta.AssessmentReview.activity_id,
            context_id: event.meta.AssessmentReview.context_id,
            assessment_id: event.meta.AssessmentReview.assessment_id,
            assessment_name: event.meta.AssessmentReview.assessment_name,
            reviewer_name: event.meta.AssessmentReview.reviewer_name,
          }
        };

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
        return {
          type: 'review_submission',
          name: event.meta.AssessmentReview.assessment_name,
          description: 'Please review the assessment',
          time: this.utils.timeFormatter(event.meta.AssessmentReview.assigned_date),
          meta: {
            context_id: event.meta.AssessmentReview.context_id,
            assessment_id: event.meta.AssessmentReview.assessment_id,
            assessment_name: event.meta.AssessmentReview.assessment_name,
            assessment_submission_id: event.meta.AssessmentReview.assessment_submission_id,
          }
        };

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
        return {
          type: 'assessment_submission_reminder',
          name: event.meta.AssessmentSubmissionReminder.assessment_name,
          description: this.sharedService.dueDateFormatter(event.meta.AssessmentSubmissionReminder.due_date),
          time: this.utils.timeFormatter(event.meta.AssessmentSubmissionReminder.reminded_date),
          meta: {
            context_id: event.meta.AssessmentSubmissionReminder.context_id,
            assessment_id: event.meta.AssessmentSubmissionReminder.assessment_id,
            assessment_name: event.meta.AssessmentSubmissionReminder.assessment_name,
            activity_id: event.meta.AssessmentSubmissionReminder.activity_id,
            due_date: event.meta.AssessmentSubmissionReminder.due_date
          }
        };
    }
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
      })
      .pipe(map(response => {
        if (this.utils.isEmpty(response.data)) {
          return null;
        }
        const event = this.eventsService.normaliseEvents(response.data)[0];
        if (event.isPast) {
          // mark the todo item as done if event starts
          this.postEventReminder(event);
          return null;
        }
        return event;
      }));
  }

  postEventReminder(event) {
    return this.request.post(api.post.todoItem, {
      project_id: this.storage.getUser().projectId,
      identifier: 'EventReminder-' + event.id,
      is_done: true
    }).subscribe();
  }

}
