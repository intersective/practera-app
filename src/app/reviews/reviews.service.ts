import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Review {
  isDone: boolean,
  name: string,
  submitterName: string,
  submittedDate: string,
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
      submittedDate: 'Nov 19',
      teamName: 'one',
      isInTeam: true
    },
    {
      isDone: true,
      name: 'moderated for mentors',
      submitterName: 'Ronak',
      submittedDate: '20 Jun',
      teamName: 'one',
      isInTeam: true
    },
    {
      isDone: true,
      name: 'moderated for mentors',
      submitterName: 'Ronak',
      submittedDate: '15 Nov',
      teamName: 'one',
      isInTeam: true
    }
  ]

  constructor() { }

  getReviews(): Observable<any> {
    return of(this.reviews);
  }

}