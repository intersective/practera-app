import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Task {
  id: number,
  type: string,
  name: string,
  status: string,
  contextId?: number,
  feedbackReviewed?: boolean
}

export interface Activity {
  name: string,
  description?: string,
  tasks: Array<Task>
}

@Injectable({
  providedIn: 'root'
})

export class ActivityService {

  activity = {
    name: 'Activity1',
    description: 'This is the description of activity 1',
    tasks: [
      {
        id: 1,
        type: 'Topic',
        name: 'Topic name',
        status: 'done'
      },
      {
        id: 1,
        contextId: 1,
        type: 'Assessment',
        name: 'Assessment name',
        status: ''
      },
      {
        id: 2,
        contextId: 2,
        type: 'Assessment',
        name: 'Assessment name',
        status: 'done'
      },
      {
        id: 3,
        contextId: 3,
        type: 'Assessment',
        name: 'Assessment name',
        status: 'pending review'
      },
      {
        id: 4,
        contextId: 4,
        type: 'Assessment',
        name: 'Assessment name',
        status: 'published',
        feedbackReviewed: false
      },
      {
        id: 5,
        contextId: 5,
        type: 'Assessment',
        name: 'Assessment name',
        status: 'published',
        feedbackReviewed: true
      }
    ]
  };

  constructor() {};

  getActivity(id: number): Observable<any> {
    return of(this.activity);
  }
}
