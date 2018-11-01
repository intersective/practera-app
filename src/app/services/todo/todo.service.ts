import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  todo = [
    { todoType: 'review',
      assessmentName :'demo assessmnet',
      teamName: 'Team1',
      time: 'today',
      reviewer : {
        name:'mentor1',
        assignOn: 'today'

      }
    },
    { todoType: 'review',
      assessmentName :'demo assessmnet2',
      teamName: 'Team1',
      time: '1/1/2009',
      reviewer : {
        name:'mentor1',
        assignOn: 'today'

      }
    }
];

  constructor() {};
}
