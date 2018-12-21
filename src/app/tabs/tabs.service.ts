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
  todoItem: 'api/v2/motivations/todo_item/list.json',
  chat: 'api/v2/message/chat/list.json'
};

@Injectable({
  providedIn: 'root'
})

export class TabsService {

  constructor(
    private storage: BrowserStorageService,
    private request: RequestService,
    private utils: UtilsService,
  ) {}

  getNoOfTodoItems() {
    return this.request.get(api.todoItem, {
        params: {
          project_id: this.storage.getUser().projectId
        }
      })
      .pipe(map(response => {
        if (response.success && response.data) {
          return this._normaliseNoOfTodoItems(response.data);
        }
      }));
  }

  private _normaliseNoOfTodoItems(data) {
    let noOfTodoItems = 0;
    if (!Array.isArray(data)) {
      this.request.apiResponseFormatError('TodoItem array format error');
      return 0;
    }
    data.forEach(todoItem => {
      if (!this.utils.has(todoItem, 'is_done')) {
        return this.request.apiResponseFormatError('TodoItem format error');
      }
      if (todoItem.is_done) {
        return ;
      }
      noOfTodoItems ++;
    });
    return noOfTodoItems;
  }

  getNoOfChats() {
    return this.request.get(api.chat)
      .pipe(map(response => {
        if (response.success && response.data) {
          return this._normaliseNoOfChats(response.data);
        }
      }));
  }

  private _normaliseNoOfChats(data) {
    if (!Array.isArray(data)) {
      this.request.apiResponseFormatError('Chat array format error');
      return 0;
    }
    let noOfChats = 0;
    data.forEach(data => {
      if (!this.utils.has(data, 'unread_messages')) {
        return this.request.apiResponseFormatError('Chat object format error');
      }
      if (data.unread_messages > 0) {
        noOfChats ++;
      }
    });
    return noOfChats;
  }

}
