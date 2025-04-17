import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService } from '@v3/services/activity.service';
import { AssessmentService } from '@v3/services/assessment.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { IonicModule } from '@ionic/angular';
import { ActivatedRouteStub } from '@testingv3/activated-route-stub';
import { MockRouter } from '@testingv3/mocked.service';
import { TestUtils } from '@testingv3/utils';
import { NotificationsService } from '@v3/services/notifications.service';
import { of } from 'rxjs';

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
  let elespy: jasmine.SpyObj<ElementRef>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssessmentMobilePage ],
      imports: [IonicModule.forRoot()],
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
          useValue: jasmine.createSpyObj('AssessmentService', [
            'getAssessment',
            'saveAnswers',
            'saveFeedbackReviewed',
          ], {
            assessment$: of(true),
            submission$: of(true),
            review$: of(true),
          }),
        },
        {
          provide: ActivityService,
          useValue: jasmine.createSpyObj('ActivityService', [
            'goToNextTask',
            'getActivity',
          ]),
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
          ]),
        },
        {
          provide: UtilsService,
          useClass: TestUtils
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
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call continue()', () => {
    component.currentTask = { id: 1, type: 'Assessment', name: 'Test', status: 'done' };
    component.nextTask();
    expect(activitySpy.goToNextTask).toHaveBeenCalled();
  });

  it('should call goBack()', () => {
    component.goBack();

    expect(component['router'].navigate).toHaveBeenCalled();
  });

  it('should call saveAssessment() with inProgress as true', fakeAsync(() => {
    assessmentSpy.saveAnswers = jasmine.createSpy().and.returnValue({
      toPromise: jasmine.createSpy()
    });
    const event = {
      assessment: { id: 1, inProgress: true },
      answers: 'test answers',
      action: 'save',
    };
    component.saving = false;
    component.saveAssessment(event).then(() => {
      expect(assessmentSpy.saveAnswers).toHaveBeenCalledWith(event.assessment, event.answers as any, event.action, undefined);
      expect(notificationSpy.assessmentSubmittedToast).not.toHaveBeenCalled();
      expect(activitySpy.getActivity).not.toHaveBeenCalled();
      expect(assessmentSpy.getAssessment).not.toHaveBeenCalledTimes(2); // ngOnInit x 1, saveAssessment x 0
    });

    tick(10000); // SAVE_PROGRESS_TIMEOUT = 10000
  }));

  it('should call saveAssessment() with inProgress as false', fakeAsync(() => {
    assessmentSpy.saveAnswers = jasmine.createSpy().and.returnValue(of({}));
    activitySpy.getActivity = jasmine.createSpy();
    assessmentSpy.getAssessment = jasmine.createSpy();
    const event = {
      assessment: { id: 1, inProgress: false },
      answers: 'test answers',
      action: 'save',
    };

    component.saving = false;
    component.saveAssessment(event);

    tick();

    expect(assessmentSpy.saveAnswers).toHaveBeenCalledWith(event.assessment, event.answers as any, event.action, undefined);
    expect(notificationSpy.assessmentSubmittedToast).toHaveBeenCalled();
    expect(activitySpy.getActivity).toHaveBeenCalled();
    expect(assessmentSpy.getAssessment).toHaveBeenCalled();
  }));

  it('should call readFeedback()', async () => {
    storageSpy.getUser.and.returnValue({ hasReviewRating: true });
    assessmentSpy.saveFeedbackReviewed = jasmine.createSpy().and.returnValue({
      toPromise: jasmine.createSpy()
    });
    const event = { id: 1, data: 'test data' };
    await component.readFeedback(event);
    expect(assessmentSpy.saveFeedbackReviewed).toHaveBeenCalledWith(event);
    expect(notificationSpy.popUpReviewRating).toHaveBeenCalled();
    expect(activitySpy.getActivity).toHaveBeenCalled();
  });

  it('should call nextTask()', () => {
    component.nextTask();
    expect(activitySpy.goToNextTask).toHaveBeenCalled();
  });

  it('should call reviewRatingPopUp() with hasReviewRating as true', async () => {
    storageSpy.getUser.and.returnValue({ hasReviewRating: true });

    await component.reviewRatingPopUp();
    expect(notificationSpy.popUpReviewRating).toHaveBeenCalled();
  });

  it('should call reviewRatingPopUp() with hasReviewRating as false', async () => {
    storageSpy.getUser.and.returnValue({ hasReviewRating: false });

    await component.reviewRatingPopUp();
    expect(notificationSpy.popUpReviewRating).not.toHaveBeenCalled();
  });
});
