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
            isRequired: true,
            allowComment: false,
            canDo: true
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
            isRequired: false,
            allowComment: true,
            canDo: false
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
    3: {

    },
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

  getSubmission(assessmentId, contextId, action): Observable<any> {
    return of({
      submission: this.submissions[assessmentId] ? {
        id: 1,
        answers: this.submissions[assessmentId] 
      } : {},
      review: this.reviews[assessmentId] ? {
        id: 1,
        answers: this.reviews[assessmentId]
      } : {}
    });
  }

  saveAnswers(assessment, answers, action) {
    let postData;
    switch (action) {
      case 'assessment':
        postData = {
          Assessment: assessment,
          AssessmentSubmissionAnswer: answers
        }
        console.log('Submit submission with data:', postData);
        break;

      case 'review':
        postData = {
          Assessment: assessment,
          AssessmentReviewAnswer: answers
        }
        console.log('Submit feedback with data:', postData);
        break;
    }
    return of({
      success: true,
      status: "success"
    });
  }
}


