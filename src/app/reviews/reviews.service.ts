import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Review {
  isDone: boolean,
  name: string,
  submitterName: string,
  submittedAssessmnetDate?: string,
  submittedReviewDate?: string,
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
      submittedAssessmnetDate: 'Nov 19',
      teamName: 'one',
      isInTeam: true
    },
    {
      isDone: false,
      name: 'video test',
      submitterName: 'Sara',
      submittedReviewDate: '20 Jun',
      teamName: 'one',
      isInTeam: true
    },
    {
      isDone: true,
      name: 'Demo assessment',
      submitterName: 'Ronak',
      submittedAssessmnetDate: '15 Nov',
      teamName: 'two',
      isInTeam: true
    }
  ]

  constructor() { }

  getReviews(): Observable<any> {
    return of(this.reviews);
  }
  
}