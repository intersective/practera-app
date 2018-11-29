import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  reviews = [
    {
      isDone: false,
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