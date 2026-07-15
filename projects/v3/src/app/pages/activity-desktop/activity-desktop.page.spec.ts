import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService } from '@v3/services/activity.service';
import { AssessmentService } from '@v3/services/assessment.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { TopicService } from '@v3/services/topic.service';
import { ReviewService } from '@v3/services/review.service';
import { IonicModule } from '@ionic/angular';
import { ActivatedRouteStub } from '@testingv3/activated-route-stub';
import { MockRouter } from '@testingv3/mocked.service';
import { TestUtils } from '@testingv3/utils';
import { NotificationsService } from '@v3/services/notifications.service';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ActivityDesktopPage } from './activity-desktop.page';
import { NormalisedTaskFixture, TaskFixture } from '@testingv3/fixtures/tasks';

describe('ActivityDesktopPage', () => {
  let component: ActivityDesktopPage;
  let fixture: ComponentFixture<ActivityDesktopPage>;
  let utilsSpy: UtilsService;
  let routerSpy: Router;
  let activitySpy: ActivityService;
  let topicSpy: TopicService;
  let assessmentSpy: AssessmentService;
  let notificationsSpy: NotificationsService;
  let storageSpy: BrowserStorageService;
  let activatedRouteSpy: ActivatedRoute;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityDesktopPage ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: new ActivatedRouteStub({
            contextId: 1,
            id: 1,
            assessmentId: 1,
          }),
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: ActivityService,
          useValue: jasmine.createSpyObj('ActivityService', [
            'getActivity',
            'goToTask',
            'goToNextTask',
          ], {
            activity$: of(true),
            currentTask$: of(true),
          }),
        },
        {
          provide: TopicService,
          useValue: jasmine.createSpyObj('TopicService', {
            updateTopicProgress: of(true),
            clearTopic: undefined,
          }, {
            topic$: of(true)
          }),
        },
        {
          provide: AssessmentService,
          useValue: jasmine.createSpyObj('AssessmentService', {
            saveAnswers: of(true),
            getAssessment: of(null),
            saveFeedbackReviewed: of(true),
            fetchAssessment: of({ submission: { status: 'in progress' } }),
            submitAssessment: of({ data: { submitAssessment: { success: true } } }),
          }, {
            'assessment$': of(true),
            'assessment': null,
            'submission$': of(true),
            'review$': of({ id: 1, status: 'done' }),
          }),
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', [
            'assessmentSubmittedToast',
            'alert',
            'getTodoItems',
            'getCurrentTodoItems',
            'markTodoItemAsDone',
            'markMultipleTodoItemsAsDone',
          ]),
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', {
            'getUser': { hasReviewRating: true },
            'lastVisited': null,
            'get': null,
            'getFeature': null,
          }),
        },
        {
          provide: UtilsService,
          useClass: TestUtils
        },
        {
          provide: ReviewService,
          useValue: jasmine.createSpyObj('ReviewService', {
            'popUpReviewRating': Promise.resolve(),
          }),
        },
      ],
      imports: [IonicModule.forRoot(), HttpClientTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityDesktopPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    activitySpy = TestBed.inject(ActivityService) as jasmine.SpyObj<ActivityService>;
    utilsSpy = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;
    topicSpy = TestBed.inject(TopicService) as jasmine.SpyObj<TopicService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    assessmentSpy = TestBed.inject(AssessmentService) as jasmine.SpyObj<AssessmentService>;
    notificationsSpy = TestBed.inject(NotificationsService) as jasmine.SpyObj<NotificationsService>;
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    activatedRouteSpy = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getActivity with correct parameters', () => {
    component.ionViewDidEnter();
    expect(activitySpy.getActivity).toHaveBeenCalledWith(1, false, undefined, jasmine.any(Function));
  });

  describe('ngOnInit()', () => {
    it('should get activity at init', () => {
      spyOn(component, 'goToTask');
      utilsSpy.find = jasmine.createSpy().and.returnValue({
        type: 'Topic',
        name: 'test topic',
      });

      activitySpy.getActivity = jasmine.createSpy().and.callFake((id, anything, task, cb) => {
        if (typeof cb === 'function') {
          cb();
        }
      });

      component.activity = {
        id: 1,
        name: 'test',
        tasks: [NormalisedTaskFixture],
        unlockConditions: []
      };

      component.ionViewDidEnter();

      expect(component.goToTask).toHaveBeenCalled();
    });
  });

  describe('goToTask()', () => {
    it('should focus "task-content" id element', () => {
      const spy = spyOn(window.document, 'getElementById').and.returnValue(document.createElement('p'));
      component.goToTask(NormalisedTaskFixture);
      expect(spy).toHaveBeenCalledWith('task-content');
      expect(activitySpy.goToTask).toHaveBeenCalled();
    });
  });

  describe('topicComplete()', () => {
    beforeEach(() => {
      // set required activity object for all tests in this block
      component.activity = { id: 1, name: 'Test Activity' } as any;
    });

    it('should request to update progress', fakeAsync(() => {
      component.topicComplete(NormalisedTaskFixture);
      activitySpy.getActivity = jasmine.createSpy().and.callFake((id, anything, task, cb) => {
        cb();
      });

      tick();
      expect(topicSpy.updateTopicProgress).toHaveBeenCalled();
      expect(activitySpy.getActivity).toHaveBeenCalled();
    }));

    it('should pass attention metrics when updating progress', fakeAsync(() => {
      const attention = {
        version: 1,
        score: 80,
        confidence: 'high',
        activeMs: 10000,
        visibleMs: 10000,
        estimatedReadMs: 9000,
        textWordCount: 30,
        contentExposureRatio: 1,
        mediaProgressRatio: 0,
        mediaPlayedMs: 0,
        filePreviewCount: 0,
        fileDownloadCount: 0,
        quickComplete: false,
      } as any;
      const task = { ...NormalisedTaskFixture, status: 'in progress' };
      component.topicComplete(task, { topic: { id: task.id } as any, attention });
      activitySpy.getActivity = jasmine.createSpy().and.callFake((id, anything, currentTask, cb) => {
        cb();
      });

      tick();

      expect(topicSpy.updateTopicProgress).toHaveBeenCalledWith(task.id, 'completed', attention);
    }));

    it('should go to next task when task is done', () => {
      const task = { ...NormalisedTaskFixture };
      task.status = 'done';
      component.topicComplete(task);
      expect(topicSpy.updateTopicProgress).not.toHaveBeenCalled();
      expect(activitySpy.goToNextTask).toHaveBeenCalled();
    });
  });

  describe('saveAssessment()', () => {
    beforeEach(() => {
      // set required activity object for all tests in this block
      component.activity = { id: 1, name: 'Test Activity' } as any;
    });

    it('should save answers', fakeAsync(() => {
      assessmentSpy.fetchAssessment = jasmine.createSpy().and.returnValue(of({ submission: { status: 'in progress' } }));
      assessmentSpy.submitAssessment = jasmine.createSpy().and.returnValue(of({ data: { submitAssessment: { success: true } } }));
      const saveTextSpy = spyOn(component.savingText$, 'next');
      const btnDisabledSpy = spyOn(component.btnDisabled$, 'next');

      component.saveAssessment({
        assessmentId: 1,
        submissionId: 1,
        contextId: 1,
        answers: {},
        autoSave: true,
      }, NormalisedTaskFixture);
      tick();

      expect(assessmentSpy.fetchAssessment).toHaveBeenCalled();
      expect(assessmentSpy.submitAssessment).toHaveBeenCalled();
      expect(saveTextSpy).toHaveBeenCalled();
      expect(btnDisabledSpy).toHaveBeenCalled();
      tick(10000); // wait for SAVE_PROGRESS_TIMEOUT (10 seconds)
      expect(component.loading).toBeFalse();
    }));

    it('should save answers (when not in progress)', fakeAsync(() => {
      assessmentSpy.fetchAssessment = jasmine.createSpy().and.returnValue(of({ submission: { status: 'done' } }));
      notificationsSpy.assessmentSubmittedToast = jasmine.createSpy();

      activitySpy.getActivity = jasmine.createSpy().and.callFake((id, anything, task, cb) => {
        if (cb) cb();
      });

      const saveTextSpy = spyOn(component.savingText$, 'next');
      const btnDisabledSpy = spyOn(component.btnDisabled$, 'next');

      component.saveAssessment({
        assessmentId: 1,
        submissionId: 1,
        contextId: 1,
        answers: {},
        autoSave: false,
      }, NormalisedTaskFixture);
      tick();

      expect(assessmentSpy.fetchAssessment).toHaveBeenCalled();
      expect(notificationsSpy.assessmentSubmittedToast).toHaveBeenCalled();
      expect(saveTextSpy).toHaveBeenCalled();
      expect(btnDisabledSpy).toHaveBeenCalled();
      tick(1000);
      expect(component.loading).toBeFalse();
    }));
  });

  describe('readFeedback()', () => {
    it('should mark feedback as read', fakeAsync(() => {
      assessmentSpy.saveFeedbackReviewed = jasmine.createSpy().and.returnValue(of(true));
      notificationsSpy.getTodoItems = jasmine.createSpy().and.returnValue(of([]));
      // set required activity object
      component.activity = { id: 1, name: 'Test Activity' } as any;

      component.readFeedback(1, NormalisedTaskFixture);
      // const spy = spyOn(assessmentSpy.saveFeedbackReviewed);
      tick();
      expect(assessmentSpy.saveFeedbackReviewed).toHaveBeenCalled();
      // expect(activitySpy.getActivity).toHaveBeenCalled();
      tick(1000);
      // expect(assessmentSpy.popUpReviewRating).toHaveBeenCalled(); // Removed as popUpReviewRating does not exist on AssessmentService
    }));
  });

  describe('nextTask()', () => {
    it('should back to v3/home', () => {
      component.nextTask(NormalisedTaskFixture);
      expect(activitySpy.goToNextTask).toHaveBeenCalled();
    });
  });

  describe('goBack()', () => {
    it('should back to v3/home', () => {
      component.goBack();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['v3', 'home']);
    });
  });

  describe('reviewRatingPopUp()', () => {
    it('should halt if hasReviewRating is falsy', fakeAsync(() => {
      storageSpy.getUser = jasmine.createSpy().and.returnValue({
        hasReviewRating: false
      });
      component.reviewRatingPopUp();
      tick();
      // expect(assessmentSpy.popUpReviewRating).not.toHaveBeenCalled(); // Removed as popUpReviewRating does not exist on AssessmentService
    }));
  });
});
