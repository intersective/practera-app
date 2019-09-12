import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RequestService } from '@shared/request/request.service';
import { BrowserStorageService } from '@services/storage.service';
import { UtilsService } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { AssessmentService } from './assessment.service';

describe('AssessmentService', () => {
  let service: AssessmentService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  let utils: UtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AssessmentService,
        UtilsService,
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', ['modal'])
        },
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', ['get', 'post', 'apiResponseFormatError'])
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', {
            getUser: {
              name: 'Test',
              projectId: 1
            }
          })
        },
      ]
    });
    service = TestBed.get(AssessmentService);
    requestSpy = TestBed.get(RequestService);
    notificationSpy = TestBed.get(NotificationService);
    utils = TestBed.get(UtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when testing getAssessment()', () => {
    let requestResponse;
    let expected;
    beforeEach(() => {
      requestResponse = {
        success: true,
        data: [
          {
            Assessment: {
              name: 'test',
              description: 'des',
              is_team: false,
              deadline: '2019-02-02'
            },
            AssessmentGroup: [
              {
                name: 'g name',
                description: 'g des',
                AssessmentGroupQuestion: [
                  {
                    AssessmentQuestion: {
                      id: 1,
                      name: 'test name 1',
                      description: 'des 1',
                      question_type: 'text',
                      is_required: true,
                      has_comment: true,
                      can_answer: true,
                      audience: ['submitter']
                    }
                  },
                  {
                    AssessmentQuestion: {
                      id: 2,
                      name: 'test name 2',
                      description: 'des 2',
                      question_type: 'oneof',
                      is_required: true,
                      has_comment: true,
                      can_answer: true,
                      audience: ['reviewer'],
                      AssessmentQuestionChoice: [
                        {
                          id: 21,
                          AssessmentChoice: {
                            name: 'choice name 1'
                          }
                        },
                        {
                          id: 22,
                          AssessmentChoice: {
                            name: 'choice name 2',
                            explanation: 'exp 2'
                          }
                        }
                      ]
                    }
                  },
                  {
                    AssessmentQuestion: {
                      id: 3,
                      name: 'test name 3',
                      description: 'des 3',
                      question_type: 'multiple',
                      is_required: true,
                      has_comment: true,
                      can_answer: true,
                      audience: ['submitter', 'reviewer'],
                      AssessmentQuestionChoice: [
                        {
                          id: 31,
                          AssessmentChoice: {
                            name: 'choice name 1',
                            description: 'choice des 1'
                          }
                        },
                        {
                          id: 32,
                          AssessmentChoice: {
                            name: 'choice name 2',
                            description: 'choice des 2'
                          }
                        }
                      ]
                    }
                  }
                ]
              },
              {
                name: 'g name',
                description: 'g des',
                AssessmentGroupQuestion: [
                  {
                    AssessmentQuestion: {
                      id: 11,
                      name: 'test name 11',
                      description: 'des 11',
                      question_type: 'file',
                      is_required: true,
                      has_comment: true,
                      can_answer: true,
                      audience: ['submitter', 'reviewer'],
                      file_type: {
                        type: 'any'
                      }
                    }
                  },
                  {
                    AssessmentQuestion: {
                      id: 12,
                      name: 'test name 12',
                      description: 'des 12',
                      question_type: 'team member selector',
                      is_required: true,
                      has_comment: true,
                      can_answer: true,
                      audience: ['submitter', 'reviewer'],
                      TeamMember: [
                        {
                          id: 121,
                          userName: 'member name 1'
                        },
                        {
                          id: 122,
                          userName: 'member name 2'
                        }
                      ]
                    }
                  },
                ]
              }
            ]
          }
        ]
      };
      const assessment = requestResponse.data[0];
      const group0 = assessment.AssessmentGroup[0];
      // text
      const question0 = group0.AssessmentGroupQuestion[0].AssessmentQuestion;
      // oneof
      const question1 = group0.AssessmentGroupQuestion[1].AssessmentQuestion;
      // multiple
      const question2 = group0.AssessmentGroupQuestion[2].AssessmentQuestion;
      const group1 = assessment.AssessmentGroup[1];
      // file
      const question3 = group1.AssessmentGroupQuestion[0].AssessmentQuestion;
      // team member selector
      const question4 = group1.AssessmentGroupQuestion[1].AssessmentQuestion;
      expected = {
        name: assessment.Assessment.name,
        description: assessment.Assessment.description,
        isForTeam: assessment.Assessment.is_team,
        dueDate: assessment.Assessment.deadline,
        isOverdue: assessment.Assessment.deadline ? utils.timeComparer(assessment.Assessment.deadline) < 0 : false,
        groups: [
          {
            name: group0.name,
            description: group0.description,
            questions: [
              {
                id: question0.id,
                name: question0.name,
                type: question0.question_type,
                description: question0.description,
                isRequired: question0.is_required,
                canComment: question0.has_comment,
                canAnswer: question0.can_answer,
                audience: question0.audience,
                submitterOnly: true,
                reviewerOnly: false
              },
              {
                id: question1.id,
                name: question1.name,
                type: question1.question_type,
                description: question1.description,
                isRequired: question1.is_required,
                canComment: question1.has_comment,
                canAnswer: question1.can_answer,
                audience: question1.audience,
                submitterOnly: false,
                reviewerOnly: true,
                info: '',
                choices: [
                  {
                    id: question1.AssessmentQuestionChoice[0].id,
                    name: question1.AssessmentQuestionChoice[0].AssessmentChoice.name,
                    explanation: ''
                  },
                  {
                    id: question1.AssessmentQuestionChoice[1].id,
                    name: question1.AssessmentQuestionChoice[1].AssessmentChoice.name,
                    explanation: question1.AssessmentQuestionChoice[1].AssessmentChoice.explanation
                  }
                ]
              },
              {
                id: question2.id,
                name: question2.name,
                type: question2.question_type,
                description: question2.description,
                isRequired: question2.is_required,
                canComment: question2.has_comment,
                canAnswer: question2.can_answer,
                audience: question2.audience,
                submitterOnly: false,
                reviewerOnly: false,
                info: `<h3>Choice Description:</h3><p>${question2.AssessmentQuestionChoice[0].AssessmentChoice.name} ` +
                  `- ${question2.AssessmentQuestionChoice[0].AssessmentChoice.description}</p><p>${question2.AssessmentQuestionChoice[1].AssessmentChoice.name} ` +
                  `- ${question2.AssessmentQuestionChoice[1].AssessmentChoice.description}</p>`,
                choices: [
                  {
                    id: question2.AssessmentQuestionChoice[0].id,
                    name: question2.AssessmentQuestionChoice[0].AssessmentChoice.name,
                    explanation: ''
                  },
                  {
                    id: question2.AssessmentQuestionChoice[1].id,
                    name: question2.AssessmentQuestionChoice[1].AssessmentChoice.name,
                    explanation: ''
                  }
                ]
              }
            ]
          },
          {
            name: group1.name,
            description: group1.description,
            questions: [
              {
                id: question3.id,
                name: question3.name,
                type: question3.question_type,
                description: question3.description,
                isRequired: question3.is_required,
                canComment: question3.has_comment,
                canAnswer: question3.can_answer,
                audience: question3.audience,
                submitterOnly: false,
                reviewerOnly: false,
                fileType: question3.file_type.type
              },
              {
                id: question4.id,
                name: question4.name,
                type: question4.question_type,
                description: question4.description,
                isRequired: question4.is_required,
                canComment: question4.has_comment,
                canAnswer: question4.can_answer,
                audience: question4.audience,
                submitterOnly: false,
                reviewerOnly: false,
                teamMembers: [
                  {
                    key: JSON.stringify(question4.TeamMember[0]),
                    userName: question4.TeamMember[0].userName
                  },
                  {
                    key: JSON.stringify(question4.TeamMember[1]),
                    userName: question4.TeamMember[1].userName
                  }
                ]
              }
            ]
          }
        ]
      };
    });

    it('should throw Assessment format error, if data format not match', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      tmpRes.data = [];
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getAssessment(1, 'assessment').subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should throw Assessment.AssessmentGroup format error, if data format not match', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      tmpRes.data[0].AssessmentGroup[0] = {};
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getAssessment(1, 'assessment').subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should throw Assessment.AssessmentGroupQuestion format error, if data format not match', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      tmpRes.data[0].AssessmentGroup[0].AssessmentGroupQuestion[0] = {};
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getAssessment(1, 'assessment').subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should throw Assessment.AssessmentQuestion format error, if data format not match', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      tmpRes.data[0].AssessmentGroup[0].AssessmentGroupQuestion[0].AssessmentQuestion = {};
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getAssessment(1, 'assessment').subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should throw Assessment.AssessmentQuestionChoice format error, if data format not match', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      tmpRes.data[0].AssessmentGroup[0].AssessmentGroupQuestion[1].AssessmentQuestion.AssessmentQuestionChoice = {};
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getAssessment(1, 'assessment').subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should throw Assessment.AssessmentChoice format error, if data format not match', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      tmpRes.data[0].AssessmentGroup[0].AssessmentGroupQuestion[1].AssessmentQuestion.AssessmentQuestionChoice[0] = {};
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getAssessment(1, 'assessment').subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should throw Assessment.AssessmentQuestion.file_type format error, if data format not match', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      tmpRes.data[0].AssessmentGroup[1].AssessmentGroupQuestion[0].AssessmentQuestion.file_type = {};
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getAssessment(1, 'assessment').subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should throw Assessment.TeamMember #1 format error, if data format not match', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      tmpRes.data[0].AssessmentGroup[1].AssessmentGroupQuestion[1].AssessmentQuestion.TeamMember = {};
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getAssessment(1, 'assessment').subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should throw Assessment.TeamMember #2 format error, if data format not match', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      tmpRes.data[0].AssessmentGroup[1].AssessmentGroupQuestion[1].AssessmentQuestion.TeamMember[0] = {};
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getAssessment(1, 'assessment').subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should get correct assessment data', () => {
      requestSpy.get.and.returnValue(of(requestResponse));
      service.getAssessment(1, 'assessment').subscribe(
        assessment => expect(assessment).toEqual(expected)
      );
      expect(requestSpy.get.calls.count()).toBe(1);
    });

    it(`should not include a question group if there's no question inside` , () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      // if a question group doesn't have question
      tmpRes.data[0].AssessmentGroup[1].AssessmentGroupQuestion = [];
      const tmpExp = JSON.parse(JSON.stringify(expected));
      // the expected result won't contain that group
      tmpExp.groups.splice(1, 1);
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getAssessment(1, 'assessment').subscribe(
        assessment => expect(assessment).toEqual(tmpExp)
      );
      expect(requestSpy.get.calls.count()).toBe(1);
    });
  });

  describe('when testing getSubmission()', () => {
    let requestResponse;
    let expected;
    beforeEach(() => {
      requestResponse = {
        success: true,
        data: [{
          AssessmentSubmission: {
            id: 1,
            status: 'pending approval',
            modified: '2019-02-02',
            is_locked: false
          },
          Submitter: {
            name: 'test name',
            image: ''
          },
          Reviewer: {
            name: 'test reviewer name'
          },
          AssessmentSubmissionAnswer: [
            {
              assessment_question_id: 1,
              answer: ''
            },
            {
              assessment_question_id: 2,
              answer: ''
            },
            {
              assessment_question_id: 3,
              answer: '123'
            },
            {
              assessment_question_id: 4,
              answer: ''
            },
            {
              assessment_question_id: 5,
              answer: '[1,2,3]'
            },
            {
              assessment_question_id: 6,
              answer: ['2', '3', '4']
            }
          ],
          AssessmentReview: [{
            id: 2,
            status: 'done',
            modified: '2019-02-02',
          }],
          AssessmentReviewAnswer: [
            {
              assessment_question_id: 1,
              answer: '',
              comment: ''
            },
            {
              assessment_question_id: 2,
              answer: '',
              comment: ''
            },
            {
              assessment_question_id: 3,
              answer: '123',
              comment: ''
            },
            {
              assessment_question_id: 4,
              answer: '',
              comment: ''
            },
            {
              assessment_question_id: 5,
              answer: '[1,2,3]',
              comment: ''
            },
            {
              assessment_question_id: 6,
              answer: ['2', '3', '4'],
              comment: ''
            }
          ]
        }]
      };
      const submission = requestResponse.data[0];
      expected = {
        submission: {
          id: submission.AssessmentSubmission.id,
          status: submission.AssessmentSubmission.status,
          answers: {
            1: {
              answer: ''
            },
            2: {
              answer: null
            },
            3: {
              answer: 123
            },
            4: {
              answer: []
            },
            5: {
              answer: [1, 2, 3]
            },
            6: {
              answer: [2, 3, 4]
            }
          },
          submitterName: submission.Submitter.name,
          modified: submission.AssessmentSubmission.modified,
          isLocked: submission.AssessmentSubmission.is_locked,
          submitterImage: submission.Submitter.image,
          reviewerName: submission.Reviewer.name
        },
        review: {
          id: submission.AssessmentReview[0].id,
          status: submission.AssessmentReview[0].status,
          modified: submission.AssessmentReview[0].modified,
          answers: {
            1: {
              answer: '',
              comment: ''
            },
            2: {
              answer: null,
              comment: ''
            },
            3: {
              answer: 123,
              comment: ''
            },
            4: {
              answer: [],
              comment: ''
            },
            5: {
              answer: [1, 2, 3],
              comment: ''
            },
            6: {
              answer: [2, 3, 4],
              comment: ''
            }
          }
        }
      };
      service.questions = {
        1: {
          question_type: 'text'
        },
        2: {
          question_type: 'oneof',
          AssessmentQuestionChoice: [
            {
              id: 123,
              AssessmentChoice: {
                name: 'choice name 123'
              },
              explanation: 'exp 123'
            }
          ]
        },
        3: {
          question_type: 'oneof',
          AssessmentQuestionChoice: [
            {
              id: 123,
              AssessmentChoice: {
                name: 'choice name 123'
              },
              explanation: 'exp 123'
            }
          ]
        },
        4: {
          question_type: 'multiple'
        },
        5: {
          question_type: 'multiple',
          AssessmentQuestionChoice: [
            {
              id: 22,
              AssessmentChoice: {
                name: 'choice name 2'
              },
              explanation: 'exp 2'
            }
          ]
        },
        6: {
          question_type: 'multiple',
          AssessmentQuestionChoice: [
            {
              id: 3,
              AssessmentChoice: {
                name: 'choice name 3'
              },
              explanation: 'exp 3'
            }
          ]
        }
      };
    });

    it('should return empty submission and review, if return data is empty', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      tmpRes.data = [];
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getSubmission(1, 2, 'assessment').subscribe(res => expect(res).toEqual({
        submission: {},
        review: {}
      }));
    });

    it('should throw AssessmentSubmission format error, if data format not match', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      tmpRes.data[0] = {};
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getSubmission(1, 2, 'assessment').subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should throw AssessmentSubmissionAnswer format error, if data format not match', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      tmpRes.data[0].AssessmentSubmissionAnswer = {};
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getSubmission(1, 2, 'assessment').subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should throw AssessmentSubmissionAnswer.answer format error, if data format not match', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      tmpRes.data[0].AssessmentSubmissionAnswer[0] = {};
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getSubmission(1, 2, 'assessment').subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should throw AssessmentReviewAnswer format error, if data format not match', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      tmpRes.data[0].AssessmentSubmission.status = 'published';
      tmpRes.data[0].AssessmentReviewAnswer[0] = {};
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getSubmission(1, 2, 'review').subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
      expect(requestSpy.apiResponseFormatError.calls.first().args[0]).toBe('AssessmentReviewAnswer format error');
    });

    it('should get correct submission & review data', () => {
      requestSpy.get.and.returnValue(of(requestResponse));
      service.getSubmission(1, 2, 'review').subscribe(
        res => expect(res).toEqual(expected)
      );
      expect(requestSpy.get.calls.count()).toBe(1);
    });

    it('should get correct submission data with choice explanation added', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      tmpRes.data[0].AssessmentSubmission.status = 'done';
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getSubmission(1, 2, 'review', 3).subscribe(
        res => {
          expect(res.submission.answers[1].explanation).toBeFalsy();
          expect(res.submission.answers[2].explanation).toBeTruthy();
          expect(res.submission.answers[3].explanation).toBeTruthy();
          expect(res.submission.answers[4].explanation).toBeFalsy();
          expect(res.submission.answers[5].explanation).toBeTruthy();
          expect(res.submission.answers[6].explanation).toBeTruthy();
        }
      );
      expect(requestSpy.get.calls.count()).toBe(1);
    });

    it('should get correct submission data without review', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      tmpRes.data[0].AssessmentReview = {};
      const tmpExp = JSON.parse(JSON.stringify(expected));
      tmpExp.review = {};
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getSubmission(1, 2, 'assessment').subscribe(
        res => expect(res).toEqual(tmpExp)
      );
      expect(requestSpy.get.calls.count()).toBe(1);
    });
  });

  describe('when testing saveAnswers()', () => {
    const assessment = {assessment: true};
    const answers = {answers: true};
    beforeEach(() => {
      requestSpy.post.and.returnValue(of(true));
    });

    it('should save assessment answers correctly', () => {
      service.saveAnswers(assessment, answers, 'assessment').subscribe();
      expect(requestSpy.post.calls.count()).toBe(1);
      expect(requestSpy.post.calls.first().args[1]).toEqual({
        Assessment: assessment,
        AssessmentSubmissionAnswer: answers
      });
    });

    it('should save assessment answers correctly with submission id', () => {
      service.saveAnswers(assessment, answers, 'assessment', 1).subscribe();
      expect(requestSpy.post.calls.count()).toBe(1);
      expect(requestSpy.post.calls.first().args[1]).toEqual({
        Assessment: assessment,
        AssessmentSubmissionAnswer: answers,
        AssessmentSubmission: {id: 1}
      });
    });

    it('should save review answers correctly', () => {
      service.saveAnswers(assessment, answers, 'review').subscribe();
      expect(requestSpy.post.calls.count()).toBe(1);
      expect(requestSpy.post.calls.first().args[1]).toEqual({
        Assessment: assessment,
        AssessmentReviewAnswer: answers
      });
    });

    it('should return success false if action not correct', () => {
      service.saveAnswers(assessment, answers, 'incorrect').subscribe(res => expect(res.success).toBe(false));
      expect(requestSpy.post.calls.count()).toBe(0);
    });
  });

  describe('when testing getFeedbackReviewed()', () => {
    it('should return correct feedback reviewed status #1', () => {
      requestSpy.get.and.returnValue(of({
        success: true,
        data: [{is_done: true}]
      }));
      service.getFeedbackReviewed(1).subscribe(res => expect(res).toBe(true));
      expect(requestSpy.get.calls.count()).toBe(1);
    });
    it('should return correct feedback reviewed status #2', () => {
      requestSpy.get.and.returnValue(of({
        success: true,
        data: [{is_done: false}]
      }));
      service.getFeedbackReviewed(1).subscribe(res => expect(res).toBe(false));
      expect(requestSpy.get.calls.count()).toBe(1);
    });
    it('should return false if response.success is false', () => {
      requestSpy.get.and.returnValue(of({
        success: false,
        data: [{is_done: true}]
      }));
      service.getFeedbackReviewed(1).subscribe(res => expect(res).toBe(false));
      expect(requestSpy.get.calls.count()).toBe(1);
    });
    it('should throw error if data format incorrect', () => {
      requestSpy.get.and.returnValue(of({
        success: true,
        data: [{}]
      }));
      service.getFeedbackReviewed(1).subscribe();
      expect(requestSpy.get.calls.count()).toBe(1);
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
      expect(requestSpy.apiResponseFormatError.calls.first().args[0]).toEqual('TodoItem format error');
    });
  });

  describe('when testing saveFeedbackReviewed()', () => {
    it('should post correct data', () => {
      service.saveFeedbackReviewed(11);
      expect(requestSpy.post.calls.count()).toBe(1);
      expect(requestSpy.post.calls.first().args[1]).toEqual({
        project_id: 1,
        identifier: 'AssessmentSubmission-11',
        is_done: true
      });
    });
  });

  describe('when testing popUpReviewRating()', () => {
    it('should pass the correct data to notification modal', () => {
      service.popUpReviewRating(1, 'home');
      expect(notificationSpy.modal.calls.count()).toBe(1);
      expect(notificationSpy.modal.calls.first().args[1]).toEqual({
        reviewId: 1,
        redirect: 'home'
      });
    });
  });

  describe('when testing checkReviewer()', () => {
    it('should return undefined if no reviewer passed in', () => {
      expect(service.checkReviewer(null)).toEqual(undefined);
    });
    it('should return undefined if reviewer is the current person', () => {
      expect(service.checkReviewer({name: 'Test'})).toEqual(undefined);
    });
  });

});
