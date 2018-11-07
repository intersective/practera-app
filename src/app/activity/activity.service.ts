import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

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
        id: 2,
        type: 'Comm',
        name: 'Comm name',
        status: ''
      },
      {
        id: 3,
        type: 'Assessment',
        name: 'Assessment name',
        status: 'pending review'
      },
      {
        id: 4,
        type: 'Assessment',
        name: 'Assessment name',
        status: ''
      },
      {
        id: 5,
        type: 'Assessment',
        name: 'Assessment name',
        status: 'published'
      }
    ]
  };

  constructor() {};

  getActivity(id): Observable<any> {
    return of(this.activity);
  }
}
