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

  submissions = {
    2: {
      1: {
        answer: 'answer for question 1'
      }
    },
    3: {
      1: {
        answer: 'answer for question 1'
      }
    },
    4: {
      1: {
        answer: 'answer for question 1'
      }
    },
    5: {
      1: {
        answer: 'answer for question 1'
      }
    }
  };

  reviews = {
    4: {
      1: {
        answer: 'review answer for question 1',
        comment: 'review comment for question 1'
      }
    },
    5: {
      1: {
        answer: 'review answer for question 1',
        comment: 'review comment for question 1'
      }
    }
  };

  constructor() {};

  getAssessment(id): Observable<any> {
    return of(this.assessment);
  }

  // the id passed in is assessment id
  getSubmission(id, action): Observable<any> {
    return of({
      submission: this.submissions[id] ? this.submissions[id] : {},
      review: this.reviews[id] ? this.reviews[id] : {}
    });
  }
}