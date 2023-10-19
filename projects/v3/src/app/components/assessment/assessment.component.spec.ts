import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed, fakeAsync, tick, inject, flushMicrotasks, flush } from '@angular/core/testing';

import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { AssessmentComponent } from './assessment.component';
import { Assessment, AssessmentService } from '@v3/services/assessment.service';
import { UtilsService } from '@v3/services/utils.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { ActivityService } from '@v3/services/activity.service';
import { FastFeedbackService } from '@v3/services/fast-feedback.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { SharedService } from '@v3/services/shared.service';
import { FastFeedbackServiceMock } from '@testing/mocked.service';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { MockRouter } from '@testingv3/mocked.service';
import { TestUtils } from '@testingv3/utils';
import { ApolloService } from '@v3/app/services/apollo.service';

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
      declarations: [AssessmentComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges()', () => {
    it('should straightaway return when assessment not loaded', () => {
      expect(component.ngOnChanges()).toBeFalsy();
    });

    it('should update assessment with latest data', () => {
      component.assessment = mockAssessment;
      component.ngOnChanges();

      expect(component.doAssessment).toEqual(true);
      expect(component.feedbackReviewed).toEqual(false);
      expect(component.btnDisabled$.value).toEqual(false);
      expect(component.isNotInATeam).toEqual(false);
      expect(component.isPendingReview).toEqual(false);
    });

    it('should not allow submission if locked', () => {
      component.assessment = mockAssessment;
      component.submission = mockSubmission;
      component.submission.isLocked = true;
      component.ngOnChanges();

      expect(component.doAssessment).toEqual(false);
      expect(component.submission.status).toEqual('done');
      expect(component.btnDisabled$.value).toEqual(true);
      expect(component.feedbackReviewed).toEqual(component.submission.completed);
    });

    it('should not allow submission', () => {
      component.assessment = mockAssessment;
      component.submission = mockSubmission;
      component.submission.isLocked = true;
      component.ngOnChanges();

      expect(component.doAssessment).toEqual(false);
      expect(component.submission.status).toEqual('done');
      expect(component.btnDisabled$.value).toEqual(true);
      expect(component.feedbackReviewed).toEqual(component.submission.completed);
    });

    it('should save & publish "saving" message', fakeAsync(() => {
      component.assessment = mockAssessment;
      component.submission = mockSubmission;
      component.submission.isLocked = false;
      component.submission.status = 'in progress';
      component.savingMessage$ = new BehaviorSubject('');
      const spy = spyOn(component.savingMessage$, 'next');
      component.ngOnChanges();

      tick();
      expect(component.doAssessment).toBeTrue();
      const lastSaveMsg = 'Last saved ' + utils.timeFormatter(component.submission.modified);
      expect(spy).toHaveBeenCalledWith(lastSaveMsg);
      expect(component.btnDisabled$.value).toEqual(false);
    }));

    it('should flag assessment as "pending review"', () => {
      component.assessment = mockAssessment;
      component.assessment.type = 'moderated';

      component.submission = mockSubmission;
      component.submission.status = 'pending review';

      component.review = mockReview;
      component.review.status = 'in progress';
      component.savingMessage$ = new BehaviorSubject('');
      const spy = spyOn(component.savingMessage$, 'next');

      component.action = 'review';
      component.ngOnChanges();

      const lastSaveMsg = 'Last saved ' + utils.timeFormatter(component.review.modified);
      expect(spy).toHaveBeenCalledWith(lastSaveMsg);
      expect(component.isPendingReview).toBeTrue();
    });


    it('should flag assessment as "complete"', () => {
      component.assessment = mockAssessment;
      component.assessment.type = 'moderated';

      component.submission = mockSubmission;
      component.submission.isLocked = false;
      component.submission.status = 'done';
      component.ngOnChanges();

      expect(component.feedbackReviewed).toEqual(component.submission.completed);
    });
  });

  it('should list unanswered required questions from compulsoryQuestionsAnswered()', () => {
    expect(component['_compulsoryQuestionsAnswered']).toBeDefined();
    component.assessment = mockAssessment;
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

      const spy = spyOn(component, '_submitAnswer');
      component.continueToNextTask();
      expect(spy).toHaveBeenCalled();
    });

    it('should mark feedback as read', () => {
      component.submission = mockSubmission;
      component.submission.status = 'published';
      component.feedbackReviewed = false;
      expect(component.btnText).toEqual('mark feedback as reviewed');

      component.submission = mockSubmission;
      component.submission.status = 'feedback available';
      component.submission.completed = false;
      expect(component.btnText).toEqual('mark feedback as reviewed');

      const spy = spyOn(component.readFeedback, 'emit');
      component.continueToNextTask();
      expect(spy).toHaveBeenCalled();
    });

    it('should emit continue', () => {
      component.submission = mockSubmission;
      component.submission.status = 'done';
      expect(component.btnText).toEqual('continue');

      const spy = spyOn(component.continue, 'emit');
      component.continueToNextTask();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('label()', () => {
    it('should return "in progress"', () => {
      component.submission = mockSubmission;
      component.submission.status = 'in progress';
      component.assessment = mockAssessment;
      component.assessment.isForTeam = true;
      component.submission.isLocked = true;
      expect(component.label).toEqual('in progress');
    });

    it('should return "overdue"', () => {
      component.submission = mockSubmission;
      component.assessment = mockAssessment;
      component.assessment.isForTeam = false;
      component.assessment.isOverdue = true;
      component.submission.status = 'in progress';
      expect(component.label).toEqual('overdue');

      component.assessment.isOverdue = false;
      expect(component.label).toEqual('');
    });

    it('should return empty string ("")', () => {
      component.submission = mockSubmission;
      component.assessment = mockAssessment;
      component.submission.isLocked = false;
      component.assessment.isForTeam = false;
      component.submission.status = 'published';
      expect(component.label).toEqual('published');
    });
  });

  describe('labelColor()', () => {
    beforeEach(() => {
      component.submission = mockSubmission;
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
      component.submission.status = ''; // or  'in progress'
      component.assessment.isForTeam = false;
      component.assessment.isOverdue = true;
      component.submission.isLocked = false;
      expect(component.labelColor).toEqual('danger');
    });

    it('should return empty when submission is done', () => {
      component.submission.status = 'done';
      expect(component.labelColor).toEqual('');
    });

    it('should return empty when status is unknown', () => {
      component.submission.status = 'unknown123456'; // or  'in progress'
      component.assessment.isForTeam = false;
      component.assessment.isOverdue = true;
      component.submission.isLocked = false;
      expect(component.labelColor).toEqual('');
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
});
