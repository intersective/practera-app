import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  todo = [
    { 
      todoType: 'feedback',
      assessmentName :'demo assessmnet',
      teamName: 'Team1',
      time: 'today',
      reviewer : {
        name:'mentor1',
        assignOn: 'today'
      }
    }
  ];

  constructor() {};
}
