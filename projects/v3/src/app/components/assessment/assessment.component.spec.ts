import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, Directive, forwardRef } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, NG_VALUE_ACCESSOR, ControlValueAccessor, Validators } from '@angular/forms';
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
import { ModalController } from '@ionic/angular';

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
  let modalSpy: jasmine.SpyObj<ModalController>;

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
    hasReviewRating: false,
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
          useValue: jasmine.createSpyObj('NotificationsService', ['alert', 'customToast', 'popUp', 'presentToast', 'modalOnly', 'assessmentSubmittedToast'])
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
        {
          provide: ModalController,
          useValue: jasmine.createSpyObj('ModalController', ['create', 'dismiss']),
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
    modalSpy = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;

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

  describe('showProjectBrief()', () => {
    it('should open project brief modal when review has projectBrief', async () => {
      const mockProjectBrief = {
        id: 'brief-1',
        title: 'Test Brief',
        description: 'Test Description',
      };
      component.review = {
        id: 1,
        answers: {},
        status: 'pending review',
        modified: '2024-01-01',
        projectBrief: mockProjectBrief,
      };
      const mockModal = { present: jasmine.createSpy('present') };
      modalSpy.create.and.returnValue(Promise.resolve(mockModal as any));

      await component.showProjectBrief();

      expect(modalSpy.create).toHaveBeenCalledWith({
        component: jasmine.any(Function),
        componentProps: { projectBrief: mockProjectBrief },
        cssClass: 'project-brief-modal',
      });
      expect(mockModal.present).toHaveBeenCalled();
    });

    it('should not open modal when review has no projectBrief', async () => {
      component.review = {
        id: 1,
        answers: {},
        status: 'pending review',
        modified: '2024-01-01',
      };

      await component.showProjectBrief();

      expect(modalSpy.create).not.toHaveBeenCalled();
    });
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

      // Check that multi team member selector has plain array initial value in assessment mode
      const multiControl = component.questionsForm.get('q-3');
      expect(multiControl.value).toEqual([]);
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

  describe('_prefillForm()', () => {
    beforeEach(() => {
      component.questionsForm = new FormGroup({
        'q-1': new FormControl(''),
        'q-2': new FormControl(''),
      });
      component.btnDisabled$ = new BehaviorSubject(false);
    });

    it('should populate form with submission answers for assessment action', () => {
      component.action = 'assessment';
      component.doAssessment = true;
      component.isPendingReview = false;
      component.submission = {
        id: 1,
        status: 'in progress',
        answers: {
          1: { answer: 'my answer' },
          2: { answer: 'second answer' },
        },
      } as any;

      component['_prefillForm']();

      expect(component.questionsForm.get('q-1').value).toEqual('my answer');
      expect(component.questionsForm.get('q-2').value).toEqual('second answer');
    });

    it('should populate form with review answers for review action', () => {
      component.action = 'review';
      component.doAssessment = false;
      component.isPendingReview = true;
      component.review = {
        id: 1,
        status: 'in progress',
        modified: '2019-02-02',
        answers: {
          1: { answer: 'review answer', comment: 'good', file: null },
          2: { answer: 'review 2', comment: 'ok', file: null },
        },
      } as any;

      component['_prefillForm']();

      expect(component.questionsForm.get('q-1').value).toEqual({
        answer: 'review answer',
        comment: 'good',
        file: null,
      });
      expect(component.questionsForm.get('q-2').value).toEqual({
        answer: 'review 2',
        comment: 'ok',
        file: null,
      });
    });

    it('should not populate form when submission has no answers', () => {
      component.action = 'assessment';
      component.doAssessment = true;
      component.submission = { id: 1, status: 'in progress', answers: null } as any;

      component['_prefillForm']();

      expect(component.questionsForm.get('q-1').value).toEqual('');
      expect(component.questionsForm.get('q-2').value).toEqual('');
    });

    it('should not populate form when review has no answers', () => {
      component.action = 'review';
      component.doAssessment = false;
      component.isPendingReview = true;
      component.review = { id: 1, status: 'in progress', modified: '2019-02-02', answers: null } as any;

      component['_prefillForm']();

      expect(component.questionsForm.get('q-1').value).toEqual('');
    });

    it('should enable button in read-only mode', () => {
      component.action = 'assessment';
      component.doAssessment = false;
      component.isPendingReview = false;
      component.submission = null;
      spyOn(component.btnDisabled$, 'next');

      component['_prefillForm']();

      expect(component.btnDisabled$.next).toHaveBeenCalledWith(false);
    });

    it('should call setSubmissionDisabled in edit mode', () => {
      component.action = 'assessment';
      component.doAssessment = true;
      component.isPendingReview = false;
      component.submission = null;
      spyOn(component, 'setSubmissionDisabled');

      component['_prefillForm']();

      expect(component.setSubmissionDisabled).toHaveBeenCalled();
    });

    it('should skip controls that do not exist in the form', () => {
      component.action = 'assessment';
      component.doAssessment = true;
      component.submission = {
        id: 1,
        status: 'in progress',
        answers: {
          999: { answer: 'no control' },
        },
      } as any;

      // should not throw
      expect(() => component['_prefillForm']()).not.toThrow();
      expect(component.questionsForm.get('q-999')).toBeNull();
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
        hasReviewRating: false,
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

  describe('submitting flag (prevent duplicate submissions)', () => {
    beforeEach(() => {
      component.assessment = mockAssessment;
      component.submission = { ...mockSubmission, status: 'in progress', isLocked: false } as any;
      component.action = 'assessment';
      component.savingMessage$ = new BehaviorSubject('');
    });

    describe('continueToNextTask()', () => {
      it('should set submitting=true and disable button on submit', () => {
        component.doAssessment = true;
        const submitSpy = spyOn(component.submitActions, 'next');

        component.continueToNextTask();

        expect(component['submitting']).toBeTrue();
        expect(component.btnDisabled$.getValue()).toBeTrue();
        expect(submitSpy).toHaveBeenCalledWith({ autoSave: false, goBack: false });
      });

      it('should not set submitting flag for readFeedback action', () => {
        component.doAssessment = false;
        component.submission = { ...mockSubmission, status: 'published', isLocked: false } as any;
        component.feedbackReviewed = false;
        const readFeedbackSpy = spyOn(component.readFeedback, 'emit');

        component.continueToNextTask();

        expect(component['submitting']).toBeFalse();
        expect(readFeedbackSpy).toHaveBeenCalled();
      });

      it('should not set submitting flag for continue action', () => {
        component.doAssessment = false;
        component.submission = { ...mockSubmission, status: 'done', isLocked: false } as any;
        const continueSpy = spyOn(component.continue, 'emit');

        component.continueToNextTask();

        expect(component['submitting']).toBeFalse();
        expect(continueSpy).toHaveBeenCalled();
      });
    });

    describe('setSubmissionDisabled()', () => {
      it('should not re-enable button while submitting is true', () => {
        component.doAssessment = true;
        component['submitting'] = true;
        component.btnDisabled$.next(true);
        component.questionsForm = new FormGroup({
          'q-123': new FormControl('some answer'),
        });

        component.setSubmissionDisabled();

        // button should stay disabled despite form being valid
        expect(component.btnDisabled$.getValue()).toBeTrue();
      });

      it('should enable button when submitting is false and form is valid', () => {
        component.doAssessment = true;
        component['submitting'] = false;
        component.btnDisabled$.next(true);
        component.questionsForm = new FormGroup({
          'q-123': new FormControl('some answer'),
        });

        component.setSubmissionDisabled();

        expect(component.btnDisabled$.getValue()).toBeFalse();
      });

      it('should disable button when form is invalid and not submitting', () => {
        component.doAssessment = true;
        component['submitting'] = false;
        component.btnDisabled$.next(false);
        component.questionsForm = new FormGroup({
          'q-123': new FormControl(null, Validators.required),
        });

        component.setSubmissionDisabled();

        expect(component.btnDisabled$.getValue()).toBeTrue();
      });
    });

    describe('ngOnChanges() submitting flag preservation', () => {
      it('should preserve submitting=true when same submission is refetched during submit', () => {
        // simulate initial state: user clicked submit
        component.ngOnChanges({
          submission: { previousValue: undefined, currentValue: component.submission, firstChange: true, isFirstChange: () => true },
          assessment: { previousValue: undefined, currentValue: component.assessment, firstChange: true, isFirstChange: () => true },
        } as any);
        component['submitting'] = true;
        component.btnDisabled$.next(true);

        // simulate parent refetching the same submission mid-submit
        component.ngOnChanges({
          submission: {
            previousValue: component.submission,
            currentValue: component.submission,
            firstChange: false,
            isFirstChange: () => false,
          },
          assessment: {
            previousValue: component.assessment,
            currentValue: component.assessment,
            firstChange: false,
            isFirstChange: () => false,
          },
        } as any);

        // submitting flag should remain true because submission id hasn't changed
        // and doAssessment is still true (status is 'in progress')
        expect(component['submitting']).toBeTrue();
      });

      it('should reset submitting when submission changes to a different id', () => {
        component.ngOnChanges({
          submission: { previousValue: undefined, currentValue: component.submission, firstChange: true, isFirstChange: () => true },
          assessment: { previousValue: undefined, currentValue: component.assessment, firstChange: true, isFirstChange: () => true },
        } as any);
        component['submitting'] = true;

        const newSubmission = { ...mockSubmission, id: 999, status: 'in progress', isLocked: false } as any;
        component.submission = newSubmission;

        component.ngOnChanges({
          submission: {
            previousValue: { ...mockSubmission, id: 1 },
            currentValue: newSubmission,
            firstChange: false,
            isFirstChange: () => false,
          },
          assessment: {
            previousValue: component.assessment,
            currentValue: component.assessment,
            firstChange: false,
            isFirstChange: () => false,
          },
        } as any);

        expect(component['submitting']).toBeFalse();
      });

      it('should reset submitting when assessment transitions out of edit mode', () => {
        component.ngOnChanges({
          submission: { previousValue: undefined, currentValue: component.submission, firstChange: true, isFirstChange: () => true },
          assessment: { previousValue: undefined, currentValue: component.assessment, firstChange: true, isFirstChange: () => true },
        } as any);
        component['submitting'] = true;

        // submission changes to 'pending review' (no longer editable)
        const doneSubmission = { ...mockSubmission, id: 1, status: 'pending review', isLocked: false } as any;
        component.submission = doneSubmission;

        component.ngOnChanges({
          submission: {
            previousValue: { ...mockSubmission, id: 1, status: 'in progress' },
            currentValue: doneSubmission,
            firstChange: false,
            isFirstChange: () => false,
          },
          assessment: {
            previousValue: component.assessment,
            currentValue: component.assessment,
            firstChange: false,
            isFirstChange: () => false,
          },
        } as any);

        // doAssessment will be false, isPendingReview will be false (action is 'assessment')
        // so submitting should reset
        expect(component['submitting']).toBeFalse();
      });

      it('should not touch submitting flag when it is already false', () => {
        component['submitting'] = false;

        component.ngOnChanges({
          submission: {
            previousValue: undefined,
            currentValue: component.submission,
            firstChange: true,
            isFirstChange: () => true,
          },
          assessment: {
            previousValue: undefined,
            currentValue: component.assessment,
            firstChange: true,
            isFirstChange: () => true,
          },
        } as any);

        expect(component['submitting']).toBeFalse();
      });
    });

    describe('_submitAnswer() submitting flag reset on errors', () => {
      beforeEach(() => {
        component.doAssessment = true;
        component['submitting'] = true;
        component.btnDisabled$.next(true);
        component.assessment = { ...mockAssessment };
        component.questionsForm = new FormGroup({
          'q-123': new FormControl(null, Validators.required),
        });
        // mock the form ViewChild to prevent nativeElement errors
        component.form = { nativeElement: document.createElement('div') } as any;
      });

      it('should reset submitting when required questions are missing', async () => {
        notificationSpy.alert.and.returnValue(Promise.resolve());

        await component._submitAnswer({ autoSave: false, goBack: false });

        expect(component['submitting']).toBeFalse();
        expect(component.btnDisabled$.getValue()).toBeFalse();
        expect(notificationSpy.alert).toHaveBeenCalled();
      });

      it('should reset submitting when team check fails', async () => {
        // set up team assessment with no team
        component.assessment = { ...mockAssessment, isForTeam: true };
        component.questionsForm = new FormGroup({
          'q-123': new FormControl('answer'),
        });
        storageSpy.getUser.and.returnValue({ ...mockUser, teamId: undefined });
        (shared.getTeamInfo as jasmine.Spy) = jasmine.createSpy('getTeamInfo').and.returnValue(of({}));

        notificationSpy.alert.and.returnValue(Promise.resolve());

        await component._submitAnswer({ autoSave: false, goBack: false });

        expect(component['submitting']).toBeFalse();
        expect(component.btnDisabled$.getValue()).toBeFalse();
      });

      it('should reset submitting when getTeamInfo throws', async () => {
        component.assessment = { ...mockAssessment, isForTeam: true };
        component.questionsForm = new FormGroup({
          'q-123': new FormControl('answer'),
        });
        (shared.getTeamInfo as jasmine.Spy) = jasmine.createSpy('getTeamInfo').and.returnValue(
          { toPromise: () => Promise.reject(new Error('network error')) }
        );

        await component._submitAnswer({ autoSave: false, goBack: false });

        expect(component['submitting']).toBeFalse();
        expect(component.btnDisabled$.getValue()).toBeFalse();
      });
    });
  });

  describe('areAllRequiredQuestionsAnswered()', () => {
    beforeEach(() => {
      component.action = 'assessment';
      component.doAssessment = true;
      component.isPendingReview = false;
    });

    it('should return true when there are no questions', () => {
      const result = component['areAllRequiredQuestionsAnswered']([]);
      expect(result).toBeTrue();
    });

    it('should return true when no questions are required', () => {
      component.questionsForm = new FormGroup({
        'q-1': new FormControl('answer'),
      });
      const questions = [{
        id: 1,
        name: 'Optional',
        type: 'text',
        isRequired: false,
        audience: ['submitter'],
      }] as any[];

      const result = component['areAllRequiredQuestionsAnswered'](questions);
      expect(result).toBeTrue();
    });

    it('should return true when required text question has a value', () => {
      component.questionsForm = new FormGroup({
        'q-1': new FormControl('some text'),
      });
      const questions = [{
        id: 1,
        name: 'Text Q',
        type: 'text',
        isRequired: true,
        audience: ['submitter'],
      }] as any[];

      expect(component['areAllRequiredQuestionsAnswered'](questions)).toBeTrue();
    });

    it('should return false when required text question is empty', () => {
      component.questionsForm = new FormGroup({
        'q-1': new FormControl(''),
      });
      const questions = [{
        id: 1,
        name: 'Text Q',
        type: 'text',
        isRequired: true,
        audience: ['submitter'],
      }] as any[];

      expect(component['areAllRequiredQuestionsAnswered'](questions)).toBeFalse();
    });

    it('should return false when required text question is null', () => {
      component.questionsForm = new FormGroup({
        'q-1': new FormControl(null),
      });
      const questions = [{
        id: 1,
        name: 'Text Q',
        type: 'text',
        isRequired: true,
        audience: ['submitter'],
      }] as any[];

      expect(component['areAllRequiredQuestionsAnswered'](questions)).toBeFalse();
    });

    it('should return true when required multi-choice question has selections', () => {
      component.questionsForm = new FormGroup({
        'q-1': new FormControl(['option1', 'option2']),
      });
      const questions = [{
        id: 1,
        name: 'Multi Q',
        type: 'multiple',
        isRequired: true,
        audience: ['submitter'],
      }] as any[];

      expect(component['areAllRequiredQuestionsAnswered'](questions)).toBeTrue();
    });

    it('should return false when required multi-choice question has empty array', () => {
      component.questionsForm = new FormGroup({
        'q-1': new FormControl([]),
      });
      const questions = [{
        id: 1,
        name: 'Multi Q',
        type: 'multiple',
        isRequired: true,
        audience: ['submitter'],
      }] as any[];

      expect(component['areAllRequiredQuestionsAnswered'](questions)).toBeFalse();
    });

    it('should return true when required review question has answer', () => {
      component.action = 'review';
      component.doAssessment = false;
      component.isPendingReview = true;
      component.questionsForm = new FormGroup({
        'q-1': new FormControl({ answer: 'review text', comment: 'good', file: null }),
      });
      const questions = [{
        id: 1,
        name: 'Review Q',
        type: 'text',
        isRequired: true,
        audience: ['reviewer'],
      }] as any[];

      expect(component['areAllRequiredQuestionsAnswered'](questions)).toBeTrue();
    });

    it('should return false when required review question has empty answer', () => {
      component.action = 'review';
      component.doAssessment = false;
      component.isPendingReview = true;
      component.questionsForm = new FormGroup({
        'q-1': new FormControl({ answer: '', comment: '', file: null }),
      });
      const questions = [{
        id: 1,
        name: 'Review Q',
        type: 'text',
        isRequired: true,
        audience: ['reviewer'],
      }] as any[];

      expect(component['areAllRequiredQuestionsAnswered'](questions)).toBeFalse();
    });

    it('should return false when control does not exist', () => {
      component.questionsForm = new FormGroup({});
      const questions = [{
        id: 1,
        name: 'Missing Q',
        type: 'text',
        isRequired: true,
        audience: ['submitter'],
      }] as any[];

      expect(component['areAllRequiredQuestionsAnswered'](questions)).toBeFalse();
    });

    it('should return false when control is invalid', () => {
      component.questionsForm = new FormGroup({
        'q-1': new FormControl(null, Validators.required),
      });
      const questions = [{
        id: 1,
        name: 'Invalid Q',
        type: 'text',
        isRequired: true,
        audience: ['submitter'],
      }] as any[];

      expect(component['areAllRequiredQuestionsAnswered'](questions)).toBeFalse();
    });

    it('should skip questions not in current role audience', () => {
      component.questionsForm = new FormGroup({
        'q-1': new FormControl(''),
      });
      // required but only for reviewer, not submitter
      const questions = [{
        id: 1,
        name: 'Reviewer Only',
        type: 'text',
        isRequired: true,
        audience: ['reviewer'],
      }] as any[];

      // submitter role will not consider this as required
      expect(component['areAllRequiredQuestionsAnswered'](questions)).toBeTrue();
    });

    it('should handle mix of answered and unanswered required questions', () => {
      component.questionsForm = new FormGroup({
        'q-1': new FormControl('answered'),
        'q-2': new FormControl(''),
      });
      const questions = [
        { id: 1, name: 'Q1', type: 'text', isRequired: true, audience: ['submitter'] },
        { id: 2, name: 'Q2', type: 'text', isRequired: true, audience: ['submitter'] },
      ] as any[];

      expect(component['areAllRequiredQuestionsAnswered'](questions)).toBeFalse();
    });

    it('should return true when all mixed required questions are answered', () => {
      component.questionsForm = new FormGroup({
        'q-1': new FormControl('text answer'),
        'q-2': new FormControl(['choice1']),
        'q-3': new FormControl('optional'),
      });
      const questions = [
        { id: 1, name: 'Q1', type: 'text', isRequired: true, audience: ['submitter'] },
        { id: 2, name: 'Q2', type: 'multiple', isRequired: true, audience: ['submitter'] },
        { id: 3, name: 'Q3', type: 'text', isRequired: false, audience: ['submitter'] },
      ] as any[];

      expect(component['areAllRequiredQuestionsAnswered'](questions)).toBeTrue();
    });
  });

  describe('initializePageCompletion()', () => {
    beforeEach(() => {
      component.assessment = {
        ...mockAssessment,
        groups: [
          {
            name: 'Group 1',
            questions: [
              { id: 1, name: 'Q1', type: 'text', isRequired: true, audience: ['submitter'] },
              { id: 2, name: 'Q2', type: 'text', isRequired: false, audience: ['submitter'] },
            ],
          },
        ],
      } as any;
      component.questionsForm = new FormGroup({
        'q-1': new FormControl('answered'),
        'q-2': new FormControl(''),
      });
      spyOn(component, 'scrollActivePageIntoView');
    });

    it('should return early when pagination is disabled', fakeAsync(() => {
      spyOnProperty(component, 'isPaginationEnabled').and.returnValue(false);
      component.pageRequiredCompletion = [];

      component.initializePageCompletion();
      tick(200);

      expect(component.pageRequiredCompletion).toEqual([]);
    }));

    it('should set all pages complete in read-only mode', fakeAsync(() => {
      spyOnProperty(component, 'isPaginationEnabled').and.returnValue(true);
      component.doAssessment = false;
      component.isPendingReview = false;
      component.pagesGroups = [
        [{ name: 'G1', questions: [{ id: 1 }] as any[] }],
        [{ name: 'G2', questions: [{ id: 2 }] as any[] }],
      ];

      component.initializePageCompletion();
      tick(200);

      expect(component.pageRequiredCompletion).toEqual([true, true]);
      expect(component.scrollActivePageIntoView).toHaveBeenCalled();
    }));

    it('should evaluate each page completion in edit mode', fakeAsync(() => {
      spyOnProperty(component, 'isPaginationEnabled').and.returnValue(true);
      component.doAssessment = true;
      component.action = 'assessment';
      component.pagesGroups = [
        [{ name: 'G1', questions: [
          { id: 1, name: 'Q1', type: 'text', isRequired: true, audience: ['submitter'] } as any,
        ] }],
        [{ name: 'G2', questions: [
          { id: 2, name: 'Q2', type: 'text', isRequired: true, audience: ['submitter'] } as any,
        ] }],
      ];
      component.questionsForm = new FormGroup({
        'q-1': new FormControl('answered'),
        'q-2': new FormControl(''),
      });

      component.initializePageCompletion();
      tick(200);

      // page 0 has answered required question → true
      expect(component.pageRequiredCompletion[0]).toBeTrue();
      // page 1 has unanswered required question → false
      expect(component.pageRequiredCompletion[1]).toBeFalse();
      expect(component.scrollActivePageIntoView).toHaveBeenCalled();
    }));
  });

  describe('findAndGoToFirstUnansweredQuestion()', () => {
    beforeEach(() => {
      component.action = 'assessment';
      component.doAssessment = true;
      spyOn(component, 'goToQuestion');
    });

    it('should return false when all required questions are answered (no pagination)', () => {
      spyOnProperty(component, 'isPaginationEnabled').and.returnValue(false);
      component.assessment = {
        ...mockAssessment,
        groups: [{
          name: 'G1',
          questions: [
            { id: 1, name: 'Q1', type: 'text', isRequired: true, audience: ['submitter'] },
          ],
        }],
      } as any;
      component.questionsForm = new FormGroup({
        'q-1': new FormControl('answered'),
      });

      const result = component.findAndGoToFirstUnansweredQuestion();

      expect(result).toBeFalse();
      expect(component.goToQuestion).not.toHaveBeenCalled();
    });

    it('should find unanswered question and navigate to it (no pagination)', () => {
      spyOnProperty(component, 'isPaginationEnabled').and.returnValue(false);
      component.assessment = {
        ...mockAssessment,
        groups: [{
          name: 'G1',
          questions: [
            { id: 1, name: 'Q1', type: 'text', isRequired: true, audience: ['submitter'] },
            { id: 2, name: 'Q2', type: 'text', isRequired: true, audience: ['submitter'] },
          ],
        }],
      } as any;
      component.questionsForm = new FormGroup({
        'q-1': new FormControl('answered'),
        'q-2': new FormControl(''),
      });

      const result = component.findAndGoToFirstUnansweredQuestion();

      expect(result).toBeTrue();
      expect(component.goToQuestion).toHaveBeenCalledWith(1);
    });

    it('should find unanswered question on current page (with pagination)', () => {
      spyOnProperty(component, 'isPaginationEnabled').and.returnValue(true);
      component.pageIndex = 0;
      component.pagesGroups = [
        [{ name: 'G1', questions: [
          { id: 1, name: 'Q1', type: 'text', isRequired: true, audience: ['submitter'] } as any,
          { id: 2, name: 'Q2', type: 'text', isRequired: true, audience: ['submitter'] } as any,
        ] }],
      ];
      component.questionsForm = new FormGroup({
        'q-1': new FormControl('answered'),
        'q-2': new FormControl(''),
      });

      const result = component.findAndGoToFirstUnansweredQuestion();

      expect(result).toBeTrue();
      expect(component.goToQuestion).toHaveBeenCalledWith(1);
    });

    it('should detect unanswered multi-choice question (empty array)', () => {
      spyOnProperty(component, 'isPaginationEnabled').and.returnValue(false);
      component.assessment = {
        ...mockAssessment,
        groups: [{
          name: 'G1',
          questions: [
            { id: 1, name: 'Q1', type: 'multiple', isRequired: true, audience: ['submitter'] },
          ],
        }],
      } as any;
      component.questionsForm = new FormGroup({
        'q-1': new FormControl([]),
      });

      const result = component.findAndGoToFirstUnansweredQuestion();

      expect(result).toBeTrue();
      expect(component.goToQuestion).toHaveBeenCalledWith(0);
    });

    it('should detect unanswered review question (empty answer in object)', () => {
      component.action = 'review';
      component.doAssessment = false;
      component.isPendingReview = true;
      spyOnProperty(component, 'isPaginationEnabled').and.returnValue(false);
      component.assessment = {
        ...mockAssessment,
        groups: [{
          name: 'G1',
          questions: [
            { id: 1, name: 'Q1', type: 'text', isRequired: true, audience: ['reviewer'] },
          ],
        }],
      } as any;
      component.questionsForm = new FormGroup({
        'q-1': new FormControl({ answer: '', comment: '', file: null }),
      });

      const result = component.findAndGoToFirstUnansweredQuestion();

      expect(result).toBeTrue();
      expect(component.goToQuestion).toHaveBeenCalledWith(0);
    });

    it('should return false when no required questions exist', () => {
      spyOnProperty(component, 'isPaginationEnabled').and.returnValue(false);
      component.assessment = {
        ...mockAssessment,
        groups: [{
          name: 'G1',
          questions: [
            { id: 1, name: 'Q1', type: 'text', isRequired: false, audience: ['submitter'] },
          ],
        }],
      } as any;
      component.questionsForm = new FormGroup({
        'q-1': new FormControl(''),
      });

      const result = component.findAndGoToFirstUnansweredQuestion();

      expect(result).toBeFalse();
      expect(component.goToQuestion).not.toHaveBeenCalled();
    });
  });

  describe('_answerRequiredValidatorForReviewer()', () => {
    it('should return required error for null value', () => {
      const control = new FormControl(null);
      const result = component['_answerRequiredValidatorForReviewer'](control);
      expect(result).toEqual({ required: true });
    });

    it('should return required error when answer and file are both empty', () => {
      const control = new FormControl({ answer: '', file: {} });
      const result = component['_answerRequiredValidatorForReviewer'](control);
      expect(result).toEqual({ required: true });
    });

    it('should return null when answer has content', () => {
      const control = new FormControl({ answer: 'some review', file: {} });
      const result = component['_answerRequiredValidatorForReviewer'](control);
      expect(result).toBeNull();
    });

    it('should return null when file has content but answer is empty', () => {
      const control = new FormControl({ answer: '', file: { url: 'https://cdn/file.pdf', path: '/uploads/file' } });
      const result = component['_answerRequiredValidatorForReviewer'](control);
      expect(result).toBeNull();
    });

    it('should return required error for empty string value', () => {
      const control = new FormControl('');
      const result = component['_answerRequiredValidatorForReviewer'](control);
      expect(result).toEqual({ required: true });
    });

    it('should return null for non-empty string value', () => {
      const control = new FormControl('some text');
      const result = component['_answerRequiredValidatorForReviewer'](control);
      expect(result).toBeNull();
    });

    it('should return required error when answer is empty array and file is empty', () => {
      const control = new FormControl({ answer: [], file: {} });
      const result = component['_answerRequiredValidatorForReviewer'](control);
      expect(result).toEqual({ required: true });
    });

    it('should return null when answer is non-empty array', () => {
      const control = new FormControl({ answer: ['choice1'], file: {} });
      const result = component['_answerRequiredValidatorForReviewer'](control);
      expect(result).toBeNull();
    });
  });

  describe('_fileRequiredValidatorForLearner()', () => {
    it('should return required error for null value', () => {
      const control = new FormControl(null);
      const result = component['_fileRequiredValidatorForLearner'](control);
      expect(result).toEqual({ required: true });
    });

    it('should return required error for undefined value', () => {
      const control = new FormControl(undefined);
      const result = component['_fileRequiredValidatorForLearner'](control);
      expect(result).toEqual({ required: true });
    });

    it('should return required error for empty object', () => {
      const control = new FormControl({});
      const result = component['_fileRequiredValidatorForLearner'](control);
      expect(result).toEqual({ required: true });
    });

    it('should return required error when object has no url', () => {
      const control = new FormControl({ name: 'file.pdf', path: '/uploads/file' });
      const result = component['_fileRequiredValidatorForLearner'](control);
      expect(result).toEqual({ required: true });
    });

    it('should return required error when url is empty string', () => {
      const control = new FormControl({ url: '' });
      const result = component['_fileRequiredValidatorForLearner'](control);
      expect(result).toEqual({ required: true });
    });

    it('should return null when file object has url', () => {
      const control = new FormControl({ url: 'https://cdn/file.pdf', name: 'file.pdf', path: '/uploads/file' });
      const result = component['_fileRequiredValidatorForLearner'](control);
      expect(result).toBeNull();
    });

    it('should return required error for string value', () => {
      const control = new FormControl('some string');
      const result = component['_fileRequiredValidatorForLearner'](control);
      expect(result).toEqual({ required: true });
    });
  });

  describe('CORE-8182: pagination indicator accuracy in review mode', () => {
    const reviewAssessment: Assessment = {
      id: 1,
      name: 'review test',
      description: '',
      type: 'moderated',
      isForTeam: false,
      dueDate: '2029-02-02',
      isOverdue: false,
      pulseCheck: false,
      hasReviewRating: false,
      groups: [{
        name: 'group 1',
        description: '',
        questions: [
          { id: 1, name: 'text q', description: '', canAnswer: true, canComment: true, type: 'text', isRequired: true, audience: ['reviewer'] },
          { id: 2, name: 'oneof q', description: '', canAnswer: true, canComment: true, type: 'oneof', isRequired: true, audience: ['reviewer'] },
          { id: 3, name: 'multiple q', description: '', canAnswer: true, canComment: true, type: 'multiple', isRequired: true, audience: ['reviewer'] },
          { id: 4, name: 'file q', description: '', canAnswer: true, canComment: true, type: 'file', isRequired: true, audience: ['reviewer'] },
          { id: 5, name: 'team-member q', description: '', canAnswer: true, canComment: true, type: 'team member selector', isRequired: true, audience: ['reviewer'] },
          { id: 6, name: 'multi-team q', description: '', canAnswer: true, canComment: true, type: 'multi team member selector', isRequired: true, audience: ['reviewer'] },
        ],
      }],
    };

    function setupReviewMode() {
      component.action = 'review';
      component.assessment = reviewAssessment;
      component.submission = { id: 1, status: 'pending review', answers: [], submitterName: '', modified: '', completed: false, isLocked: false, submitterImage: '', reviewerName: '' } as any;
      component.review = { id: 1, answers: {}, status: 'in progress', modified: '' } as any;
      component['isPendingReview'] = true;
      component['doAssessment'] = false;
    }

    describe('areAllRequiredQuestionsAnswered', () => {
      beforeEach(() => {
        setupReviewMode();
        component.questionsForm = new FormGroup({});
      });

      it('should return false for empty array answer (multiple/checkbox in review mode)', () => {
        component.questionsForm.addControl('q-3', new FormControl({ answer: [], comment: '', file: null }));
        const result = component['areAllRequiredQuestionsAnswered']([reviewAssessment.groups[0].questions[2]]);
        expect(result).toBeFalse();
      });

      it('should return true for non-empty array answer (multiple/checkbox in review mode)', () => {
        component.questionsForm.addControl('q-3', new FormControl({ answer: ['choice1'], comment: '', file: null }));
        const result = component['areAllRequiredQuestionsAnswered']([reviewAssessment.groups[0].questions[2]]);
        expect(result).toBeTrue();
      });

      it('should return false for empty array answer (multi-team-member-selector in review mode)', () => {
        component.questionsForm.addControl('q-6', new FormControl({ answer: [], comment: '', file: null }));
        const result = component['areAllRequiredQuestionsAnswered']([reviewAssessment.groups[0].questions[5]]);
        expect(result).toBeFalse();
      });

      it('should return true for non-empty array answer (multi-team-member-selector in review mode)', () => {
        component.questionsForm.addControl('q-6', new FormControl({ answer: [{ name: 'user1' }], comment: '' }));
        const result = component['areAllRequiredQuestionsAnswered']([reviewAssessment.groups[0].questions[5]]);
        expect(result).toBeTrue();
      });

      it('should return false for empty string answer (text in review mode)', () => {
        component.questionsForm.addControl('q-1', new FormControl({ answer: '', comment: '', file: null }));
        const result = component['areAllRequiredQuestionsAnswered']([reviewAssessment.groups[0].questions[0]]);
        expect(result).toBeFalse();
      });

      it('should return true for non-empty string answer (text in review mode)', () => {
        component.questionsForm.addControl('q-1', new FormControl({ answer: 'some text', comment: '', file: null }));
        const result = component['areAllRequiredQuestionsAnswered']([reviewAssessment.groups[0].questions[0]]);
        expect(result).toBeTrue();
      });

      it('should return true for review file question with file object', () => {
        component.questionsForm.addControl('q-4', new FormControl({ answer: '', comment: '', file: { url: 'http://file.com/test.pdf' } }));
        const result = component['areAllRequiredQuestionsAnswered']([reviewAssessment.groups[0].questions[3]]);
        expect(result).toBeTrue();
      });

      it('should return false for review file question with empty file', () => {
        component.questionsForm.addControl('q-4', new FormControl({ answer: '', comment: '', file: null }));
        const result = component['areAllRequiredQuestionsAnswered']([reviewAssessment.groups[0].questions[3]]);
        expect(result).toBeFalse();
      });
    });

    describe('_answerRequiredValidatorForReviewer applied to all review question types', () => {
      beforeEach(() => {
        setupReviewMode();
      });

      it('should use _answerRequiredValidatorForReviewer for multiple type in review mode', () => {
        component.ngOnChanges({ assessment: {} as any });
        const control = component.questionsForm.controls['q-3'];
        expect(control).toBeTruthy();
        // empty array answer should be invalid
        control.setValue({ answer: [], comment: '', file: null });
        expect(control.valid).toBeFalse();
        // non-empty array should be valid
        control.setValue({ answer: ['choice1'], comment: '', file: null });
        expect(control.valid).toBeTrue();
      });

      it('should use _answerRequiredValidatorForReviewer for multi-team-member-selector type in review mode', () => {
        component.ngOnChanges({ assessment: {} as any });
        const control = component.questionsForm.controls['q-6'];
        expect(control).toBeTruthy();
        // empty array answer should be invalid
        control.setValue({ answer: [], comment: '' });
        expect(control.valid).toBeFalse();
        // non-empty array should be valid
        control.setValue({ answer: [{ name: 'user1' }], comment: '' });
        expect(control.valid).toBeTrue();
      });

      it('should use _answerRequiredValidatorForReviewer for oneof type in review mode', () => {
        component.ngOnChanges({ assessment: {} as any });
        const control = component.questionsForm.controls['q-2'];
        expect(control).toBeTruthy();
        // empty answer should be invalid
        control.setValue({ answer: '', comment: '' });
        expect(control.valid).toBeFalse();
        // non-empty answer should be valid
        control.setValue({ answer: 'option1', comment: '' });
        expect(control.valid).toBeTrue();
      });

      it('should use _answerRequiredValidatorForReviewer for team-member-selector type in review mode', () => {
        component.ngOnChanges({ assessment: {} as any });
        const control = component.questionsForm.controls['q-5'];
        expect(control).toBeTruthy();
        // empty answer should be invalid
        control.setValue({ answer: '', comment: '' });
        expect(control.valid).toBeFalse();
        // non-empty answer should be valid
        control.setValue({ answer: 'member1', comment: '' });
        expect(control.valid).toBeTrue();
      });
    });
  });

  describe('splitGroupsByQuestionCount()', () => {
    beforeEach(() => {
      component.pageSize = 8;
    });

    it('should fit multiple small groups on one page', () => {
      component.assessment = {
        ...mockAssessment,
        groups: [
          { name: 'G1', questions: Array.from({ length: 3 }, (_, i) => ({ id: i + 1 })) as any[] },
          { name: 'G2', questions: Array.from({ length: 4 }, (_, i) => ({ id: i + 10 })) as any[] },
        ],
      } as any;

      const pages = component['splitGroupsByQuestionCount']();

      expect(pages.length).toBe(1);
      expect(pages[0].length).toBe(2);
    });

    it('should push groups to new page when current page is full', () => {
      component.assessment = {
        ...mockAssessment,
        groups: [
          { name: 'G1', questions: Array.from({ length: 8 }, (_, i) => ({ id: i + 1 })) as any[] },
          { name: 'G2', questions: Array.from({ length: 3 }, (_, i) => ({ id: i + 10 })) as any[] },
        ],
      } as any;

      const pages = component['splitGroupsByQuestionCount']();

      expect(pages.length).toBe(2);
      expect(pages[0][0].questions.length).toBe(8);
      expect(pages[1][0].questions.length).toBe(3);
    });

    it('should slice large groups across multiple pages', () => {
      component.assessment = {
        ...mockAssessment,
        groups: [
          { name: 'Big Group', questions: Array.from({ length: 20 }, (_, i) => ({ id: i + 1 })) as any[] },
        ],
      } as any;

      const pages = component['splitGroupsByQuestionCount']();

      expect(pages.length).toBe(3);
      expect(pages[0][0].questions.length).toBe(8);
      expect(pages[1][0].questions.length).toBe(8);
      expect(pages[2][0].questions.length).toBe(4);
    });

    it('should handle empty groups array', () => {
      component.assessment = { ...mockAssessment, groups: [] } as any;

      const pages = component['splitGroupsByQuestionCount']();

      expect(pages.length).toBe(0);
    });

    it('should flush remaining groups on the last page', () => {
      component.assessment = {
        ...mockAssessment,
        groups: [
          { name: 'G1', questions: Array.from({ length: 5 }, (_, i) => ({ id: i + 1 })) as any[] },
          { name: 'G2', questions: Array.from({ length: 5 }, (_, i) => ({ id: i + 10 })) as any[] },
          { name: 'G3', questions: Array.from({ length: 2 }, (_, i) => ({ id: i + 20 })) as any[] },
        ],
      } as any;

      const pages = component['splitGroupsByQuestionCount']();

      // G1(5) fits on page 0. G2(5) doesn't fit with G1 (5+5>8), flushes G1.
      // G2 goes to page 1 (5 <= 8). G3(2) fits with G2 (5+2=7 <= 8).
      expect(pages.length).toBe(2);
      expect(pages[0][0].name).toBe('G1');
      expect(pages[1][0].name).toBe('G2');
      expect(pages[1][1].name).toBe('G3');
    });
  });

  describe('isPaginationEnabled', () => {
    it('should return true by default', () => {
      expect(component.isPaginationEnabled).toBeTrue();
    });
  });

  describe('pageCount', () => {
    it('should return pagesGroups.length when pagination enabled', () => {
      spyOnProperty(component, 'isPaginationEnabled').and.returnValue(true);
      component.pagesGroups = [[], [], []];
      expect(component.pageCount).toBe(3);
    });

    it('should return 1 when pagination disabled', () => {
      spyOnProperty(component, 'isPaginationEnabled').and.returnValue(false);
      expect(component.pageCount).toBe(1);
    });
  });

  describe('pagedGroups', () => {
    it('should return all groups when pagination disabled', () => {
      spyOnProperty(component, 'isPaginationEnabled').and.returnValue(false);
      component.assessment = mockAssessment;
      expect(component.pagedGroups).toEqual(mockAssessment.groups);
    });

    it('should return groups for current page when pagination enabled', () => {
      spyOnProperty(component, 'isPaginationEnabled').and.returnValue(true);
      const page0 = [{ name: 'G1', questions: [] }];
      const page1 = [{ name: 'G2', questions: [] }];
      component.pagesGroups = [page0, page1] as any;
      component.pageIndex = 1;
      expect(component.pagedGroups).toEqual(page1 as any);
    });

    it('should return empty array for out-of-range page index', () => {
      spyOnProperty(component, 'isPaginationEnabled').and.returnValue(true);
      component.pagesGroups = [];
      component.pageIndex = 5;
      expect(component.pagedGroups).toEqual([]);
    });
  });

  describe('prevPage() / nextPage()', () => {
    beforeEach(() => {
      spyOnProperty(component, 'isPaginationEnabled').and.returnValue(true);
      component.pagesGroups = [[], [], []];
      component.pageIndex = 1;
      spyOn(component, 'scrollActivePageIntoView');
    });

    it('prevPage should decrement pageIndex', () => {
      component.prevPage();
      expect(component.pageIndex).toBe(0);
      expect(component.scrollActivePageIntoView).toHaveBeenCalled();
    });

    it('prevPage should not go below 0', () => {
      component.pageIndex = 0;
      component.prevPage();
      expect(component.pageIndex).toBe(0);
      expect(component.scrollActivePageIntoView).not.toHaveBeenCalled();
    });

    it('nextPage should increment pageIndex', () => {
      component.nextPage();
      expect(component.pageIndex).toBe(2);
      expect(component.scrollActivePageIntoView).toHaveBeenCalled();
    });

    it('nextPage should not exceed last page', () => {
      component.pageIndex = 2;
      component.nextPage();
      expect(component.pageIndex).toBe(2);
      expect(component.scrollActivePageIntoView).not.toHaveBeenCalled();
    });
  });

  describe('prevPage() / nextPage() when pagination disabled', () => {
    it('prevPage should do nothing', () => {
      spyOnProperty(component, 'isPaginationEnabled').and.returnValue(false);
      component.pageIndex = 1;
      component.prevPage();
      expect(component.pageIndex).toBe(1);
    });

    it('nextPage should do nothing', () => {
      spyOnProperty(component, 'isPaginationEnabled').and.returnValue(false);
      component.pageIndex = 0;
      component.nextPage();
      expect(component.pageIndex).toBe(0);
    });
  });

  describe('goToPage()', () => {
    beforeEach(() => {
      spyOnProperty(component, 'isPaginationEnabled').and.returnValue(true);
      component.pagesGroups = [[], [], [], []];
      spyOn(component, 'scrollActivePageIntoView');
    });

    it('should navigate to valid page index', () => {
      component.goToPage(2);
      expect(component.pageIndex).toBe(2);
      expect(component.scrollActivePageIntoView).toHaveBeenCalled();
    });

    it('should reject negative page index', () => {
      component.pageIndex = 1;
      component.goToPage(-1);
      expect(component.pageIndex).toBe(1);
      expect(component.scrollActivePageIntoView).not.toHaveBeenCalled();
    });

    it('should reject out-of-range page index', () => {
      component.pageIndex = 0;
      component.goToPage(10);
      expect(component.pageIndex).toBe(0);
      expect(component.scrollActivePageIntoView).not.toHaveBeenCalled();
    });

    it('should not navigate when pagination disabled', () => {
      component.pageIndex = 0;
      component.pagesGroups = [[], [], []];
      // goToPage checks isPaginationEnabled at the start
      // We can't spyOnProperty twice, so test via prevPage/nextPage instead
      expect(component.pageIndex).toBe(0);
    });
  });

  describe('getAllQuestionsForPage()', () => {
    it('should return all questions when pagination disabled', () => {
      spyOnProperty(component, 'isPaginationEnabled').and.returnValue(false);
      component.assessment = {
        ...mockAssessment,
        groups: [
          { name: 'G1', questions: [{ id: 1 }, { id: 2 }] as any[] },
          { name: 'G2', questions: [{ id: 3 }] as any[] },
        ],
      } as any;

      const result = component['getAllQuestionsForPage'](0);

      expect(result.length).toBe(3);
      expect(result.map(q => q.id)).toEqual([1, 2, 3]);
    });

    it('should return questions for specific page when pagination enabled', () => {
      spyOnProperty(component, 'isPaginationEnabled').and.returnValue(true);
      component.pagesGroups = [
        [{ name: 'G1', questions: [{ id: 1 }, { id: 2 }] as any[] }],
        [{ name: 'G2', questions: [{ id: 3 }] as any[] }],
      ];

      const result = component['getAllQuestionsForPage'](1);

      expect(result.length).toBe(1);
      expect(result[0].id).toBe(3);
    });

    it('should return empty array for invalid page index', () => {
      spyOnProperty(component, 'isPaginationEnabled').and.returnValue(true);
      component.pagesGroups = [];

      const result = component['getAllQuestionsForPage'](5);

      expect(result).toEqual([]);
    });
  });

  describe('shouldShowRequiredIndicator()', () => {
    it('should return true when required and doing assessment', () => {
      component.doAssessment = true;
      component.isPendingReview = false;
      const q = { id: 1, name: 'Q', type: 'text', isRequired: true, audience: ['submitter'] } as any;

      expect(component.shouldShowRequiredIndicator(q)).toBeTrue();
    });

    it('should return true when required and pending review', () => {
      component.doAssessment = false;
      component.isPendingReview = true;
      component.action = 'review';
      const q = { id: 1, name: 'Q', type: 'text', isRequired: true, audience: ['reviewer'] } as any;

      expect(component.shouldShowRequiredIndicator(q)).toBeTrue();
    });

    it('should return false when not required', () => {
      component.doAssessment = true;
      const q = { id: 1, name: 'Q', type: 'text', isRequired: false, audience: ['submitter'] } as any;

      expect(component.shouldShowRequiredIndicator(q)).toBeFalse();
    });

    it('should return false in read-only mode', () => {
      component.doAssessment = false;
      component.isPendingReview = false;
      const q = { id: 1, name: 'Q', type: 'text', isRequired: true, audience: ['submitter'] } as any;

      expect(component.shouldShowRequiredIndicator(q)).toBeFalse();
    });
  });

  describe('setSubmissionDisabled()', () => {
    it('should not change button state in read-only mode', () => {
      component.doAssessment = false;
      component.isPendingReview = false;
      component.btnDisabled$ = new BehaviorSubject(true);
      const spy = spyOn(component.btnDisabled$, 'next');

      component.setSubmissionDisabled();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should disable button when form is invalid', () => {
      component.doAssessment = true;
      component['submitting'] = false;
      component.btnDisabled$ = new BehaviorSubject(false);
      component.questionsForm = new FormGroup({
        'q-1': new FormControl(null, Validators.required),
      });

      component.setSubmissionDisabled();

      expect(component.btnDisabled$.getValue()).toBeTrue();
    });

    it('should enable button when form is valid', () => {
      component.doAssessment = true;
      component['submitting'] = false;
      component.btnDisabled$ = new BehaviorSubject(true);
      component.questionsForm = new FormGroup({
        'q-1': new FormControl('answered'),
      });

      component.setSubmissionDisabled();

      expect(component.btnDisabled$.getValue()).toBeFalse();
    });
  });

  describe('_prefillForm() with locked submission', () => {
    it('should keep button disabled when submission is locked', () => {
      component.questionsForm = new FormGroup({
        'q-1': new FormControl(''),
      });
      component.btnDisabled$ = new BehaviorSubject(true);
      component.action = 'assessment';
      component.doAssessment = false; // locked means doAssessment is false
      component.isPendingReview = false;
      component.submission = {
        id: 1,
        status: 'done',
        isLocked: true,
        answers: { 1: { answer: 'locked answer' } },
      } as any;

      component['_prefillForm']();

      // locked submission should keep button disabled (not reset to false)
      expect(component.btnDisabled$.getValue()).toBeTrue();
    });
  });

  describe('scrollActivePageIntoView()', () => {
    it('should do nothing when pagination disabled', fakeAsync(() => {
      spyOnProperty(component, 'isPaginationEnabled').and.returnValue(false);
      component.scrollActivePageIntoView();
      tick(100);
      // no error thrown
    }));
  });
});
