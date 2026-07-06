import { flush, flushMicrotasks, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RequestService } from 'request';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { AssessmentService } from './assessment.service';
import { TestUtils } from '@testingv3/utils';
import { ApolloService } from './apollo.service';

describe('AssessmentService', () => {
  let service: AssessmentService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let notificationSpy: jasmine.SpyObj<NotificationsService>;
  let apolloSpy: jasmine.SpyObj<ApolloService>;
  let utils: UtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AssessmentService,
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', ['modal', 'markTodoItemAsDone'])
        },
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', [
            'get', 'post', 'apiResponseFormatError'
          ]),
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
        {
          provide: ApolloService,
          useValue: jasmine.createSpyObj('ApolloService', ['graphQLMutate', 'graphQLWatch', 'graphQLFetch'])
        },
      ]
    });
    service = TestBed.inject(AssessmentService);
    requestSpy = TestBed.inject(RequestService) as jasmine.SpyObj<RequestService>;
    notificationSpy = TestBed.inject(NotificationsService) as jasmine.SpyObj<NotificationsService>;
    apolloSpy = TestBed.inject(ApolloService) as jasmine.SpyObj<ApolloService>;
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
            isTeam: false,
            dueDate: '2019-02-02',
            pulseCheck: false,
            allowResubmit: false,
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
                    isRequired: true,
                    hasComment: true,
                    audience: ['submitter']
                  },
                  {
                    id: 2,
                    name: 'test name 2',
                    description: 'des 2',
                    type: 'oneof',
                    isRequired: true,
                    hasComment: true,
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
                    isRequired: true,
                    hasComment: true,
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
                    isRequired: true,
                    hasComment: true,
                    audience: ['submitter', 'reviewer'],
                    fileType: 'any'
                  },
                  {
                    id: 12,
                    name: 'test name 12',
                    description: 'des 12',
                    type: 'team member selector',
                    isRequired: true,
                    hasComment: true,
                    audience: ['submitter', 'reviewer'],
                    teamMembers: [
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
                  image: '',
                  team: {
                    name: 'team-test',
                  }
                },
                answers: [
                  {
                    questionId: 1,
                    answer: 'abc'
                  },
                  {
                    questionId: 2,
                    answer: 21
                  },
                  {
                    questionId: 3,
                    answer: [31]
                  },
                  {
                    questionId: 11,
                    answer: ''
                  },
                  {
                    questionId: 12,
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
                      questionId: 1,
                      answer: 'abc',
                      comment: null
                    },
                    {
                      questionId: 2,
                      answer: 21,
                      comment: 'def'
                    },
                    {
                      questionId: 3,
                      answer: [31],
                      comment: 'def'
                    },
                    {
                      questionId: 11,
                      answer: '',
                      comment: 'def'
                    },
                    {
                      questionId: 12,
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
        id: 1,
        name: assessment.name,
        type: assessment.type,
        description: assessment.description,
        isForTeam: assessment.isTeam,
        dueDate: assessment.dueDate,
        isOverdue: assessment.dueDate ? utils.timeComparer(assessment.dueDate) < 0 : false,
        pulseCheck: assessment.pulseCheck,
        hasReviewRating: assessment.hasReviewRating,
        allowResubmit: assessment.allowResubmit,
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
                isRequired: question0.isRequired,
                canComment: question0.hasComment,
                canAnswer: question0.audience.includes('submitter'),
                audience: question0.audience,
                min: undefined,
                max: undefined,
                submitterOnly: true,
                reviewerOnly: false
              },
              {
                id: question1.id,
                name: question1.name,
                type: question1.type,
                description: question1.description,
                isRequired: question1.isRequired,
                canComment: question1.hasComment,
                canAnswer: question1.audience.includes('submitter'),
                audience: question1.audience,
                min: undefined,
                max: undefined,
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
                isRequired: question2.isRequired,
                canComment: question2.hasComment,
                canAnswer: question2.audience.includes('submitter'),
                audience: question2.audience,
                min: undefined,
                max: undefined,
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
                isRequired: question3.isRequired,
                canComment: question3.hasComment,
                canAnswer: question3.audience.includes('submitter'),
                audience: question3.audience,
                min: undefined,
                max: undefined,
                submitterOnly: false,
                reviewerOnly: false,
                fileType: question3.fileType
              },
              {
                id: question4.id,
                name: question4.name,
                type: question4.type,
                description: question4.description,
                isRequired: question4.isRequired,
                canComment: question4.hasComment,
                canAnswer: question4.audience.includes('submitter'),
                audience: question4.audience,
                min: undefined,
                max: undefined,
                submitterOnly: false,
                reviewerOnly: false,
                teamMembers: [
                  {
                    key: JSON.stringify(question4.teamMembers[0]),
                    userName: question4.teamMembers[0].userName
                  },
                  {
                    key: JSON.stringify(question4.teamMembers[1]),
                    userName: question4.teamMembers[1].userName
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
        status: 'feedback available',
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
            // file type answers normalize empty strings to null
            answer: null
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
        teamName: submission.submitter.team.name,
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
      apolloSpy.graphQLFetch.and.returnValue(of(requestResponse));
      service.getAssessment(1, 'assessment', 2, 3);
      service.assessment$.subscribe(assessment => {
        expect(assessment).toEqual(expectedAssessment);
      });
      service.submission$.subscribe(submission => {
        expect(submission).toEqual(expectedSubmission);
      });
      service.review$.subscribe(review => {
        expect(review).toEqual(expectedReview);
      });
      expect(apolloSpy.graphQLFetch.calls.count()).toBe(1);
    });

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
    const answers = [
      { questionId: 123, answer: 'abc' },
      { questionId: 124, answer: 456 },
      { questionId: 125, answer: [3, 4] },
      { questionId: 126, answer: [3] },
      { questionId: 127, answer: { filename: 'abc.png' } }
    ];
    beforeEach(() => {
      apolloSpy.graphQLMutate.and.returnValue(of(true));
    });

    it('should save assessment answers correctly', () => {
      const assessment = {
        id: 1,
        inProgress: true,
        contextId: 2
      };
      service.saveAnswers(assessment, answers, 'assessment', false).subscribe();
      expect(apolloSpy.graphQLMutate.calls.first().args[0]).toContain('submitAssessment');
      expect(apolloSpy.graphQLMutate.calls.first().args[1]).toEqual({
        assessmentId: assessment.id,
        inProgress: assessment.inProgress,
        contextId: assessment.contextId,
        answers: answers
      });
    });

    it('should save assessment answers correctly with submission id', () => {
      const assessment = {
        id: 1,
        inProgress: true,
        contextId: 2,
        submissionId: 3,
        unlock: true
      };
      service.saveAnswers(assessment, answers, 'assessment', false).subscribe();
      expect(apolloSpy.graphQLMutate.calls.first().args[0]).toContain('submitAssessment');
      expect(apolloSpy.graphQLMutate.calls.first().args[1]).toEqual({
        assessmentId: assessment.id,
        inProgress: assessment.inProgress,
        contextId: assessment.contextId,
        submissionId: assessment.submissionId,
        unlock: assessment.unlock,
        answers: answers
      });
    });

    it('should save review answers correctly', () => {
      const assessment = {
        id: 1,
        inProgress: true,
        submissionId: 3,
        reviewId: 4
      };
      service.saveAnswers(assessment, answers, 'review', false).subscribe();
      expect(apolloSpy.graphQLMutate.calls.first().args[0]).toContain('submitReview');
      expect(apolloSpy.graphQLMutate.calls.first().args[1]).toEqual({
        assessmentId: assessment.id,
        inProgress: assessment.inProgress,
        submissionId: assessment.submissionId,
        reviewId: assessment.reviewId,
        answers: answers
      });
    });

    it('should return success false if action not correct', () => {
      const assessment = {
        id: 1,
        inProgress: true
      };
      service.saveAnswers(assessment, answers, 'incorrect', false).subscribe(res => expect(res).toBe(false));
      expect(apolloSpy.graphQLMutate.calls.count()).toBe(0);
    });
  });

  describe('when testing saveFeedbackReviewed()', () => {
    it('should post correct data', () => {
      notificationSpy.markTodoItemAsDone.and.returnValue(of(true));
      service.saveFeedbackReviewed(11);
      expect(notificationSpy.markTodoItemAsDone.calls.count()).toBe(1);
      expect(notificationSpy.markTodoItemAsDone.calls.first().args[0]).toEqual({
        identifier: 'AssessmentSubmission-11',
      });
    });
  });

  describe('when testing checkReviewer()', () => {
    it('should return null if no reviewer passed in', () => {
      expect(service.checkReviewer(null)).toEqual(null);
    });
    it('should return null if reviewer is the current person', () => {
      expect(service.checkReviewer({ name: 'Test' })).toEqual(null);
    });
  });

  describe('_normaliseAnswer', () => {
    beforeEach(() => {
      service.questions = {
        1: { type: 'oneof', choices: [] },
        2: { type: 'multiple', choices: [] },
        3: { type: 'multi team member selector', choices: [] }
      };
    });

    it('should convert string to number for oneof question type', () => {
      const result = service['_normaliseAnswer'](1, '123');
      expect(result).toEqual(123);
    });

    it('should convert empty string to null for oneof question type', () => {
      const result = service['_normaliseAnswer'](1, '');
      expect(result).toBeNull();
    });

    it('should convert string to array for multiple question type', () => {
      const result = service['_normaliseAnswer'](2, '[1,2,3]');
      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle non-array string by wrapping it in an array for multiple question type', () => {
      const result = service['_normaliseAnswer'](2, 'not an array');
      // non-numeric strings convert to NaN when the code attempts to convert to numbers
      expect(result).toEqual([NaN]);
    });

    it('should parse string to array for multi team member selector question type', () => {
      const result = service['_normaliseAnswer'](3, '[1,2,3]');
      expect(result).toEqual([1, 2, 3]);
    });

    it('should return the answer as is for invalid question type', () => {
      const result = service['_normaliseAnswer'](999, 'test');
      expect(result).toEqual('test');
    });

    it('should return the answer as is if question not found', () => {
      const result = service['_normaliseAnswer'](4, 'test'); // Assuming questionId 4 does not exist
      expect(result).toEqual('test');
    });
  });

  describe('when testing fetchAssessment()', () => {
    let apolloSpy: jasmine.SpyObj<ApolloService>;
    let mockResponse;

    beforeEach(() => {
      apolloSpy = TestBed.inject(ApolloService) as jasmine.SpyObj<ApolloService>;
      mockResponse = {
        data: {
          assessment: {
            id: 1,
            name: 'Test Assessment',
            type: 'quiz',
            description: 'Test Description',
            isTeam: false,
            dueDate: '2023-12-31',
            pulseCheck: false,
            allowResubmit: true,
            groups: [
              {
                name: 'Question Group 1',
                description: 'Group Description',
                questions: [
                  {
                    id: 1,
                    name: 'Text Question',
                    description: 'Text Description',
                    type: 'text',
                    isRequired: true,
                    hasComment: true,
                    audience: ['submitter', 'reviewer'],
                  },
                  {
                    id: 2,
                    name: 'One-of Question',
                    description: 'Oneof Description',
                    type: 'oneof',
                    isRequired: true,
                    hasComment: true,
                    audience: ['submitter', 'reviewer'],
                    choices: [
                      { id: 21, name: 'Choice 1', explanation: 'Explanation 1' },
                      { id: 22, name: 'Choice 2', explanation: 'Explanation 2' }
                    ]
                  },
                  {
                    id: 3,
                    name: 'Multiple Question',
                    description: 'Multiple Description',
                    type: 'multiple',
                    isRequired: true,
                    hasComment: false,
                    audience: ['submitter'],
                    choices: [
                      { id: 31, name: 'Option A', explanation: 'Explanation A' },
                      { id: 32, name: 'Option B', explanation: 'Explanation B' }
                    ]
                  },
                  {
                    id: 4,
                    name: 'File Question',
                    description: 'File Description',
                    type: 'file',
                    fileType: 'image',
                    isRequired: false,
                    hasComment: true,
                    audience: ['submitter', 'reviewer']
                  }
                ]
              }
            ],
            submissions: [
              {
                id: 101,
                status: 'published',
                completed: true,
                modified: '2023-11-15',
                locked: false,
                submitter: {
                  name: 'John Doe',
                  image: 'profile.jpg',
                  team: {
                    id: 10,
                    name: 'Team Alpha',
                    projectBrief: JSON.stringify({
                      id: 'brief-1',
                      title: 'Team Alpha Brief',
                      description: 'Brief description',
                    }),
                  }
                },
                answers: [
                  {
                    questionId: 1,
                    answer: 'This is a text answer'
                  },
                  {
                    questionId: 2,
                    answer: 21
                  },
                  {
                    questionId: 3,
                    answer: [31, 32]
                  },
                  {
                    questionId: 4,
                    file: {
                      name: 'image.jpg',
                      url: 'http://example.com/image.jpg',
                      type: 'image/jpeg'
                    }
                  }
                ],
                review: {
                  id: 201,
                  status: 'done',
                  modified: '2023-11-16',
                  meta: null,
                  reviewer: { name: 'Jane Smith' },
                  answers: [
                    {
                      questionId: 1,
                      answer: null,
                      comment: 'Good answer'
                    },
                    {
                      questionId: 2,
                      answer: 22,
                      comment: 'Consider the other option'
                    },
                    {
                      questionId: 4,
                      answer: null,
                      comment: 'Clear image',
                      file: {
                        name: 'feedback.jpg',
                        url: 'http://example.com/feedback.jpg',
                        type: 'image/jpeg',
                        size: 1024
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      };

      apolloSpy.graphQLFetch.and.returnValue(of(mockResponse));
    });

    it('should fetch and normalize assessment, submission, and review data', (done) => {
      service.fetchAssessment(1, 'assessment', 5, 10).subscribe(result => {
        // Check that all three parts of the response are returned
        expect(result).toBeTruthy();
        expect(result.assessment).toBeTruthy();
        expect(result.submission).toBeTruthy();
        expect(result.review).toBeTruthy();

        // Check assessment normalization
        expect(result.assessment.id).toBe(1);
        expect(result.assessment.name).toBe('Test Assessment');
        expect(result.assessment.groups.length).toBe(1);
        expect(result.assessment.groups[0].questions.length).toBe(4);

        // Check if questions are properly categorized for submitter vs reviewer
        const textQuestion = result.assessment.groups[0].questions[0];
        expect(textQuestion.canAnswer).toBeTrue(); // submitter can answer in assessment mode
        expect(textQuestion.submitterOnly).toBeFalse(); // both submitter and reviewer can access

        const multipleQuestion = result.assessment.groups[0].questions[2];
        expect(multipleQuestion.submitterOnly).toBeTrue(); // only submitter can access

        // Check submission normalization
        expect(result.submission.id).toBe(101);
        expect(result.submission.status).toBe('feedback available'); // Verify status translation
        expect(result.submission.submitterName).toBe('John Doe');

        // Verify answers normalization
        expect(result.submission.answers[1].answer).toBe('This is a text answer');
        expect(result.submission.answers[2].answer).toBe(21); // oneof answer should be a number
        expect(result.submission.answers[3].answer).toEqual([31, 32]); // multiple answer should be array
        expect(result.submission.answers[4].answer).toEqual({
          name: 'image.jpg',
          url: 'http://example.com/image.jpg',
          type: 'image/jpeg'
        });

        // Check review normalization
        expect(result.review.id).toBe(201);
        expect(result.review.status).toBe('done');
        expect(result.review.teamName).toBe('Team Alpha');
        expect(result.review.projectBrief).toEqual({
          id: 'brief-1',
          title: 'Team Alpha Brief',
          description: 'Brief description',
        });

        // Verify review answers normalization
        // Note: When answer is null and no file exists, the expression (answer || file) evaluates to undefined
        expect(result.review.answers[1].answer).toBeUndefined();
        expect(result.review.answers[1].comment).toBe('Good answer');
        expect(result.review.answers[2].answer).toBe(22);
        expect(result.review.answers[2].comment).toBe('Consider the other option');
        // file is normalized and stored as answer, not as separate file property
        expect(result.review.answers[4].answer).toEqual({
          name: 'feedback.jpg',
          url: 'http://example.com/feedback.jpg',
          type: 'image/jpeg',
          size: 1024
        });
        expect(result.review.answers[4].comment).toBe('Clear image');

        done();
      });

      expect(apolloSpy.graphQLFetch).toHaveBeenCalledOnceWith(
        jasmine.any(String),
        {
          variables: {
            assessmentId: 1,
            reviewer: false,
            activityId: 5,
            submissionId: null,
            contextId: 10,
          }
        }
      );
    });

    it('should handle review mode and normalize data differently', (done) => {
      service.fetchAssessment(1, 'review', 5, 10).subscribe(result => {
        // In review mode, the canAnswer property should be different
        const questions = result.assessment.groups[0].questions;

        // All questions that have reviewer in audience should be answerable in review mode
        const textQuestion = questions[0]; // has reviewer in audience
        expect(textQuestion.canAnswer).toBeTrue();

        // Multiple question doesn't have reviewer in audience
        const multipleQuestion = questions[2];
        expect(multipleQuestion.canAnswer).toBeFalse();

        done();
      });

      expect(apolloSpy.graphQLFetch).toHaveBeenCalledWith(
        jasmine.any(String),
        {
          variables: {
            assessmentId: 1,
            reviewer: true, // This is now true for review mode
            activityId: 5,
            submissionId: null,
            contextId: 10,
          }
        }
      );
    });

    it('should handle different types of answers in _normaliseAnswer', (done) => {
      // Modify the mock response to test various answer formats
      // Note: only one answer per questionId since the service uses questionId as key
      // Using question IDs from the mock: 1 (text), 2 (oneof), 3 (multiple), 11 (file)
      mockResponse.data.assessment.submissions[0].answers = [
        { questionId: 1, answer: 'some text' }, // Non-empty text (empty string becomes undefined due to || logic)
        { questionId: 2, answer: '22' }, // String that should be converted to number for oneof
        { questionId: 3, answer: '[31, 32]' }, // Multi-item array as string for multiple
        { questionId: 11, file: null } // Null file (question 11 is the file type)
      ];

      service.fetchAssessment(1, 'assessment', 5, 10).subscribe(result => {
        // Text question - answer should remain as is
        expect(result.submission.answers[1].answer).toBe('some text');

        // Oneof question - string should be converted to number
        expect(result.submission.answers[2].answer).toBe(22);

        // Multiple question - array string should be parsed to array of numbers
        expect(result.submission.answers[3].answer).toEqual([31, 32]);

        // File question - null file should result in null (question 11 is file type)
        expect(result.submission.answers[11].answer).toBeNull();

        done();
      });
    });

    it('should handle file answers correctly', (done) => {
      // Modify the mock to include a file answer in the submission
      // Using question ID 11 which is the file type question
      mockResponse.data.assessment.submissions[0].answers = [
        {
          questionId: 11,
          file: {
            name: 'submission.pdf',
            url: 'http://example.com/submission.pdf',
            type: 'application/pdf'
          }
        }
      ];

      service.fetchAssessment(1, 'assessment', 5, 10).subscribe(result => {
        // File should be normalized properly in submission (question 11 is file type)
        expect(result.submission.answers[11].answer).toEqual({
          name: 'submission.pdf',
          url: 'http://example.com/submission.pdf',
          type: 'application/pdf'
        });

        done();
      });
    });
  });
});
