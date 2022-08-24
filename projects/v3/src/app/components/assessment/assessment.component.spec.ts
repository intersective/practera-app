import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed, fakeAsync, tick, inject, flushMicrotasks, flush } from '@angular/core/testing';
import { QuestionsModule } from '@app/questions/questions.module';

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
import { of } from 'rxjs';
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
      imports: [ReactiveFormsModule, QuestionsModule, HttpClientTestingModule],
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

  it('should get correct parameters from routing', () => {
    fixture.detectChanges();
    expect(component.contextId).toEqual(3);
    expect(component.submission.id).toEqual(4);
    expect(component.action).toEqual('assessment');
  });

  describe('when testing getAssessment()', () => {
    let tmpAssessment, tmpSubmission, tmpReview, customTests;
    beforeEach(() => {
      tmpAssessment = mockAssessment;
      tmpSubmission = null;
      tmpReview = null;
      customTests = () => { };
    });
    afterEach(() => {
      apolloSpy.graphQLWatch.and.returnValue(of({
        assessment: tmpAssessment,
        submission: tmpSubmission,
        review: tmpReview
      }));
      fixture.detectChanges();
      customTests();
    });
    it('should get correct assessment and display correct info in html', () => {
      customTests = () => {
        expect(component.assessment).toEqual(mockAssessment);
        // expect(component.loadingAssessment).toEqual(false);
        expect(page.savingMessage).toBeFalsy();
        expect(page.assessmentName.innerHTML).toEqual(mockAssessment.name);
        expect(page.assessmentDescription).toBeTruthy();
        expect(page.overDueMsg).toBeFalsy();
        expect(page.dueMsg.innerHTML.trim()).toEqual(utils.dueDateFormatter(mockAssessment.dueDate));
        mockAssessment.groups.forEach((group, groupIndex) => {
          expect(page.groupNames[groupIndex].innerHTML).toEqual(group.name);
          expect(page.groupDescriptions[groupIndex]).toBeTruthy();
          group.questions.forEach((question, questionIndex) => {
            expect(page.questionNames[questionIndex].innerHTML).toContain(question.name);
            expect(page.questionDescriptions[questionIndex]).toBeTruthy();
          });
        });
        expect(notificationSpy.alert.calls.count()).toBe(0);
      };
    });

    it('should pop up alert if it is team assessment and user is not in team', () => {
      tmpAssessment = JSON.parse(JSON.stringify(mockAssessment));
      tmpAssessment.isForTeam = true;
      const tmpUser = JSON.parse(JSON.stringify(mockUser));
      tmpUser.teamId = null;
      storageSpy.getUser.and.returnValue(tmpUser);
      customTests = () => {
        expect(notificationSpy.alert.calls.count()).toBe(1);
      };
    });

    it('should get correct in progress submission', () => {
      tmpSubmission = mockSubmission;
      customTests = () => {
        expect(component.submission).toEqual(mockSubmission);
        expect(component.doAssessment).toBe(true);
        expect(component.isPendingReview).toBe(false);
        expect(component.savingMessage$.next).toHaveBeenCalledWith('Last saved ' + utils.timeFormatter(mockSubmission.modified));
        expect(component.btnDisabled).toBe(false);
      };
    });

    it('should get correct in progress locked submission', () => {
      tmpSubmission = JSON.parse(JSON.stringify(mockSubmission));
      tmpSubmission.isLocked = true;
      customTests = () => {
        expect(component.doAssessment).toBe(false);
        expect(component.isPendingReview).toBe(false);
        expect(component.btnDisabled).toBe(true);
        expect(component.submission.status).toEqual('done');
      };
    });

    it('should get correct done submission', () => {
      tmpSubmission = JSON.parse(JSON.stringify(mockSubmission));
      tmpSubmission.status = 'done';
      customTests = () => {
        expect(component.submission).toEqual(tmpSubmission);
        expect(component.doAssessment).toBe(false);
        expect(component.isPendingReview).toBe(false);
        expect(component.btnDisabled).toBe(false);
      };
    });

    it('should get correct in progress review', () => {
      tmpAssessment.type = 'moderated';
      tmpSubmission = JSON.parse(JSON.stringify(mockSubmission));
      tmpSubmission.status = 'pending review';
      tmpReview = mockReview;
      routeStub.snapshot.data.action = 'review';
      customTests = () => {
        expect(component.review).toEqual(mockReview);
        expect(component.doAssessment).toBe(false);
        expect(component.isPendingReview).toBe(true);
        expect(component.btnDisabled).toBe(false);
      };
    });

    it('should get correct published review', () => {
      tmpSubmission = JSON.parse(JSON.stringify(mockSubmission));
      tmpSubmission.status = 'published';
      tmpReview = JSON.parse(JSON.stringify(mockReview));
      tmpReview.status = '';
      customTests = () => {
        expect(component.review).toEqual(tmpReview);
        expect(component.doAssessment).toBe(false, 'not do assessment');
        expect(component.isPendingReview).toBe(false, 'not do review');
        expect(component.btnDisabled).toBe(false);
        expect(component.feedbackReviewed).toBe(false);
      };
    });

    it('should get correct review published status', () => {
      tmpSubmission = JSON.parse(JSON.stringify(mockSubmission));
      tmpSubmission.status = 'published';
      tmpSubmission.completed = true;
      tmpReview = JSON.parse(JSON.stringify(mockReview));
      tmpReview.status = 'done';
      customTests = () => {
        expect(component.feedbackReviewed).toBe(true);
      };
    });
  });

  xit('should pop up mark feedback as read confirmation when going back', () => {
    component.action = 'assessment';
    component.submission.status = 'published';
    component.feedbackReviewed = false;
    // component.back();
    expect(routerSpy.navigate.calls.count()).toBe(0);
  });

  xit('should save in progress and navigate to other page when going back', fakeAsync(() => {
    // component.back();
    flush();
    expect(component.savingMessage$.next).toHaveBeenCalled();
    expect(routerSpy.navigate.calls.first().args[0]).toEqual(['app', 'home']);
  }));

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
        'q-124': new FormControl(null),
        'q-125': new FormControl(null)
      });
    });

    afterEach(() => {
      expect(component.btnDisabled).toBe(btnDisabled);
      expect(notificationSpy.popUp.calls.count()).toBe(0);
      expect(assessment.id).toBe(1);
      expect(assessment.contextId).toBe(2);
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

    it('saving in progress', () => {
      component._submit(true);
      assessment = assessmentSpy.saveAnswers.calls.first().args[0];
      answers = assessmentSpy.saveAnswers.calls.first().args[1];
      // expect(component.submitting).toBeFalsy();
      expect(component.savingMessage$.next).toHaveBeenCalled();
      expect(assessment.inProgress).toBe(true);
      expect(assessment.unlock).toBeFalsy();
    });

    it('saving in progress, and unlock the submission for team assessment', () => {
      component._submit(true, true);
      assessment = assessmentSpy.saveAnswers.calls.first().args[0];
      answers = assessmentSpy.saveAnswers.calls.first().args[1];
      expect(assessment.unlock).toBe(true);
    });

    it('submitting', () => {
      btnDisabled = true;
      component._submit(false);
      assessment = assessmentSpy.saveAnswers.calls.first().args[0];
      answers = assessmentSpy.saveAnswers.calls.first().args[1];
      // expect(component.submitting).toEqual(false);
      expect(component.savingMessage$.next).toHaveBeenCalled();
    });
  });

  it('should pop up alert if required answer missing when submitting', () => {
    component.doAssessment = true;
    fixture.detectChanges();
    component.questionsForm = new FormGroup({
      'q-123': new FormControl(null),
      'q-124': new FormControl(null),
      'q-125': new FormControl(null)
    });
    component._submit(false);
    // expect(component.submitting).toBe(false);
    expect(notificationSpy.popUp.calls.count()).toBe(1);
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

    it('should be called with correct assessment answer/action/activity status', () => {
      component._submit(false);
      expect(assessmentSpy.saveAnswers).toHaveBeenCalled();
      expect(assessmentSpy.saveAnswers).toHaveBeenCalledWith(
        {
          id: activityId,
          contextId: 2
        },
        emptyAnswers,
        action,
        false // no need pulse check for this test
      );
    });

    it(`should check fastfeedback availability as pulseCheck is 'true'`, () => {
      component._submit(false);
      const spy = spyOn(fastFeedbackSpy, 'pullFastFeedback').and.returnValue(of(fastFeedbackSpy.pullFastFeedback()));
      fixture.detectChanges();
      expect(fastFeedbackSpy.pullFastFeedback.calls.count()).toEqual(1);
    });

    it('should skip fastfeedback if pulsecheck = false', () => {
      component.assessment.pulseCheck = false;
      spyOn(fastFeedbackSpy, 'pullFastFeedback');
      component._submit(false);
      expect(fastFeedbackSpy.pullFastFeedback.calls.count()).toEqual(0);
    });
  });

  it('showQuestionInfo() should popup info modal', () => {
    component.showQuestionInfo('abc');
    expect(notificationSpy.popUp.calls.count()).toBe(1);
  });
});
