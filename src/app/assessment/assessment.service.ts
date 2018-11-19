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

  // assessment_id: {
  //  question_id: {}
  // }
  submissions = {
    2: {
      status: 'done',
      1: {
        answer: 'answer for question 1'
      }
    },
    3: {
      status: 'pending review',
      1: {
        answer: 'answer for question 1'
      }
    },
    4: {
      status: 'published',
      1: {
        answer: 'answer for question 1'
      }
    },
    5: {
      status: 'published',
      1: {
        answer: 'answer for question 1'
      }
    }
  };

  // assessment_id: {
  //  id:
  //  answers: {
  //    question_id: {}
  //  }
  // }
  reviews = {
    3: {

    },
    4: {
      id: 1,
      answers: {
        1: {
          answer: 'review answer for question 1',
          comment: 'review comment for question 1'
        }
      }
    },
    5: {
      id: 2,
      answers: {
        1: {
          answer: 'review answer for question 1',
          comment: 'review comment for question 1'
        }
      }
    }
  };

  // review id: 
  feedbackReviewed = {
    1: false,
    2: true
  }

  constructor() {};

  getAssessment(id): Observable<any> {
    return of(this.assessment);
  }

  getSubmission(assessmentId, contextId, action): Observable<any> {
    return of({
      submission: this.submissions[assessmentId] ? {
        id: 1,
        status: this.submissions[assessmentId].status,
        answers: this.submissions[assessmentId] 
      } : {},
      review: this.reviews[assessmentId] ? {
        id: this.reviews[assessmentId].id,
        answers: this.reviews[assessmentId].answers
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

  getFeedbackReviewed(reviewId) {
    return of(this.feedbackReviewed[reviewId] ? this.feedbackReviewed[reviewId] : false);
  }




}


