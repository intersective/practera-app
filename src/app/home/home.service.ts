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
  chat: 'api/v2/message/chat/list_messages.json',
  progress: 'api/v2/motivations/progress/list.json'
};

export interface TodoItem {
  type: string;
  name: string;
  description: string;
  time: string;
  meta: any;
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
      let item: TodoItem = {
        type: '',
        name: '',
        description: '',
        time: '',
        meta: {}
      }
      // todo item for user to see the feedback
      if (todoItem.identifier.includes('AssessmentSubmission-')) {
        item.type = 'feedback_available';
        if (!this.utils.has(todoItem, 'meta.assessment_name') ||
            !this.utils.has(todoItem, 'meta.reviewer_name') ||
            !this.utils.has(todoItem, 'created')) {
          return this.request.apiResponseFormatError('TodoItem meta format error');
        }
        item.name = todoItem.meta.assessment_name;
        item.description = todoItem.meta.reviewer_name + ' has provided feedback';
        item.time = this._timeFormat(todoItem.created);
        item.meta = todoItem.meta;
        todoItems.push(item);
      }

      // todo item for user to do the review
      if (todoItem.identifier.includes('AssessmentReview-')) {
        item.type = 'review_submission';
        if (!this.utils.has(todoItem, 'meta.assessment_name') ||
            !this.utils.has(todoItem, 'created')) {
          return this.request.apiResponseFormatError('TodoItem meta format error');
        }
        item.name = todoItem.meta.assessment_name;
        item.description = 'Please review the assessment';
        item.time = this._timeFormat(todoItem.created);
        item.meta = todoItem.meta;
        todoItems.push(item);
      }
    });
    return todoItems;
  }

  private _timeFormat(time: string) {
    let date = new Date(time);
    return date.toLocaleString('en-GB', {
      month: 'short',
      day: 'numeric'
    });
  }

  getChatMessages() {
    return of();
  }

  getProgress() {
    return of();
  }

  getCurrentActivity() {
     return of();
  }
}
