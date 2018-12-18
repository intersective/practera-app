import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';

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
  meta?: any;
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
    item.time = this._timeFormater(todoItem.created);
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
    item.time = this._timeFormater(todoItem.created);
    item.meta = todoItem.meta;
    todoItems.push(item);
    return todoItems;
  }

  private _timeFormater(time: string) {
    let date = new Date(time);
    return date.toLocaleString('en-GB', {
      month: 'short',
      day: 'numeric'
    });
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
    let todoItem: TodoItem = {
      type: 'chat',
      name: '',
      description: '',
      time: '',
      meta: {}
    };
    data.forEach(data => {
      if (!this.utils.has(data, 'unread_messages') || 
          !this.utils.has(data, 'name') || 
          !this.utils.has(data, 'last_message') ||
          !this.utils.has(data, 'last_message_created')) {
        return this.request.apiResponseFormatError('Chat object format error');
      }
      if (data.unread_messages > 0) {
        unreadMessages += data.unread_messages;
        noOfChats ++;
        todoItem.name = data.name;
        todoItem.description = data.last_message;
        todoItem.time = this._timeFormater(data.last_message_created);
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

    data.Project.Milestone.forEach(this._getCurrentActivityId);

    if (data.Project.progress > 1) {
      data.Project.progress = 1;
    }
    return Math.round(data.Project.progress * 100);
  }

  private _getCurrentActivityId(milestone) {
    if (this.currentActivityId > 0) {
      return;
    }
    if (!this.utils.has(milestone, 'Activity') ||
        !Array.isArray(milestone.Activity)) {
      this.request.apiResponseFormatError('Progress.Milestone format error');
      return ;
    }
    milestone.Activity.forEach(this._loopThroughActivities);
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

  private _normaliseActivity(data) {
    if (!Array.isArray(data) ||
        !this.utils.has(data[0], 'Activity.name') || 
        !this.utils.has(data[0], 'Activity.is_locked')) {
      this.request.apiResponseFormatError('Activity format error');
      return {};
    }
    let thisActivity = data[0];
    return {
      id: this.currentActivityId,
      name: thisActivity.Activity.name,
      isLocked: thisActivity.Activity.is_locked
    };
  }

}
