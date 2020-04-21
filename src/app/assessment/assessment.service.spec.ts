import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RequestService } from '@shared/request/request.service';
import { BrowserStorageService } from '@services/storage.service';
import { UtilsService } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { AssessmentService, AssessmentSubmitBody } from './assessment.service';
import { SubmissionFixture } from '@testing/fixtures';

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
          useValue: jasmine.createSpyObj('RequestService', ['get', 'post', 'postGraphQL', 'apiResponseFormatError'])
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
    service = TestBed.inject(AssessmentService);
    requestSpy = TestBed.inject(RequestService) as jasmine.SpyObj<RequestService>;
    notificationSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    utils = TestBed.inject(UtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when testing getAssessment()', () => {
    let requestResponse;
    let expectedAssessment, expectedSubmission, expectedReview;
    let assessment, group0, question0, question1, question2, group1, question3, question4, submission, review;
    beforeEach(() => {
      requestResponse = {
        data: {
          assessment: {
            id: 1,
            name: 'test',
            type: 'quiz',
            description: 'des',
            is_team: false,
            due_date: '2019-02-02',
            pulse_check: false,
            groups: [
              {
                name: 'g name',
                description: 'g des',
                questions: [
                  {
                    id: 1,
                    name: 'test name 1',
                    description: 'des 1',
                    type: 'text',
                    is_required: true,
                    has_comment: true,
                    audience: ['submitter']
                  },
                  {
                    id: 2,
                    name: 'test name 2',
                    description: 'des 2',
                    type: 'oneof',
                    is_required: true,
                    has_comment: true,
                    audience: ['reviewer'],
                    choices: [
                      {
                        id: 21,
                        name: 'choice name 1'
                      },
                      {
                        id: 22,
                        name: 'choice name 2'
                      }
                    ]
                  },
                  {
                    id: 3,
                    name: 'test name 3',
                    description: 'des 3',
                    type: 'multiple',
                    is_required: true,
                    has_comment: true,
                    audience: ['submitter', 'reviewer'],
                    choices: [
                      {
                        id: 31,
                        name: 'choice name 1',
                        description: 'choice des 1'
                      },
                      {
                        id: 32,
                        name: 'choice name 2',
                        description: 'choice des 2'
                      }
                    ]
                  }
                ]
              },
              {
                name: 'g name',
                description: 'g des',
                questions: [
                  {
                    id: 11,
                    name: 'test name 11',
                    description: 'des 11',
                    type: 'file',
                    is_required: true,
                    has_comment: true,
                    audience: ['submitter', 'reviewer'],
                    file_type: 'any'
                  },
                  {
                    id: 12,
                    name: 'test name 12',
                    description: 'des 12',
                    type: 'team member selector',
                    is_required: true,
                    has_comment: true,
                    audience: ['submitter', 'reviewer'],
                    team_members: [
                      {
                        id: 121,
                        userName: 'member name 1'
                      },
                      {
                        id: 122,
                        userName: 'member name 2'
                      }
                    ]
                  },
                ]
              }
            ],
            submissions: [
              {
                id: 1,
                status: 'published',
                modified: '2019-02-02',
                locked: false,
                completed: false,
                submitter: {
                  name: 'test name',
                  image: ''
                },
                answers: [
                  {
                    question_id: 1,
                    answer: 'abc'
                  },
                  {
                    question_id: 2,
                    answer: 21
                  },
                  {
                    question_id: 3,
                    answer: [31]
                  },
                  {
                    question_id: 11,
                    answer: ''
                  },
                  {
                    question_id: 12,
                    answer: '{"id": 121,"userName": "member name 1"}'
                  }
                ],
                review: {
                  id: 2,
                  status: 'done',
                  modified: '2019-02-02',
                  reviewer: {
                    name: 'test reviewer name'
                  },
                  answers: [
                    {
                      question_id: 1,
                      answer: 'abc',
                      comment: null
                    },
                    {
                      question_id: 2,
                      answer: 21,
                      comment: 'def'
                    },
                    {
                      question_id: 3,
                      answer: [31],
                      comment: 'def'
                    },
                    {
                      question_id: 11,
                      answer: '',
                      comment: 'def'
                    },
                    {
                      question_id: 12,
                      answer: null,
                      comment: null
                    }
                  ]
                }
              }
            ]
          }
        }
      };
      assessment = requestResponse.data.assessment;
      group0 = assessment.groups[0];
      // text
      question0 = group0.questions[0];
      // oneof
      question1 = group0.questions[1];
      // multiple
      question2 = group0.questions[2];
      group1 = assessment.groups[1];
      // file
      question3 = group1.questions[0];
      // team member selector
      question4 = group1.questions[1];
      expectedAssessment = {
        name: assessment.name,
        type: assessment.type,
        description: assessment.description,
        isForTeam: assessment.is_team,
        dueDate: assessment.due_date,
        isOverdue: assessment.due_date ? utils.timeComparer(assessment.due_date) < 0 : false,
        pulseCheck: assessment.pulse_check,
        groups: [
          {
            name: group0.name,
            description: group0.description,
            questions: [
              {
                id: question0.id,
                name: question0.name,
                type: question0.type,
                description: question0.description,
                isRequired: question0.is_required,
                canComment: question0.has_comment,
                canAnswer: question0.audience.includes('submitter'),
                audience: question0.audience,
                submitterOnly: true,
                reviewerOnly: false
              },
              {
                id: question1.id,
                name: question1.name,
                type: question1.type,
                description: question1.description,
                isRequired: question1.is_required,
                canComment: question1.has_comment,
                canAnswer: question1.audience.includes('submitter'),
                audience: question1.audience,
                submitterOnly: false,
                reviewerOnly: true,
                info: '',
                choices: [
                  {
                    id: question1.choices[0].id,
                    name: question1.choices[0].name,
                    explanation: null
                  },
                  {
                    id: question1.choices[1].id,
                    name: question1.choices[1].name,
                    explanation: null
                  }
                ]
              },
              {
                id: question2.id,
                name: question2.name,
                type: question2.type,
                description: question2.description,
                isRequired: question2.is_required,
                canComment: question2.has_comment,
                canAnswer: question2.audience.includes('submitter'),
                audience: question2.audience,
                submitterOnly: false,
                reviewerOnly: false,
                info: `<h3>Choice Description:</h3><p>${question2.choices[0].name} ` +
                  `- ${question2.choices[0].description}</p><p>${question2.choices[1].name} ` +
                  `- ${question2.choices[1].description}</p>`,
                choices: [
                  {
                    id: question2.choices[0].id,
                    name: question2.choices[0].name,
                    explanation: null
                  },
                  {
                    id: question2.choices[1].id,
                    name: question2.choices[1].name,
                    explanation: null
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
                type: question3.type,
                description: question3.description,
                isRequired: question3.is_required,
                canComment: question3.has_comment,
                canAnswer: question3.audience.includes('submitter'),
                audience: question3.audience,
                submitterOnly: false,
                reviewerOnly: false,
                fileType: question3.file_type
              },
              {
                id: question4.id,
                name: question4.name,
                type: question4.type,
                description: question4.description,
                isRequired: question4.is_required,
                canComment: question4.has_comment,
                canAnswer: question4.audience.includes('submitter'),
                audience: question4.audience,
                submitterOnly: false,
                reviewerOnly: false,
                teamMembers: [
                  {
                    key: JSON.stringify(question4.team_members[0]),
                    userName: question4.team_members[0].userName
                  },
                  {
                    key: JSON.stringify(question4.team_members[1]),
                    userName: question4.team_members[1].userName
                  }
                ]
              }
            ]
          }
        ]
      };
      submission = assessment.submissions[0];
      expectedSubmission = {
        id: submission.id,
        status: submission.status,
        submitterName: submission.submitter.name,
        submitterImage: submission.submitter.image,
        modified: submission.modified,
        isLocked: submission.locked,
        completed: submission.completed,
        reviewerName: submission.review.reviewer.name,
        answers: {
          1: {
            answer: submission.answers[0].answer
          },
          2: {
            answer: submission.answers[1].answer
          },
          3: {
            answer: submission.answers[2].answer
          },
          11: {
            answer: submission.answers[3].answer
          },
          12: {
            answer: submission.answers[4].answer
          }
        }
      };
      review = submission.review;
      expectedReview = {
        id: review.id,
        status: review.status,
        modified: review.modified,
        answers: {
          1: {
            answer: review.answers[0].answer,
            comment: review.answers[0].comment
          },
          2: {
            answer: review.answers[1].answer,
            comment: review.answers[1].comment
          },
          3: {
            answer: review.answers[2].answer,
            comment: review.answers[2].comment
          },
          11: {
            answer: review.answers[3].answer,
            comment: review.answers[3].comment
          },
          12: {
            answer: review.answers[4].answer,
            comment: review.answers[4].comment
          }
        }
      };
    });

    afterEach(() => {
      requestSpy.postGraphQL.and.returnValue(of(requestResponse));
      service.getAssessment(1, 'assessment', 2, 3).subscribe(
        result => {
          expect(result.assessment).toEqual(expectedAssessment);
          expect(result.submission).toEqual(expectedSubmission);
          expect(result.review).toEqual(expectedReview);
        }
      );
      expect(requestSpy.postGraphQL.calls.count()).toBe(1);
    });

    it('should get correct assessment data', () => {});

    it(`should not include a question group if there's no question inside`, () => {
      // if a question group doesn't have question
      requestResponse.data.assessment.groups[1].questions = [];
      requestResponse.data.assessment.submissions[0].answers.splice(3, 2);
      requestResponse.data.assessment.submissions[0].review.answers.splice(3, 2);
      // the expected result won't contain that group
      expectedAssessment.groups.splice(1, 1);
      delete expectedSubmission.answers[11];
      delete expectedSubmission.answers[12];
      delete expectedReview.answers[11];
      delete expectedReview.answers[12];
    });

    it('should get correct submission data without review', () => {
      requestResponse.data.assessment.submissions[0].review = null;
      expectedSubmission.reviewerName = null;
      expectedReview = null;
    });
  });

  describe('when testing saveAnswers()', () => {
    const assessment: AssessmentSubmitBody = SubmissionFixture;
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
    it('should return null if no reviewer passed in', () => {
      expect(service.checkReviewer(null)).toEqual(null);
    });
    it('should return null if reviewer is the current person', () => {
      expect(service.checkReviewer({name: 'Test'})).toEqual(null);
    });
  });

});
