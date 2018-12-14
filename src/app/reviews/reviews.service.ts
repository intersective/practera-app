import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Review {
  id:number,
  isDone: boolean,
  name: string,
  submitterName: string,
  submittedAssessmnetDate?: string,
  submittedReviewDate?: string,
  teamName?: string,
  isInTeam: boolean,
  contextId: number
}

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  
  reviews:Array<Review> = [
    {
      id:1,
      isDone: true,
      name: 'moderated for mentors',
      submitterName: 'Ronak',
      submittedAssessmnetDate: 'Nov 19',
      teamName: 'one',
      isInTeam: true,
      contextId: 3
    },
    { id:2,
      isDone: false,
      name: 'video test',
      submitterName: 'Sara',
      submittedReviewDate: '20 Jun',
      teamName: 'one',
      isInTeam: true,
      contextId: 1
    },
    { id:33,
      isDone: true,
      name: 'Demo assessment',
      submitterName: 'Ronak',
      submittedAssessmnetDate: '15 Nov',
      teamName: 'two',
      isInTeam: true,
      contextId: 2
    }
  ]

  constructor() { }

  getReviews(): Observable<any> {
    return of(this.reviews);
  }
  
}