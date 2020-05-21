import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed, fakeAsync, tick, inject } from '@angular/core/testing';
import { QuestionsModule } from '@app/questions/questions.module';

import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { AssessmentComponent } from './assessment.component';
import { AssessmentService } from './assessment.service';
import { UtilsService } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { ActivityService } from '@app/activity/activity.service';
import { FastFeedbackService } from '@app/fast-feedback/fast-feedback.service';
import { BrowserStorageService } from '@services/storage.service';
import { SharedService } from '@services/shared.service';
import { FastFeedbackServiceMock } from '@testing/mocked.service';
import { of } from 'rxjs';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { MockRouter, MockNewRelicService } from '@testing/mocked.service';

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
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  let activitySpy: jasmine.SpyObj<ActivityService>;
  let fastFeedbackSpy: jasmine.SpyObj<FastFeedbackService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routeStub: Partial<ActivatedRoute>;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;
  let shared: SharedService;
  let utils: UtilsService;

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

  const mockAssessment = {
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
        UtilsService,
        SharedService,
        {
          provide: NewRelicService,
          useClass: MockNewRelicService,
        },
        {
          provide: AssessmentService,
          useValue: jasmine.createSpyObj('AssessmentService', ['getAssessment', 'saveAnswers', 'saveFeedbackReviewed', 'popUpReviewRating'])
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', ['alert', 'customToast', 'popUp', 'presentToast', 'modalOnly'])
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
          useValue: jasmine.createSpyObj('BrowserStorageService', ['getUser'])
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
    notificationSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    activitySpy = TestBed.inject(ActivityService) as jasmine.SpyObj<ActivityService>;
    fastFeedbackSpy = TestBed.inject(FastFeedbackService) as jasmine.SpyObj<FastFeedbackService>;
    routeStub = TestBed.inject(ActivatedRoute);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    shared = TestBed.inject(SharedService);
    utils = TestBed.inject(UtilsService);

    // initialise service calls
    assessmentSpy.getAssessment.and.returnValue(of({
      assessment: mockAssessment,
      submission: null,
      review: null
    }));
    assessmentSpy.saveAnswers.and.returnValue(of(true));
    assessmentSpy.saveFeedbackReviewed.and.returnValue(of({success: true}));
    activitySpy.gotoNextTask.and.returnValue(new Promise(() => {}));
    storageSpy.getUser.and.returnValue(mockUser);
    component.routeUrl = '/test';
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should get correct parameters from routing', () => {
    fixture.detectChanges();
    expect(component.id).toEqual(1);
    expect(component.activityId).toEqual(2);
    expect(component.contextId).toEqual(3);
    expect(component.submissionId).toEqual(4);
    expect(component.action).toEqual('assessment');
  });

  describe('when testing getAssessment()', () => {
    let tmpAssessment, tmpSubmission, tmpReview, customTests;
    beforeEach(() => {
      tmpAssessment = mockAssessment;
      tmpSubmission = null;
      tmpReview = null;
      customTests = () => {};
    });
    afterEach(() => {
      assessmentSpy.getAssessment.and.returnValue(of({
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
        expect(component.loadingAssessment).toEqual(false);
        expect(page.savingMessage).toBeFalsy();
        expect(page.assessmentName.innerHTML).toEqual(mockAssessment.name);
        expect(page.assessmentDescription).toBeTruthy();
        expect(page.overDueMsg).toBeFalsy();
        expect(page.dueMsg.innerHTML.trim()).toEqual(shared.dueDateFormatter(mockAssessment.dueDate));
        mockAssessment.groups.forEach((group, groupIndex) => {
          expect(page.groupNames[groupIndex].innerHTML).toEqual(group.name);
          expect(page.groupDescriptions[groupIndex]).toBeTruthy();
          group.questions.forEach((question, questionIndex) => {
            expect(page.questionNames[questionIndex].innerHTML).toContain(question.name);
            expect(page.questionDescriptions[questionIndex]).toBeTruthy();
          });
        });
        expect(notificationSpy.alert.calls.count()).toBe(1);
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
        expect(component.doReview).toBe(false);
        expect(component.savingMessage).toEqual('Last saved ' + utils.timeFormatter(mockSubmission.modified));
        expect(component.savingButtonDisabled).toBe(false);
      };
    });

    it('should get correct in progress locked submission', () => {
      tmpSubmission = JSON.parse(JSON.stringify(mockSubmission));
      tmpSubmission.isLocked = true;
      customTests = () => {
        expect(component.doAssessment).toBe(false);
        expect(component.doReview).toBe(false);
        expect(component.savingButtonDisabled).toBe(true);
        expect(component.submission.status).toEqual('done');
      };
    });

    it('should get correct done submission', () => {
      tmpSubmission = JSON.parse(JSON.stringify(mockSubmission));
      tmpSubmission.status = 'done';
      customTests = () => {
        expect(component.submission).toEqual(tmpSubmission);
        expect(component.doAssessment).toBe(false);
        expect(component.doReview).toBe(false);
        expect(component.savingButtonDisabled).toBe(true);
      };
    });

    it('should get correct in progress review', () => {
      tmpSubmission = JSON.parse(JSON.stringify(mockSubmission));
      tmpSubmission.status = 'pending review';
      tmpReview = mockReview;
      routeStub.snapshot.data.action = 'review';
      customTests = () => {
        expect(component.review).toEqual(mockReview);
        expect(component.doAssessment).toBe(false);
        expect(component.doReview).toBe(true);
        expect(component.savingButtonDisabled).toBe(false);
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
        expect(component.doReview).toBe(false, 'not do review');
        expect(component.savingButtonDisabled).toBe(true);
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

  it('should navigate to the correct page #1', () => {
    spyOn(component.navigate, 'emit');
    component.fromPage = 'reviews';
    component.navigateBack();

    // let's assume test is run under desktop environment
    expect(component.navigate.emit).toHaveBeenCalled();
  });

  it('should navigate to the correct page #2', () => {
    component.fromPage = 'events';
    component.navigateBack();
  });

  it('should navigate to the correct page #3', () => {
    component.activityId = 1;
    component.navigateBack();
    expect(component.activityId).toEqual(1);
    expect(routerSpy.navigate.calls.first().args[0]).toEqual(['app', 'activity', 1]);
  });

  it('should navigate to the correct page #4', () => {
    component.activityId = null;
    component.navigateBack();
    expect(routerSpy.navigate.calls.first().args[0]).toEqual(['app', 'home']);
  });

  it('should pop up mark feedback as read confirmation when going back', () => {
    component.action = 'assessment';
    component.submission.status = 'published';
    component.feedbackReviewed = false;
    component.back();
    expect(routerSpy.navigate.calls.count()).toBe(0);
  });

  it('should save in progress and navigate to other page when going back', () => {
    component.back();
    expect(component.savingMessage).toContain('Last saved');
    expect(routerSpy.navigate.calls.first().args[0]).toEqual(['app', 'home']);
  });

  it('should list unanswered required questions from compulsoryQuestionsAnswered()', () => {
    expect(component.compulsoryQuestionsAnswered).toBeDefined();
    component.assessment = mockAssessment;
    const answers = [
      {
        'assessment_question_id': 123,
        'answer': null
      },
      {
        'assessment_question_id': 124,
        'answer': null
      }
    ];

    const unansweredQuestions = component.compulsoryQuestionsAnswered(answers);
    expect(unansweredQuestions).toEqual([mockQuestions[0]]);
  });

  it('should return empty from compulsoryQuestionsAnswered() if all required question has been answered', () => {
    expect(component.compulsoryQuestionsAnswered).toBeDefined();
    component.assessment = mockAssessment;
    const answers = [
      {
        'assessment_question_id': 123,
        'answer': 'abc'
      },
      {
        'assessment_question_id': 124,
        'answer': null
      }
    ];
    expect(component.compulsoryQuestionsAnswered(answers)).toEqual([]);
  });

  describe('should get correct assessment answers when', () => {
    let assessment;
    let answers;
    let savingButtonDisabled = false;

    beforeEach(() => {
      component.assessment = mockAssessment;
      component.id = 1;
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
      expect(component.savingButtonDisabled).toBe(savingButtonDisabled);
      expect(notificationSpy.popUp.calls.count()).toBe(0);
      expect(assessment.id).toBe(1);
      expect(assessment.context_id).toBe(2);
      expect(answers).toEqual([
        {
          assessment_question_id: 123,
          answer: 'abc'
        },
        {
          assessment_question_id: 124,
          answer: null
        },
        {
          assessment_question_id: 125,
          answer: []
        }
      ]);
    });

    it('saving in progress', () => {
      component.submit(true);
      assessment = assessmentSpy.saveAnswers.calls.first().args[0];
      answers = assessmentSpy.saveAnswers.calls.first().args[1];
      expect(component.submitting).toBeFalsy();
      expect(component.savingMessage).toContain('Last saved');
      expect(assessment.in_progress).toBe(true);
      expect(assessment.unlock).toBeFalsy();
    });

    it('saving in progress, and unlock the submission for team assessment', () => {
      component.submit(true, true);
      assessment = assessmentSpy.saveAnswers.calls.first().args[0];
      answers = assessmentSpy.saveAnswers.calls.first().args[1];
      expect(assessment.unlock).toBe(true);
    });

    it('submitting', () => {
      savingButtonDisabled = true;
      component.submit(false);
      assessment = assessmentSpy.saveAnswers.calls.first().args[0];
      answers = assessmentSpy.saveAnswers.calls.first().args[1];
      expect(component.submitting).toEqual(false);
      expect(component.saving).toBe(true);
      expect(assessment.in_progress).toBe(false);
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
    component.submit(false);
    expect(component.submitting).toBe(false);
    expect(notificationSpy.popUp.calls.count()).toBe(1);
  });

  describe('submitting assessment submit(false)', () => {
    const activityId = 1;
    const emptyAnswers = [];
    const action = 'assessment';
    const assessmentId = 0;

    beforeEach(() => {
      component.id = activityId;
      component.action = action;
      component.assessment = {
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
      component.submit(false);
      expect(assessmentSpy.saveAnswers).toHaveBeenCalled();
      expect(assessmentSpy.saveAnswers).toHaveBeenCalledWith(
        {
          id: activityId,
          in_progress: false, // default value
        },
        emptyAnswers,
        action,
        assessmentId
      );
    });

    it(`should check fastfeedback availability as pulseCheck is 'true'`, () => {
      component.submit(false);
      const spy = spyOn(fastFeedbackSpy, 'pullFastFeedback').and.returnValue(of(fastFeedbackSpy.pullFastFeedback()));
      spyOn(component, 'goToNextTask');
      spyOn(component, 'navigateBack');
      fixture.detectChanges();
      expect(fastFeedbackSpy.pullFastFeedback.calls.count()).toEqual(1);
      if (component.doReview === true) {
        expect(component.navigateBack).toHaveBeenCalled();
      }
    });

    it('should skip fastfeedback if pulsecheck = false', () => {
      component.assessment.pulseCheck = false;
      spyOn(fastFeedbackSpy, 'pullFastFeedback');
      spyOn(component, 'goToNextTask');
      component.submit(false);
      expect(fastFeedbackSpy.pullFastFeedback.calls.count()).toEqual(0);
    });
  });

  describe('click continue button', () => {
    it('should go to next task', () => {
      component.clickBtnContinue();
      expect(activitySpy.gotoNextTask.calls.count()).toEqual(1);
      expect(component.continueBtnLoading).toBe(true);
    });
    it('should mark feedback as read and go to next task', fakeAsync(() => {
      component.submission.status = 'published';
      component.feedbackReviewed = false;
      component.clickBtnContinue();
      tick();
      expect(assessmentSpy.saveFeedbackReviewed.calls.count()).toEqual(1);
      expect(activitySpy.gotoNextTask.calls.count()).toEqual(1);
      expect(component.continueBtnLoading).toBe(true);
    }));
    it('should go to events page', () => {
      spyOn(component.navigate, 'emit');
      component.fromPage = 'events';
      component.action = 'assessment';
      component.clickBtnContinue();
      expect(component.navigate.emit).toHaveBeenCalled();
    });
  });

  describe('when testing footerText()', () => {
    it('should return submitting', () => {
      component.doAssessment = true;
      component.submitting = true;
      expect(component.footerText()).toEqual('submitting');
    });
    it('should return submitted', () => {
      component.doReview = true;
      component.submitted = true;
      expect(component.footerText()).toEqual('submitted');
    });
    it('should return feedback available', () => {
      component.submission.status = 'published';
      expect(component.footerText()).toEqual('feedback available');
    });
    it('should return done', () => {
      component.submission.status = 'published';
      component.feedbackReviewed = true;
      expect(component.footerText()).toEqual('done');
    });
    it('should return pending review', () => {
      component.submission.status = 'pending approval';
      expect(component.footerText()).toEqual('pending review');
    });
    it('should return pending review', () => {
      component.submission.status = 'pending review';
      expect(component.footerText()).toEqual('pending review');
    });
  });

  describe('when testing markReviewFeedbackAsRead()', () => {
    it('should pop up review rating modal', fakeAsync(() => {
      storageSpy.getUser.and.returnValue({ hasReviewRating: true });
      component.markReviewFeedbackAsRead();
      tick();
      expect(assessmentSpy.popUpReviewRating.calls.count()).toBe(1);
    }));
  });

  it('showQuestionInfo() should popup info modal', () => {
    component.showQuestionInfo('abc');
    expect(notificationSpy.popUp.calls.count()).toBe(1);
  });
});
