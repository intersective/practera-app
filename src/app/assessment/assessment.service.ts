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
          {
            id: 1,
            name: 'question1',
            type: 'text',
            description: 'this is a text question description',
            isRequired: true
          }
        ]
      },
      {
        name: 'Group 2',
        questions: [
          {
            id: 2,
            name: 'question2',
            type: 'text',
            description: 'this is a text question description',
            isRequired: false
          }
        ]
      }
    ]
  };

  submission = {
    1: {
      answer: 'answer for question 1'
    },
    2: {
      answer: 'answer for question 1'
    }
  };

  constructor() {};

  getAssessment(id): Observable<any> {
    return of(this.assessment);
  }

  getSubmission(id): Observable<any> {
    return of(this.submission);
  }
}