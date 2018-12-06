import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Review {
  isDone: boolean,
  name: string,
  submitterName: string,
  submittedDate: Date,
  teamName?: string,
  isInTeam: boolean
}

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  reviews:Array<Review> = [
    {
      isDone: true,
      name: 'moderated for mentors',
      submitterName: 'Ronak',
      submittedDate: new Date(2018, 11, 19),
      teamName: 'one',
      isInTeam: true
    },
    {
      isDone: true,
      name: 'moderated for mentors',
      submitterName: 'Ronak',
      submittedDate: new Date(2018, 1, 20),
      teamName: 'one',
      isInTeam: true
    },
    {
      isDone: true,
      name: 'moderated for mentors',
      submitterName: 'Ronak',
      submittedDate: new Date(2013, 7, 3),
      teamName: 'one',
      isInTeam: true
    }
  ]

  constructor() { }

  getReviews(): Observable<any> {
    return of(this.reviews);
  }

}