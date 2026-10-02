import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService, Task } from '@v3/services/activity.service';
import { AssessmentService, Assessment, Submission, AssessmentReview } from '@v3/services/assessment.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { IonicModule } from '@ionic/angular';
import { ActivatedRouteStub } from '@testingv3/activated-route-stub';
import { MockRouter } from '@testingv3/mocked.service';
import { TestUtils } from '@testingv3/utils';
import { NotificationsService } from '@v3/services/notifications.service';
import { of, Subscription, throwError } from 'rxjs';
import { ReviewService } from '@v3/app/services/review.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

const SAVE_PROGRESS_TIMEOUT = 10000;

import { AssessmentMobilePage } from './assessment-mobile.page';
import { ElementRef } from '@angular/core';

class MockChildComponent {
  btnBackClicked = jasmine.createSpy('btnBackClicked');
}

describe('AssessmentMobilePage', () => {
  let component: AssessmentMobilePage;
  let fixture: ComponentFixture<AssessmentMobilePage>;
  let assessmentSpy: jasmine.SpyObj<AssessmentService>;
  let activitySpy: jasmine.SpyObj<ActivityService>;
  let notificationSpy: jasmine.SpyObj<NotificationsService>;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;
  let reviewSpy: jasmine.SpyObj<ReviewService>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssessmentMobilePage ],
      imports: [IonicModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: new ActivatedRouteStub({
            from: '',
            action: '',
          }),
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: AssessmentService,
          useValue: jasmine.createSpyObj('AssessmentService', {
            getAssessment: of(true),
            fetchAssessment: of(true),
            submitAssessment: of(true),
            submitReview: of(true),
            pullFastFeedback: Promise.resolve(),
            saveFeedbackReviewed: of({}),
          }, {
            assessment$: of(true),
            submission$: of(true),
            review$: of({ id: 1, status: 'done' }),
          }),
        },
        {
          provide: ActivityService,
          useValue: jasmine.createSpyObj('ActivityService', [
            'goToNextTask',
            'getActivity',
          ], {
            currentTask$: of(null),
            activity$: of(null),
          }),
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['getUser']),
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', [
            'assessmentSubmittedToast',
            'alert',
            'popUpReviewRating',
            'getTodoItems',
          ]),
        },
        {
          provide: UtilsService,
          useClass: TestUtils
        },
        {
          provide: ReviewService,
          useValue: jasmine.createSpyObj('ReviewService', ['popUpReviewRating', 'getReviews']),
        },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AssessmentMobilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    assessmentSpy = TestBed.inject(AssessmentService) as jasmine.SpyObj<AssessmentService>;
    activitySpy = TestBed.inject(ActivityService) as jasmine.SpyObj<ActivityService>;
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    notificationSpy = TestBed.inject(NotificationsService) as jasmine.SpyObj<NotificationsService>;
    reviewSpy = TestBed.inject(ReviewService) as jasmine.SpyObj<ReviewService>;
    notificationSpy.getTodoItems.and.returnValue(of({}));
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call goToNextTask when continuing', () => {
    component.currentTask = { id: 1, type: 'Assessment', name: 'Test', status: 'done' };
    component['activityService'].goToNextTask();
    expect(activitySpy.goToNextTask).toHaveBeenCalled();
  });

  it('should call goBack()', () => {
    component.goBack();

    expect(component['router'].navigate).toHaveBeenCalled();
  });

  it('should call saveAssessment() when action is assessment and autoSave is true', fakeAsync(() => {
    assessmentSpy.fetchAssessment.and.returnValue(of({
      assessment: {} as Assessment,
      submission: { status: 'in progress' } as Submission,
      review: {} as AssessmentReview
    }));
    assessmentSpy.submitAssessment.and.returnValue(of({ data: { submitAssessment: { success: true } } }));
    const event = {
      assessmentId: 1,
      contextId: 1,
      submissionId: 1,
      answers: [],
      autoSave: true,
    };
    component.action = 'assessment';
    component.saving = false;
    component.assessment = { pulseCheck: false, id: 1, name: 'Test Assessment', type: 'quiz', description: '' } as Assessment;
    component.activityId = 1;

    component.saveAssessment(event);
    tick();

    expect(assessmentSpy.fetchAssessment).toHaveBeenCalledWith(event.assessmentId, 'assessment', 1, event.contextId, event.submissionId);
    expect(assessmentSpy.submitAssessment).toHaveBeenCalledWith(event.submissionId, event.assessmentId, event.contextId, event.answers);
    expect(notificationSpy.assessmentSubmittedToast).not.toHaveBeenCalled();
    expect(activitySpy.getActivity).not.toHaveBeenCalled();
    expect(component.savingText$.getValue()).toContain('Last saved');
    tick(SAVE_PROGRESS_TIMEOUT);
    expect(component.btnDisabled$.getValue()).toBe(false);
    expect(component.saving).toBe(false);
  }));

  it('refreshes assignment notifications after a successful mobile review submission', fakeAsync(() => {
    assessmentSpy.fetchAssessment.and.returnValue(of({ assessment: {} as Assessment,
      submission: { status: 'pending review' } as Submission, review: {} as AssessmentReview }));
    assessmentSpy.submitReview.and.returnValue(of({ data: { submitReview: { success: true } } }));
    notificationSpy.getTodoItems.and.returnValue(of({}));
    component.action = 'review';
    component.assessment = { id: 501, pulseCheck: false } as Assessment;
    component.review = { id: 1001 } as AssessmentReview;
    component.activityId = 301;
    component.contextId = 601;
    component.submissionId = 901;
    component.saveAssessment({ assessmentId: 501, contextId: 601, submissionId: 901,
      answers: [{ questionId: 201, answer: 'Expert recommendation' }], autoSave: false });
    tick();
    flushMicrotasks();
    expect(reviewSpy.getReviews).toHaveBeenCalled();
    expect(notificationSpy.getTodoItems).toHaveBeenCalledTimes(1);
    expect(notificationSpy.assessmentSubmittedToast).toHaveBeenCalledWith({ isReview: true });
    expect(component.saving).toBeFalse();
  }));

  it('still completes a confirmed mobile review when notification refresh fails', fakeAsync(() => {
    spyOn(console, 'error');
    assessmentSpy.fetchAssessment.and.returnValues(
      of({ submission: { status: 'pending review' } as Submission } as any),
      of({ submission: { status: 'feedback available' } as Submission, review: { status: 'done' } } as any));
    assessmentSpy.submitReview.and.returnValue(of({ data: { submitReview: { success: true } } }));
    notificationSpy.getTodoItems.and.returnValue(throwError(() => new Error('Todo refresh unavailable')));
    component.action = 'review';
    component.assessment = { id: 501, pulseCheck: false } as Assessment;
    component.review = { id: 1001 } as AssessmentReview;
    component.activityId = 301;
    component.contextId = 601;
    component.submissionId = 901;
    const event = { assessmentId: 501, contextId: 601, submissionId: 901,
      answers: [{ questionId: 201, answer: 'Expert recommendation' }], autoSave: false };
    component.saveAssessment(event);
    tick();
    flushMicrotasks();
    expect(assessmentSpy.fetchAssessment).toHaveBeenCalledTimes(2);
    expect(notificationSpy.assessmentSubmittedToast).toHaveBeenCalledWith({ isReview: true });
    expect(notificationSpy.assessmentSubmittedToast).not.toHaveBeenCalledWith({ isFail: true });
    expect(component.saving).toBeFalse();
    assessmentSpy.fetchAssessment.and.returnValue(of({ submission: { status: 'feedback available' } } as any));
    component.saveAssessment(event);
    tick();
    expect(assessmentSpy.submitReview).toHaveBeenCalledTimes(1);
  }));

  it('should call saveAssessment() when action is assessment and autoSave is false', fakeAsync(() => {
    assessmentSpy.fetchAssessment.and.returnValue(of({
      assessment: {} as Assessment,
      submission: { status: 'in progress' } as Submission,
      review: {} as AssessmentReview
    }));
    assessmentSpy.submitAssessment.and.returnValue(of({ data: { submitAssessment: { success: true } } }));
    activitySpy.getActivity.and.callFake((activityId, navigate, task, callback) => {
      if (callback) {
        callback();
      }
      return new Subscription(); // Return a Subscription
    });

    const event = {
      assessmentId: 1,
      contextId: 1,
      submissionId: 1,
      answers: [],
      autoSave: false,
    };
    component.action = 'assessment';
    component.saving = false;
    component.assessment = { pulseCheck: true, id: 1, name: 'Test Assessment', type: 'quiz', description: '' } as Assessment;
    component.activityId = 1;
    component.contextId = 1;
    component.submissionId = 1;


    component.saveAssessment(event);
    tick();
    flushMicrotasks();

    expect(assessmentSpy.fetchAssessment).toHaveBeenCalledWith(event.assessmentId, 'assessment', 1, event.contextId, event.submissionId);
    expect(assessmentSpy.submitAssessment).toHaveBeenCalledWith(event.submissionId, event.assessmentId, event.contextId, event.answers);
    expect(assessmentSpy.pullFastFeedback).toHaveBeenCalled();
    expect(notificationSpy.assessmentSubmittedToast).toHaveBeenCalledWith({ isReview: false });
    expect(assessmentSpy.fetchAssessment).toHaveBeenCalledWith(1, 'assessment', 1, 1, 1);
    expect(activitySpy.getActivity).toHaveBeenCalled();
    expect(component.savingText$.getValue()).toContain('Last saved');
    expect(component.btnDisabled$.getValue()).toBe(false);
    expect(component.saving).toBe(false);
  }));

  it('should call saveAssessment() when action is review and autoSave is false', fakeAsync(() => {
    assessmentSpy.fetchAssessment.and.returnValue(of({
      assessment: {} as Assessment,
      submission: { status: 'pending review' } as Submission,
      review: {} as AssessmentReview
    }));
    assessmentSpy.submitReview.and.returnValue(of({ data: { submitReview: { success: true } } }));
    component.review = { id: 1, reviewerId: 1, status: 'pending', answers: [], submitted: '', modified: '' } as AssessmentReview;

    const event = {
      assessmentId: 1,
      contextId: 1,
      submissionId: 1,
      answers: [],
      autoSave: false,
    };
    component.action = 'review';
    component.saving = false;
    component.assessment = { pulseCheck: true, id: 1, name: 'Test Assessment', type: 'quiz', description: '' } as Assessment;
    component.activityId = 1;
    component.contextId = 1;
    component.submissionId = 1;

    component.saveAssessment(event);
    tick();

    expect(assessmentSpy.fetchAssessment).toHaveBeenCalledWith(event.assessmentId, 'review', 1, event.contextId, event.submissionId);
    expect(assessmentSpy.submitReview).toHaveBeenCalledWith(event.assessmentId, component.review.id, event.submissionId, event.answers);
    expect(reviewSpy.getReviews).toHaveBeenCalled();
    expect(assessmentSpy.pullFastFeedback).toHaveBeenCalled();
    expect(notificationSpy.assessmentSubmittedToast).toHaveBeenCalledWith({ isReview: true });
    expect(assessmentSpy.fetchAssessment).toHaveBeenCalledWith(1, 'review', 1, 1, 1);
    expect(component.savingText$.getValue()).toContain('Last saved');
    expect(component.btnDisabled$.getValue()).toBe(false);
    expect(component.saving).toBe(false);
  }));


  it('should handle error in saveAssessment()', fakeAsync(() => {
    assessmentSpy.fetchAssessment.and.returnValue(of({
      assessment: {} as Assessment,
      submission: { status: 'in progress' } as Submission,
      review: {} as AssessmentReview
    }));
    assessmentSpy.submitAssessment.and.throwError('submit error');
    const event = {
      assessmentId: 1,
      contextId: 1,
      submissionId: 1,
      answers: [],
      autoSave: false,
    };
    component.action = 'assessment';
    component.saving = false;
    component.assessment = { pulseCheck: false, id: 1, name: 'Test Assessment', type: 'quiz', description: '' } as Assessment;

    component.saveAssessment(event);
    tick();

    expect(notificationSpy.assessmentSubmittedToast).toHaveBeenCalledWith({ isFail: true });
    expect(component.btnDisabled$.getValue()).toBe(false);
    expect(component.saving).toBe(false);
  }));


  it('should call readFeedback()', async () => {
    storageSpy.getUser.and.returnValue({ hasReviewRating: true });
    assessmentSpy.saveFeedbackReviewed.and.returnValue(of({}));
    notificationSpy.getTodoItems.and.returnValue(of({}));
    notificationSpy.popUpReviewRating.and.resolveTo();
    activitySpy.getActivity.and.returnValue(new Subscription());

    const submissionId = 1;
    component.review = { id: 1 } as AssessmentReview;
    await component.readFeedback(submissionId);
    expect(assessmentSpy.saveFeedbackReviewed).toHaveBeenCalledWith(submissionId);
    expect(notificationSpy.popUpReviewRating).toHaveBeenCalled();
    expect(notificationSpy.getTodoItems).toHaveBeenCalled();
    expect(activitySpy.getActivity).toHaveBeenCalled();
  });

  it('should call nextTask()', () => {
    component.activityId = 1;
    component.nextTask();
    expect(activitySpy.getActivity).toHaveBeenCalledWith(1, true, jasmine.anything());
  });

  it('keeps the mobile feedback task open after a failed acknowledgment and allows retry', fakeAsync(() => {
    spyOn(console, 'error');
    storageSpy.getUser.and.returnValue({ hasReviewRating: false });
    component.assessment = { id: 501, name: 'Moderated work', hasReviewRating: false } as Assessment;
    component.activityId = 301;
    component.contextId = 601;
    notificationSpy.getTodoItems.and.returnValue(of([]));
    assessmentSpy.saveFeedbackReviewed.and.returnValue(throwError(() => new Error('Acknowledgment failed')));
    component.btnDisabled$.next(true);
    component.readFeedback(901);
    flushMicrotasks();
    expect(activitySpy.getActivity).not.toHaveBeenCalled();
    expect(notificationSpy.getTodoItems).not.toHaveBeenCalled();
    expect(notificationSpy.popUpReviewRating).not.toHaveBeenCalled();
    expect(component.btnDisabled$.value).toBeFalse();
    assessmentSpy.saveFeedbackReviewed.and.returnValue(of({ data: { updateTodoItem: { success: true } } }));
    component.readFeedback(901);
    tick(401);
    expect(activitySpy.getActivity).toHaveBeenCalledWith(301, true, jasmine.objectContaining({ id: 501, contextId: 601 }));
    expect(notificationSpy.getTodoItems).toHaveBeenCalledTimes(1);
    expect(notificationSpy.popUpReviewRating).not.toHaveBeenCalled();
  }));

  it('should call reviewRatingPopUp() with hasReviewRating as true', async () => {
    storageSpy.getUser.and.returnValue({ hasReviewRating: true });
    notificationSpy.popUpReviewRating.and.resolveTo();

    await component.reviewRatingPopUp();
    expect(notificationSpy.popUpReviewRating).toHaveBeenCalled();
  });

  it('should call reviewRatingPopUp() with hasReviewRating as false', async () => {
    storageSpy.getUser.and.returnValue({ hasReviewRating: false });

    await component.reviewRatingPopUp();
    expect(notificationSpy.popUpReviewRating).not.toHaveBeenCalled();
  });
});
