import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
 @Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  assessment = {
    name: 'Assessment1',
    description: 'This is the description of assessment 1',
    groups: [
      {
        name: 'Group 1',
        questions: [
        ]
      },
      {
        name: 'Group 2',
        questions: [
        ]
      }
    ]
  };

  constructor() {};

  getAssessment(id): Observable<any> {
    return of(this.assessment);
  }
}