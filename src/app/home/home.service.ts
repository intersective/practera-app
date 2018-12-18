import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BrowserStorageService } from '@services/storage.service';

@Injectable({
  providedIn: 'root'
})

export class HomeService {
  todo = [
    { id:1,
      todoType: 'review',
      assessmentName :'demo assessmnet',
      teamName: 'Team1',
      time: 'today',
      reviewer : {
        name:'mentor1',
        assignOn: 'today'
      }
    },
    { id:2,
      todoType: 'review',
      assessmentName :'demo assessmnet2',
      teamName: 'Team1',
      time: '1/1/2009',
      reviewer : {
        name:'mentor1',
        assignOn: 'today'
      }
    }
  ];
  activity = {
    id: 1,
    name :'Activity Name 1',
    progress: 0.65,
    hasFeedback: true,
    is_hidden: false,
    is_locked: false
  };

  constructor(
    private storage: BrowserStorageService
  ) {};

  getProgramName() {
    return of(this.storage.getUser().programName);
  }

  getTodoItems() {
    return this.todo;
  }

  getCurrentActivity() {
    return this.activity;
  }
}
