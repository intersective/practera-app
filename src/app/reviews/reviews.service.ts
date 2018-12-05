import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Review {
  isDone: boolean,
  name: string,
  submitterName: string,
  submittedDate: Date,
  teamName: string,
  isInTeam: boolean
}

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  reviews = [
    {
      isDone: true,
      name: 'moderated for mentors',
      submitterName: 'Ronak',
      submittedDate: 'today',
      teamName: 'one',
      isInTeam: true
    },
    {
      isDone: true,
      name: 'moderated for mentors',
      submitterName: 'Ronak',
      submittedDate: 'today',
      teamName: 'one',
      isInTeam: true
    },
    {
      isDone: true,
      name: 'moderated for mentors',
      submitterName: 'Ronak',
      submittedDate: 'today',
      teamName: 'one',
      isInTeam: true
    }
  ]

  constructor() { }

  getReviews(): Observable<any> {
    return of(this.reviews);
  }

}