import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, Directive, forwardRef } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick, inject, flushMicrotasks, flush } from '@angular/core/testing';

import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { AssessmentComponent } from './assessment.component';
import { Assessment, AssessmentService, Submission } from '@v3/services/assessment.service';
import { UtilsService } from '@v3/services/utils.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { ActivityService } from '@v3/services/activity.service';
import { FastFeedbackService } from '@v3/services/fast-feedback.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { SharedService } from '@v3/services/shared.service';
import { FastFeedbackServiceMock } from '@testingv3/mocked.service';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { MockRouter } from '@testingv3/mocked.service';
import { TestUtils } from '@testingv3/utils';
import { ApolloService } from '@v3/app/services/apollo.service';

/**
 * mock value accessor directive to satisfy formControlName bindings
 * on custom elements like app-text, app-oneof, etc.
 */
@Directive({
  selector: '[formControlName]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MockValueAccessorDirective),
      multi: true
    }
  ]
})
class MockValueAccessorDirective implements ControlValueAccessor {
  writeValue(obj: any): void {}
  registerOnChange(fn: any): void {}
  registerOnTouched(fn: any): void {}
}

class Page {
  get savingMessage() {
    return this.query<HTMLElement>('ion-title.sub-title');
  }
  get assessmentName() {
    return this.query<HTMLElement>('h1');
  }
  get assessmentDescription() {
    return this.query<HTMLElement>('ion-content app-description');
  }
  get overDueMsg() {
    return this.query<HTMLElement>('p.over');
  }
  get dueMsg() {
    return this.query<HTMLElement>('p.due-date');
  }
  get submitterMsg() {
    return this.query<HTMLElement>('.review-submitter .title');
  }
  get lockedImg() {
    return this.query<HTMLElement>('ion-list.member-detail-container ion-avatar img');
  }
  get lockedTitle() {
    return this.query<HTMLElement>('ion-list.member-detail-container ion-label h4');
  }
  get groupNames() {
    return this.queryAll<HTMLElement>('form h3');
  }
  get groupDescriptions() {
    return this.queryAll<HTMLElement>('.g-description');
  }
  get questionNames() {
    return this.queryAll<HTMLElement>('.q-title');
  }
  get questionRequiredIndicators() {
    return this.queryAll<HTMLElement>('.required-indicator');
  }
  get questionInfos() {
    return this.queryAll<HTMLElement>('.icon-info');
  }
  get questionDescriptions() {
    return this.queryAll<HTMLElement>('.q-description');
  }
  get questionContent() {
    return this.queryAll<HTMLElement>('.q-content');
  }
  get noAnswerMsg() {
    return this.queryAll<HTMLElement>('.q-content p');
  }
  get submitBtn() {
    return this.query<HTMLButtonElement>('#btn-submit');
  }

  fixture: ComponentFixture<AssessmentComponent>;

  constructor(fixture: ComponentFixture<AssessmentComponent>) {
    this.fixture = fixture;
  }

  //// query helpers ////
  private query<T>(selector: string): T {
    return this.fixture.nativeElement.querySelector(selector);
  }

  private queryAll<T>(selector: string): T[] {
    return this.fixture.nativeElement.querySelectorAll(selector);
  }
}

describe('AssessmentComponent', () => {
  let component: AssessmentComponent;
  let fixture: ComponentFixture<AssessmentComponent>;
  let page: Page;
  let assessmentSpy: jasmine.SpyObj<AssessmentService>;
  let notificationSpy: jasmine.SpyObj<NotificationsService>;
  let activitySpy: jasmine.SpyObj<ActivityService>;
  let fastFeedbackSpy: jasmine.SpyObj<FastFeedbackService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routeStub: Partial<ActivatedRoute>;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;
  let shared: SharedService;
  let utils: UtilsService;
  let apolloSpy: jasmine.SpyObj<ApolloService>;

  const mockQuestions = [
    {
      id: 123,
      name: 'test',
      description: 'test',
      canAnswer: true,
      canComment: false,
      type: 'text',
      isRequired: true,
      audience: ['participant', 'mentor', 'submitter', 'reviewer']
    },
    {
      id: 124,
      name: 'test',
      description: 'test',
      canAnswer: true,
      canComment: false,
      type: 'text',
      isRequired: false,
      audience: ['participant', 'mentor', 'submitter', 'reviewer']
    },
    {
      id: 125,
      name: 'test',
      description: 'test',
      canAnswer: true,
      canComment: false,
      type: 'multiple',
      isRequired: false,
      audience: ['participant', 'mentor', 'submitter', 'reviewer']
    }
  ];

  const mockAssessment: Assessment = {
    id: 1,
    name: 'test',
    description: 'test',
    type: 'quiz',
    isForTeam: false,
    dueDate: '2029-02-02',
    isOverdue: false,
    pulseCheck: false,
    groups: [{
      name: 'test groups',
      description: 'test groups description',
      questions: mockQuestions,
    }],
  };
  const mockSubmission = {
    id: 1,
    status: 'in progress',
    answers: [],
    submitterName: 'name',
    modified: '2019-02-02',
    completed: false,
    isLocked: false,
    submitterImage: '',
    reviewerName: 'name'
  };
  const mockReview = {
    id: 1,
    answers: {},
    status: 'in progress',
    modified: '2019-02-02'
  };
  const mockUser = {
    role: 'participant',
    teamId: 1,
    projectId: 2,
    name: 'Test User',
    email: 'user@test.com',
    id: 1
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      declarations: [AssessmentComponent, MockValueAccessorDirective],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({
                id: 1,
                activityId: 2,
                contextId: 3,
                submissionId: 4
              }),
              data: {
                action: 'assessment',
                from: ''
              },
            },
            params: of(true),
          }
        },
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: SharedService,
          useValue: jasmine.createSpyObj('SharedService', ['stopPlayingVideos'])
        },
        {
          provide: AssessmentService,
          useValue: jasmine.createSpyObj('AssessmentService', ['getAssessment', 'saveAnswers', 'saveFeedbackReviewed', 'popUpReviewRating'])
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', ['alert', 'customToast', 'popUp', 'presentToast', 'modalOnly'])
        },
        {
          provide: ActivityService,
          useValue: jasmine.createSpyObj('ActivityService', ['gotoNextTask'])
        },
        {
          provide: FastFeedbackService,
          useClass: FastFeedbackServiceMock
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['getUser', 'getReferrer', 'get'])
        },
        {
          provide: ApolloService,
          useValue: jasmine.createSpyObj('ApolloService', ['graphQLWatch']),
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
      ]
    }).compileComponents();

  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(AssessmentComponent);
    component = fixture.componentInstance;

    page = new Page(fixture);
    assessmentSpy = TestBed.inject(AssessmentService) as jasmine.SpyObj<AssessmentService>;
    notificationSpy = TestBed.inject(NotificationsService) as jasmine.SpyObj<NotificationsService>;
    activitySpy = TestBed.inject(ActivityService) as jasmine.SpyObj<ActivityService>;
    fastFeedbackSpy = TestBed.inject(FastFeedbackService) as jasmine.SpyObj<FastFeedbackService>;
    routeStub = TestBed.inject(ActivatedRoute);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    apolloSpy = TestBed.inject(ApolloService) as jasmine.SpyObj<ApolloService>;
    shared = TestBed.inject(SharedService);
    utils = TestBed.inject(UtilsService);

    // initialise service calls
    /* assessmentSpy.getAssessment.and.returnValue(of({
      assessment: mockAssessment,
      submission: null,
      review: null
    })); */
    assessmentSpy.saveAnswers.and.returnValue(of(true));
    assessmentSpy.saveFeedbackReviewed.and.returnValue(of({ success: true }));
    // activitySpy.goToNextTask.and.returnValue(Promise.resolve());
    storageSpy.getUser.and.returnValue(mockUser);

    // initialize btnDisabled$ as it's an @Input that is normally set by parent
    component.btnDisabled$ = new BehaviorSubject(false);
    component.savingMessage$ = new BehaviorSubject('');
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges()', () => {
    it('should straightaway return when assessment not loaded', () => {
      expect(component.ngOnChanges({})).toBeFalsy();
    });

  it('should update assessment with latest data', () => {
    component.assessment = mockAssessment;
    component.action = 'assessment';
    component.ngOnChanges({ assessment: {} as any });

    expect(component.doAssessment).toEqual(true);
    expect(component.feedbackReviewed).toEqual(false);
    // btnDisabled$ is true because required questions are not answered yet
    expect(component.btnDisabled$.value).toEqual(true);
    expect(component.isNotInATeam).toEqual(false);
    expect(component.isPendingReview).toEqual(false);
  });

    it('should not allow submission if locked', () => {
      component.assessment = mockAssessment;
      component.action = 'assessment';
      // Create a copy to avoid test pollution
      component.submission = { ...mockSubmission, isLocked: true } as any;
      component.ngOnChanges({ submission: {} as any });

      expect(component.doAssessment).toEqual(false);
      expect(component.submission.status).toEqual('done');
      expect(component.btnDisabled$.value).toEqual(true);
      expect(component.feedbackReviewed).toEqual(component.submission.completed);
    });

    it('should not allow submission', () => {
      component.assessment = mockAssessment;
      component.action = 'assessment';
      // Create a copy to avoid test pollution
      component.submission = { ...mockSubmission, isLocked: true } as any;
      component.ngOnChanges({ submission: {} as any });

      expect(component.doAssessment).toEqual(false);
      expect(component.submission.status).toEqual('done');
      expect(component.btnDisabled$.value).toEqual(true);
      expect(component.feedbackReviewed).toEqual(component.submission.completed);
    });

    it('should save & publish "saving" message', fakeAsync(() => {
      component.assessment = mockAssessment;
      component.action = 'assessment';
      // Create a copy to avoid test pollution
      component.submission = { ...mockSubmission, isLocked: false, status: 'in progress' } as any;
      component.savingMessage$ = new BehaviorSubject('');
      const spy = spyOn(component.savingMessage$, 'next');
      // Pre-create form controls to avoid NG01203 error when change detection runs
      mockQuestions.forEach(q => {
        component.questionsForm.addControl('q-' + q.id, new FormControl(null));
      });
      component.ngOnChanges({ submission: {} as any });

      // Flush all pending timers (200ms for initializePageCompletion, 250ms for scrollActivePageIntoView, 300ms for form subscription)
      tick(350);
      expect(component.doAssessment).toBeTrue();
      const lastSaveMsg = 'Last saved ' + utils.timeFormatter(component.submission.modified);
      expect(spy).toHaveBeenCalledWith(lastSaveMsg);
      // btnDisabled$ is true because required questions are not answered yet
      expect(component.btnDisabled$.value).toEqual(true);
      // Flush any remaining timers
      flush();
    }));

    it('should flag assessment as "pending review"', () => {
      component.assessment = mockAssessment;
      component.assessment.type = 'moderated';

      component.submission = mockSubmission as any;
      component.submission.status = 'pending review';

      component.review = mockReview;
      component.review.status = 'in progress';
      component.savingMessage$ = new BehaviorSubject('');
      const spy = spyOn(component.savingMessage$, 'next');

      component.action = 'review';
      component.ngOnChanges({ review: {} as any });

      const lastSaveMsg = 'Last saved ' + utils.timeFormatter(component.review.modified);
      expect(spy).toHaveBeenCalledWith(lastSaveMsg);
      expect(component.isPendingReview).toBeTrue();
    });


    it('should flag assessment as "complete"', () => {
      component.assessment = mockAssessment;
      component.assessment.type = 'moderated';

      component.submission = mockSubmission as any;
      component.submission.isLocked = false;
      component.submission.status = 'done';
      component.ngOnChanges({ submission: {} as any });

      expect(component.feedbackReviewed).toEqual(component.submission.completed);
    });
  });

  it('should list unanswered required questions from compulsoryQuestionsAnswered()', () => {
    expect(component['_compulsoryQuestionsAnswered']).toBeDefined();
    component.assessment = mockAssessment;
    component.action = 'assessment';
    const answers = [
      {
        'questionId': 123,
        'answer': null
      },
      {
        'questionId': 124,
        'answer': null
      }
    ];

    // Mock form element - create a mock form object
    component.form = {
      nativeElement: {
        querySelector: jasmine.createSpy('querySelector').and.returnValue({
          classList: {
            add: jasmine.createSpy('add')
          }
        })
      }
    } as any;

    const unansweredQuestions = component['_compulsoryQuestionsAnswered'](answers);
    expect(unansweredQuestions).toEqual([mockQuestions[0]]);
  });

  it('should return empty from _compulsoryQuestionsAnswered() if all required question has been answered', () => {
    expect(component['_compulsoryQuestionsAnswered']).toBeDefined();
    component.assessment = mockAssessment;
    const answers = [
      {
        'questionId': 123,
        'answer': 'abc'
      },
      {
        'questionId': 124,
        'answer': null
      }
    ];
    expect(component['_compulsoryQuestionsAnswered'](answers)).toEqual([]);
  });

  describe('_populateQuestionsForm()', () => {
    beforeEach(() => {
      component.questionsForm = new FormGroup({});
      component.btnDisabled$ = new BehaviorSubject(false);
      spyOn(component.btnDisabled$, 'next');
    });

    it('should create form controls for all questions with correct validators', () => {
      // Mock assessment with different question types
      component.assessment = {
        id: 1,
        type: 'quiz',
        isForTeam: false,
        groups: [
          {
            name: 'Group 1',
            questions: [
              {
                id: 1,
                name: 'Required Text Question',
                type: 'text',
                isRequired: true,
                audience: ['submitter']
              },
              {
                id: 2,
                name: 'Optional Multiple Question',
                type: 'multiple',
                isRequired: false,
                audience: ['submitter']
              },
              {
                id: 3,
                name: 'Multi Team Member Selector',
                type: 'multi team member selector',
                isRequired: true,
                audience: ['submitter']
              }
            ]
          }
        ]
      } as any;

      component.doAssessment = true;
      component.isPendingReview = false;
      component.action = 'assessment';

      // Call the method
      component['_populateQuestionsForm']();

      // Check that form controls are created
      expect(component.questionsForm.get('q-1')).toBeTruthy();
      expect(component.questionsForm.get('q-2')).toBeTruthy();
      expect(component.questionsForm.get('q-3')).toBeTruthy();

      // Check that required question has validator
      const requiredControl = component.questionsForm.get('q-1');
      expect(requiredControl.validator).toBeTruthy();

      // Check that optional question has no validator
      const optionalControl = component.questionsForm.get('q-2');
      expect(optionalControl.validator).toBeFalsy();

      // Check that multi team member selector has object with answer array initial value
      const multiControl = component.questionsForm.get('q-3');
      expect(multiControl.value).toEqual({ answer: [] });
    });

    it('should apply required validators only when user can edit (doAssessment = true)', () => {
      component.assessment = {
        id: 1,
        type: 'quiz',
        isForTeam: false,
        groups: [
          {
            name: 'Group 1',
            questions: [
              {
                id: 1,
                name: 'Required Question',
                type: 'text',
                isRequired: true,
                audience: ['submitter']
              }
            ]
          }
        ]
      } as any;

      component.doAssessment = true;
      component.isPendingReview = false;

      component['_populateQuestionsForm']();

      const control = component.questionsForm.get('q-1');
      expect(control.validator).toBeTruthy();
    });

    it('should apply required validators only when user can edit (isPendingReview = true)', () => {
      component.assessment = {
        id: 1,
        type: 'quiz',
        isForTeam: false,
        groups: [
          {
            name: 'Group 1',
            questions: [
              {
                id: 1,
                name: 'Required Question',
                type: 'text',
                isRequired: true,
                audience: ['reviewer']
              }
            ]
          }
        ]
      } as any;

      component.doAssessment = false;
      component.isPendingReview = true;
      component.action = 'review';

      component['_populateQuestionsForm']();

      const control = component.questionsForm.get('q-1');
      expect(control.validator).toBeTruthy();
    });

    it('should not apply required validators when user cannot edit', () => {
      component.assessment = {
        id: 1,
        type: 'quiz',
        isForTeam: false,
        groups: [
          {
            name: 'Group 1',
            questions: [
              {
                id: 1,
                name: 'Required Question',
                type: 'text',
                isRequired: true,
                audience: ['submitter']
              }
            ]
          }
        ]
      } as any;

      component.doAssessment = false;
      component.isPendingReview = false;

      component['_populateQuestionsForm']();

      const control = component.questionsForm.get('q-1');
      expect(control.validator).toBeFalsy();
    });

    it('should use custom validator for reviewer text and file questions', () => {
      component.assessment = {
        id: 1,
        type: 'quiz',
        isForTeam: false,
        groups: [
          {
            name: 'Group 1',
            questions: [
              {
                id: 1,
                name: 'Text Question',
                type: 'text',
                isRequired: true,
                audience: ['reviewer']
              },
              {
                id: 2,
                name: 'File Question',
                type: 'file',
                isRequired: true,
                audience: ['reviewer']
              }
            ]
          }
        ]
      } as any;

      component.doAssessment = false;
      component.isPendingReview = true;
      component.action = 'review';

      component['_populateQuestionsForm']();

      const textControl = component.questionsForm.get('q-1');
      const fileControl = component.questionsForm.get('q-2');

      // Check that custom validator is applied (we can't directly check which validator,
      // but we can verify validator exists and behaves correctly)
      expect(textControl.validator).toBeTruthy();
      expect(fileControl.validator).toBeTruthy();

      // Test custom validator behavior
      textControl.setValue(null);
      expect(textControl.valid).toBeFalsy();
      expect(textControl.errors?.required).toBeTruthy();
    });

    it('should use file validator for learner file questions', () => {
      component.assessment = {
        id: 1,
        type: 'quiz',
        isForTeam: false,
        groups: [
          {
            name: 'Group 1',
            questions: [
              {
                id: 1,
                name: 'File Question',
                type: 'file',
                isRequired: true,
                audience: ['submitter']
              }
            ]
          }
        ]
      } as any;

      component.doAssessment = true;
      component.isPendingReview = false;
      component.action = 'assessment';

      component['_populateQuestionsForm']();

      const control = component.questionsForm.get('q-1');
      expect(control.validator).toBeTruthy();

      // Test file validator behavior
      control.setValue(null);
      expect(control.valid).toBeFalsy();
      expect(control.errors?.required).toBeTruthy();
    });

    it('should initialize review form structure correctly', () => {
      component.assessment = {
        id: 1,
        type: 'quiz',
        isForTeam: false,
        groups: [
          {
            name: 'Group 1',
            questions: [
              {
                id: 1,
                name: 'Text Question',
                type: 'text',
                isRequired: true,
                audience: ['reviewer']
              },
              {
                id: 2,
                name: 'Multi Team Member Selector',
                type: 'multi team member selector',
                isRequired: false,
                audience: ['reviewer']
              }
            ]
          }
        ]
      } as any;

      component.action = 'review';
      component.doAssessment = false;
      component.isPendingReview = true;

      component['_populateQuestionsForm']();

      const textControl = component.questionsForm.get('q-1');
      const multiControl = component.questionsForm.get('q-2');

      // Check review form structure
      expect(textControl.value).toEqual({
        comment: '',
        answer: '',
        file: null
      });

      // Check multi team member selector has answer as array
      expect(multiControl.value.answer).toEqual([]);
      expect(multiControl.value.comment).toBe('');
      expect(multiControl.value.file).toBe(null);
    });

    it('should disable button when no questions exist', () => {
      component.assessment = {
        id: 1,
        type: 'quiz',
        isForTeam: false,
        groups: []
      } as any;

      // isEmpty is already spied by TestUtils, just override return value
      (utils.isEmpty as jasmine.Spy).and.returnValue(true);

      component['_populateQuestionsForm']();

      expect(component.btnDisabled$.next).toHaveBeenCalledWith(true);
    });

    it('should set up form value change subscription', fakeAsync(() => {
      component.assessment = {
        id: 1,
        type: 'quiz',
        isForTeam: false,
        groups: [
          {
            name: 'Group 1',
            questions: [
              {
                id: 1,
                name: 'Text Question',
                type: 'text',
                isRequired: false,
                audience: ['submitter']
              }
            ]
          }
        ]
      } as any;

      component.doAssessment = true;
      component.isPendingReview = false;

      spyOn(component, 'initializePageCompletion');
      spyOn(component, 'setSubmissionDisabled');
      // isEmpty is already spied by TestUtils, just override return value
      (utils.isEmpty as jasmine.Spy).and.returnValue(false);

      component['_populateQuestionsForm']();

      // Wait for the setTimeout(300) that sets up the subscription
      tick(300);

      // Trigger form value change
      component.questionsForm.get('q-1').setValue('test value');

      // Wait for debounceTime(300)
      tick(300);

      expect(component.initializePageCompletion).toHaveBeenCalled();
      expect(component.setSubmissionDisabled).toHaveBeenCalled();
    }));

    it('should handle multiple groups with different question types', () => {
      component.assessment = {
        id: 1,
        type: 'quiz',
        isForTeam: false,
        groups: [
          {
            name: 'Group 1',
            questions: [
              {
                id: 1,
                name: 'Text Question',
                type: 'text',
                isRequired: true,
                audience: ['submitter']
              }
            ]
          },
          {
            name: 'Group 2',
            questions: [
              {
                id: 2,
                name: 'Multiple Question',
                type: 'multiple',
                isRequired: false,
                audience: ['submitter']
              },
              {
                id: 3,
                name: 'File Question',
                type: 'file',
                isRequired: true,
                audience: ['submitter']
              }
            ]
          }
        ]
      } as any;

      component.doAssessment = true;
      component.isPendingReview = false;
      component.action = 'assessment';

      component['_populateQuestionsForm']();

      // Check all controls are created
      expect(component.questionsForm.get('q-1')).toBeTruthy();
      expect(component.questionsForm.get('q-2')).toBeTruthy();
      expect(component.questionsForm.get('q-3')).toBeTruthy();

      // Check validators are applied correctly
      expect(component.questionsForm.get('q-1').validator).toBeTruthy(); // required text
      expect(component.questionsForm.get('q-2').validator).toBeFalsy();  // optional multiple
      expect(component.questionsForm.get('q-3').validator).toBeTruthy(); // required file
    });

    it('should not apply validators for questions not in user audience', () => {
      component.assessment = {
        id: 1,
        type: 'quiz',
        isForTeam: false,
        groups: [
          {
            name: 'Group 1',
            questions: [
              {
                id: 1,
                name: 'Reviewer Only Question',
                type: 'text',
                isRequired: true,
                audience: ['reviewer'] // submitter not in audience
              }
            ]
          }
        ]
      } as any;

      component.doAssessment = true; // user is doing assessment (submitter role)
      component.isPendingReview = false;
      component.action = 'assessment';

      component['_populateQuestionsForm']();

      const control = component.questionsForm.get('q-1');
      expect(control.validator).toBeFalsy(); // should not have validator since not in audience
    });
  });

  describe('should get correct assessment answers when', () => {
    let assessment;
    let answers;
    let btnDisabled = false;

    beforeEach(() => {
      component.assessment = mockAssessment;
      component.doAssessment = true;
      component.contextId = 2;
      component.assessment.isForTeam = true;
      component.questionsForm = new FormGroup({
        'q-123': new FormControl('abc'),
        'q-124': new FormControl(),
        'q-125': new FormControl()
      });
    });

    afterEach(() => {
      expect(component.btnDisabled$.value).toBe(btnDisabled);
      expect(notificationSpy.popUp.calls.count()).toBe(0);
      expect(component.assessment.id).toBe(1);
      expect(component.contextId).toBe(2);
      expect(answers).toEqual([
        {
          questionId: 123,
          answer: 'abc'
        },
        {
          questionId: 124,
          answer: null
        },
        {
          questionId: 125,
          answer: []
        }
      ]);
    });

    xit('saving in progress', () => {
      const spy = spyOn(component.save, 'emit');
      component._submitAnswer({autoSave: true});
      btnDisabled = true;

      const args = spy.calls.first().args;
      assessment = args[0].assessment;
      answers = args[0].answers;

      // expect(component.submitting).toBeFalsy();
      expect(spy).toHaveBeenCalled();
      expect(assessment.inProgress).toBe(true);
      expect(assessment.unlock).toBeFalsy();
    });

    xit('submitting', () => {
      const spy = spyOn(component.save, 'emit');
      // component.save = jasmine.createSpyObj('save', ['emit']);
      btnDisabled = true;
      component.isPendingReview = false;
      component.doAssessment = true;
      component._submitAnswer({autoSave: true}); // save in progress

      const args = spy.calls.first().args;
      assessment = args[0].assessment;
      answers = args[0].answers;
      expect(component.save.emit).toHaveBeenCalled();
    });
  });

  xit('should alert when compulsory question not answered', () => {
    component.assessment = mockAssessment;
    component.doAssessment = true;
    component.questionsForm = new FormGroup({
      'q-123': new FormControl(),
      'q-124': new FormControl(),
      'q-125': new FormControl()
    });
    component._submitAnswer({autoSave: false});
    expect(notificationSpy.alert.calls.count()).toBe(1);
  });

  describe('submitting assessment submit(false)', () => {
    const activityId = 1;
    const emptyAnswers = [];
    const action = 'assessment';
    const assessmentId = 0;

    beforeEach(() => {
      component.doAssessment = true;
      component.contextId = 2;
      component.action = action;
      component.assessment = {
        id: 1,
        name: 'Test Assessment',
        type: 'quiz',
        description: 'Test Description',
        isForTeam: false,
        dueDate: '',
        isOverdue: false,
        groups: [],
        pulseCheck: true,
      };
    });

    xit('should be called with correct assessment answer/action/activity status', () => {
      component.save = jasmine.createSpyObj('save', ['emit']);
      component.questionsForm = new FormGroup({});
      utils.each = jasmine.createSpy('each');
      component._submitAnswer({autoSave: false});
      expect(utils.each).toHaveBeenCalled();
      expect(component.save.emit).toHaveBeenCalled();
      /* expect(assessmentSpy.saveAnswers).toHaveBeenCalled();
      expect(assessmentSpy.saveAnswers).toHaveBeenCalledWith(
        {
          id: activityId,
          contextId: 2
        },
        emptyAnswers,
        action,
        false // no need pulse check for this test
      ); */
    });

    xit(`should check fastfeedback availability as pulseCheck is 'true'`, () => {
      component.questionsForm = new FormGroup({});
      component._submitAnswer({autoSave: false});
      const spy = spyOn(fastFeedbackSpy, 'pullFastFeedback').and.returnValue(of(fastFeedbackSpy.pullFastFeedback()));
      fixture.detectChanges();
      expect(fastFeedbackSpy.pullFastFeedback.calls.count()).toEqual(1);
    });

    xit('should skip fastfeedback if pulsecheck = false', () => {
      component.questionsForm = new FormGroup({});
      component.assessment.pulseCheck = false;
      spyOn(fastFeedbackSpy, 'pullFastFeedback');
      component._submitAnswer({autoSave: false});
      expect(fastFeedbackSpy.pullFastFeedback.calls.count()).toEqual(0);
    });
  });

  describe('showQuestionInfo()', () => {
    it('should popup info modal', () => {
      component.showQuestionInfo('abc');
      expect(notificationSpy.popUp.calls.count()).toBe(1);
    });

    it('should popup info modal (with keyboard navigation)', () => {
      const keyboard = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
      });
      const spy = spyOn(keyboard, 'preventDefault');
      component.showQuestionInfo('abc', keyboard);
      expect(notificationSpy.popUp.calls.count()).toBe(1);
      expect(spy).toHaveBeenCalled();
    });

    it('should not popup info modal (with wrong keyboard navigation)', () => {
      const keyboard = new KeyboardEvent('keydown', {
        key: 'Tab',
        code: 'Tab',
      });
      component.showQuestionInfo('abc', keyboard);
      expect(notificationSpy.popUp.calls.count()).toBe(0);
    });
  });

  describe('continueToNextTask()', () => {
    it('should submit assessment', () => {
      component.doAssessment = true;
      expect(component.btnText).toEqual('submit answers');

      component.isPendingReview = true;
      expect(component.btnText).toEqual('submit answers');

      // continueToNextTask pushes to submitActions, which then triggers _submitAnswer via subscription
      const spy = spyOn(component.submitActions, 'next');
      component.continueToNextTask();
      expect(spy).toHaveBeenCalledWith({ autoSave: false, goBack: false });
    });

    it('should mark feedback as read', () => {
      component.submission = mockSubmission as any;
      component.submission.status = 'published';
      component.feedbackReviewed = false;
      expect(component.btnText).toEqual('mark feedback as reviewed');

      component.submission = mockSubmission as any;
      component.submission.status = 'feedback available';
      component.submission.completed = false;
      expect(component.btnText).toEqual('mark feedback as reviewed');

      const spy = spyOn(component.readFeedback, 'emit');
      component.continueToNextTask();
      expect(spy).toHaveBeenCalled();
    });

    it('should emit continue', () => {
      component.submission = mockSubmission as any;
      component.submission.status = 'done';
      expect(component.btnText).toEqual('continue');

      const spy = spyOn(component.continue, 'emit');
      component.continueToNextTask();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('label()', () => {
    it('should return "in progress"', () => {
      component.submission = mockSubmission as any;
      component.submission.status = 'in progress';
      component.assessment = mockAssessment;
      component.assessment.isForTeam = true;
      component.submission.isLocked = true;
      expect(component.label).toEqual('in progress');
    });

    it('should return "overdue"', () => {
      component.submission = mockSubmission as any;
      component.assessment = mockAssessment;
      component.assessment.isForTeam = false;
      component.assessment.isOverdue = true;
      component.submission.status = 'in progress';
      expect(component.label).toEqual('overdue');

      component.assessment.isOverdue = false;
      expect(component.label).toEqual('');
    });

    it('should return empty string ("")', () => {
      component.submission = mockSubmission as any;
      component.assessment = mockAssessment;
      component.submission.isLocked = false;
      component.assessment.isForTeam = false;
      component.submission.status = 'published';
      expect(component.label).toEqual('published');
    });
  });

  describe('labelColor()', () => {
    beforeEach(() => {
      component.submission = mockSubmission as any;
      component.assessment = mockAssessment;
    });

    it('should returns dark-blue when team submission is locked', () => {
      component.submission.status = 'pending review';
      component.assessment.isForTeam = true;
      component.submission.isLocked = true;
      expect(component.labelColor).toEqual('dark-blue');
    });

    it('should be "warning black" at submission.status = "pending review"', () => {
      component.submission.status = 'pending review';
      component.assessment.isForTeam = false;
      component.submission.isLocked = false;
      expect(component.labelColor).toEqual('warning black');
    });

    it('should be "success" at submission.status = "feedback available"', () => {
      component.submission.status = 'feedback available';
      component.assessment.isForTeam = false;
      component.submission.isLocked = false;
      expect(component.labelColor).toEqual('success');
    });

    it('should be "success" at submission.status = "feedback available"', () => {
      component.submission.status = 'in progress';
      component.assessment.isForTeam = false;
      component.assessment.isOverdue = true;
      component.submission.isLocked = false;
      expect(component.labelColor).toEqual('danger');
    });

    it('should return empty when submission is done', () => {
      component.submission.status = 'done';
      expect(component.labelColor).toEqual('');
    });

    it('should return danger when status is in progress and is overdue', () => {
      component.submission.status = 'in progress';
      component.assessment.isForTeam = false;
      component.assessment.isOverdue = true;
      component.submission.isLocked = false;
      expect(component.labelColor).toEqual('danger');
    });
  });

  describe('ionViewWillLeave()', () => {
    it('should stop all playing video', () => {
      component.ionViewWillLeave();
      expect(shared.stopPlayingVideos).toHaveBeenCalled();
    });
  });

  describe('restrictedAccess()', () => {
    it('should read singlePageAccess flag from localstorage', () => {
      const result = true;
      storageSpy.singlePageAccess = result;
      expect(component.restrictedAccess).toEqual(result);
    });
  });

  describe('scrollIntoView for unanswered question', () => {
    it('should scroll to the required question and add/remove blink class', fakeAsync(() => {
      const elementId = '#test-element';
      const element = document.createElement('div');
      element.id = 'test-element';
      document.body.appendChild(element);

      spyOn(document, 'querySelector').and.returnValue(element);
      component.scrollToRequiredQuestion(elementId);

      expect(utils.scrollToElement).toHaveBeenCalledWith(element);
      expect(element.classList.contains('blink')).toBeTrue();

      tick(2000); // Simulate the passage of time
      expect(element.classList.contains('blink')).toBeFalse();

      document.body.removeChild(element);
    }));
  });

  describe('_compulsoryQuestionsAnswered', () => {
    it('should return empty array when all required questions are answered', () => {
      // Set up mock assessment with required questions
      component.assessment = {
        id: 1,
        type: 'default',
        isForTeam: false,
        groups: [
          {
            name: 'Group 1',
            questions: [
              {
                id: 1,
                name: 'Question 1',
                type: 'text',
                isRequired: true,
                audience: ['submitter']
              },
              {
                id: 2,
                name: 'Question 2',
                type: 'multiple',
                isRequired: true,
                audience: ['submitter']
              }
            ]
          }
        ]
      } as any;

      // Set up mock answers
      const answers = [
        { questionId: 1, answer: 'Answer to question 1' },
        { questionId: 2, answer: ['Option 1', 'Option 2'] }
      ];

      // Test the function
      const missingQuestions = component['_compulsoryQuestionsAnswered'](answers);

      // Expect no missing questions
      expect(missingQuestions.length).toBe(0);
    });

    it('should return questions that are required but not answered', () => {
      // Set action to assessment
      component.action = 'assessment';

      // Set up mock assessment with required questions
      component.assessment = {
        id: 1,
        type: 'default',
        isForTeam: false,
        groups: [
          {
            name: 'Group 1',
            questions: [
              {
                id: 1,
                name: 'Question 1',
                type: 'text',
                isRequired: true,
                audience: ['submitter']
              },
              {
                id: 2,
                name: 'Question 2',
                type: 'text',
                isRequired: true,
                audience: ['submitter']
              }
            ]
          }
        ]
      } as any;

      // Set up mock answers with one missing
      const answers = [
        { questionId: 1, answer: 'Answer to question 1' }
        // Question 2 is missing
      ];

      // Mock form element - create a mock form object
      component.form = {
        nativeElement: {
          querySelector: jasmine.createSpy('querySelector').and.returnValue({
            classList: {
              add: jasmine.createSpy('add')
            }
          })
        }
      } as any;

      // Test the function
      const missingQuestions = component['_compulsoryQuestionsAnswered'](answers);

      // Expect one missing question
      expect(missingQuestions.length).toBe(1);
      expect(missingQuestions[0].id).toBe(2);
      expect(component.form.nativeElement.querySelector).toHaveBeenCalledWith('#q-2');
    });

    it('should return empty array when either answer or file is provided for required question in review mode', () => {
      // Set action to review
      component.action = 'review';

      // Set up mock assessment with required questions for reviewer
      component.assessment = {
        id: 1,
        type: 'default',
        isForTeam: false,
        groups: [
          {
            name: 'Group 1',
            questions: [
              {
                id: 1,
                name: 'Question 1',
                type: 'text',
                isRequired: true,
                audience: ['reviewer']
              }
            ]
          }
        ]
      } as any;

      // Mock answers for review (both answer and file are provided)
      const answers = [
        { questionId: 1, answer: 'Some answer', file: null }
      ];

      // Test the function
      const missingQuestions = component['_compulsoryQuestionsAnswered'](answers);

      // Expect no missing questions
      expect(missingQuestions.length).toBe(0);
    });

    it('should handle review action properly', () => {
      // Set action to review
      component.action = 'review';

      // Set up mock assessment with required questions for reviewer
      component.assessment = {
        id: 1,
        type: 'default',
        isForTeam: false,
        groups: [
          {
            name: 'Group 1',
            questions: [
              {
                id: 1,
                name: 'Question 1',
                type: 'text',
                isRequired: true,
                audience: ['reviewer']
              }
            ]
          }
        ]
      } as any;

      // Mock answers for review (both answer and file are empty)
      const answers = [
        { questionId: 1, answer: '', file: null }
      ];

      // Mock form element - create a mock form object
      component.form = {
        nativeElement: {
          querySelector: jasmine.createSpy('querySelector').and.returnValue({
            classList: {
              add: jasmine.createSpy('add')
            }
          })
        }
      } as any;

      // Test the function
      const missingQuestions = component['_compulsoryQuestionsAnswered'](answers);

      // Expect one missing question
      expect(missingQuestions.length).toBe(1);
      expect(missingQuestions[0].id).toBe(1);
    });
  });
});
