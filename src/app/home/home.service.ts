import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';
import { Activity } from '../project/project.service';
import { FastFeedbackComponent } from '../fast-feedback/fast-feedback.component';
import { Question, Meta} from '../fast-feedback/fast-feedback.service';
import { NotificationService } from '@shared/notification/notification.service';

/**
 * @name api
 * @description list of api endpoint involved in this service
 * @type {Object}
 */
const api = {
  activity: 'api/activities.json',
  todoItem: 'api/v2/motivations/todo_item/list.json',
  chat: 'api/v2/message/chat/list.json',
  progress: 'api/v2/motivations/progress/list.json'
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
  };
}

@Injectable({
  providedIn: 'root'
})

export class HomeService {

  currentActivityId: number = 0;

  constructor(
    private storage: BrowserStorageService,
    private request: RequestService,
    private utils: UtilsService,
    private notification: NotificationService,
  ) {}

  getProgramName() {
    return of(this.storage.getUser().programName);
  }

  getTodoItems() {
    return this.request.get(api.todoItem, {
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
    });
    return todoItems;
  }

  private _addTodoItemForFeedbackAvailable(todoItem, todoItems) {
    let item: TodoItem = {
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
    let item: TodoItem = {
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

  getChatMessage() {
    return this.request.get(api.chat)
      .pipe(map(response => {
        if (response.success && response.data) {
          return this._normaliseChatMessage(response.data);
        }
      }));
  }

  private _normaliseChatMessage(data): TodoItem {
    if (!Array.isArray(data)) {
      this.request.apiResponseFormatError('Chat array format error');
      return {};
    }
    let unreadMessages = 0;
    let noOfChats = 0;
    let todoItem: TodoItem;
    data.forEach(data => {
      if (!this.utils.has(data, 'unread_messages') ||
          !this.utils.has(data, 'name') ||
          !this.utils.has(data, 'last_message') ||
          !this.utils.has(data, 'last_message_created')) {
        return this.request.apiResponseFormatError('Chat object format error');
      }
      if (data.unread_messages > 0) {
        todoItem = {
          type: 'chat',
          name: '',
          description: '',
          time: '',
          meta: {}
        };
        unreadMessages += data.unread_messages;
        noOfChats ++;
        todoItem.name = data.name;
        todoItem.description = data.last_message;
        todoItem.time = this.utils.timeFormatter(data.last_message_created);
      }
    });
    if (unreadMessages > 1) {
      todoItem.name = unreadMessages + ' messages from ' + noOfChats + ' chats';
    }
    return todoItem;
  }

  getProgress() {
    return this.request.get(api.progress, {
        params: {
          model: 'project',
          model_id: this.storage.getUser().projectId,
          scope: 'activity'
        }
      })
      .pipe(map(response => {
        if (response.success && response.data) {
          return this._normaliseProgress(response.data);
        }
      }));
  }

  private _normaliseProgress(data) {
    if (!this.utils.has(data, 'Project.progress') ||
        !this.utils.has(data, 'Project.Milestone') ||
        !Array.isArray(data.Project.Milestone)) {
      this.request.apiResponseFormatError('Progress format error');
      return 0;
    }

    this._getCurrentActivityId(data);

    if (data.Project.progress > 1) {
      data.Project.progress = 1;
    }
    return Math.round(data.Project.progress * 100);
  }

  private _getCurrentActivityId(data) {
    // initialise current activity id
    this.currentActivityId = 0;
    data.Project.Milestone.forEach(this._loopThroughMilestones, this);
    // regard last activity as the current activity if all activities are finished
    if (this.currentActivityId == 0) {
      let milestones = data.Project.Milestone;
      let activities = milestones[milestones.length - 1].Activity;
      this.currentActivityId = activities[activities.length - 1].id;
    }
  }

  private _loopThroughMilestones(milestone) {
    if (this.currentActivityId > 0) {
      return;
    }
    if (!this.utils.has(milestone, 'Activity') ||
        !Array.isArray(milestone.Activity)) {
      this.request.apiResponseFormatError('Progress.Milestone format error');
      return ;
    }
    milestone.Activity.forEach(this._loopThroughActivities, this);
  }

  private _loopThroughActivities(activity) {
    if (this.currentActivityId > 0) {
      return;
    }
    if (!this.utils.has(activity, 'progress') ||
        !this.utils.has(activity, 'id')) {
      this.request.apiResponseFormatError('Progress.Milestone.Activity format error');
      return ;
    }
    if (activity.progress < 1) {
      this.currentActivityId = activity.id
    }
  }

  getCurrentActivity() {
    return this.request.get(api.activity, {
        params: {
          id: this.currentActivityId
        }
      })
      .pipe(map(response => {
        if (response.success && response.data) {
          return this._normaliseActivity(response.data);
        }
      }));
  }

  private _normaliseActivity(data): Activity {
    if (!Array.isArray(data) ||
        !this.utils.has(data[0], 'Activity.name') ||
        !this.utils.has(data[0], 'Activity.is_locked')) {
      this.request.apiResponseFormatError('Activity format error');
      return {
        id: null,
        name: '',
        isLocked: false,
        leadImage: ''
      };
    }
    let thisActivity = data[0];
    return {
      id: this.currentActivityId,
      name: thisActivity.Activity.name,
      isLocked: thisActivity.Activity.is_locked,
      leadImage: (thisActivity.Activity.lead_image ? thisActivity.Activity.lead_image : '')
    };
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
      case "assessment_review_published":
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
      case "assessment_review_assigned":
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

    }
  }

  /**
   * Pop up the fast feedback modal window
   */
  async popUpFastFeedback(props: { questions?: Array<Question>, meta?: Meta } = {}) {
    const modal = await this.notification.modal(FastFeedbackComponent, props, {
      backdropDismiss: false,
      showBackdrop: false,
    });
  }

}
