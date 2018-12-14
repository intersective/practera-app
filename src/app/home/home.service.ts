import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
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

  activityId: number = 0;
  
  constructor(
    private storage: BrowserStorageService
  ) {}

  getProgramName() {
    return of(this.storage.getUser().programName);
  }

  getTodoItems() {
    return of();
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
