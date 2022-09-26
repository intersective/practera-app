import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService } from '@v3/services/activity.service';
import { AssessmentService } from '@v3/services/assessment.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { TopicService } from '@v3/services/topic.service';
import { IonicModule } from '@ionic/angular';
import { ActivatedRouteStub } from '@testingv3/activated-route-stub';
import { MockRouter } from '@testingv3/mocked.service';
import { TestUtils } from '@testingv3/utils';
import { NotificationsService } from '@v3/services/notifications.service';
import { of } from 'rxjs';

import { ActivityDesktopPage } from './activity-desktop.page';
import { NormalisedTaskFixture } from '@testingv3/fixtures/tasks';

describe('ActivityDesktopPage', () => {
  let component: ActivityDesktopPage;
  let fixture: ComponentFixture<ActivityDesktopPage>;
  let routerSpy: Router;
  let activitySpy: ActivityService;
  let topicSpy: TopicService;
  let assessmentSpy: AssessmentService;

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
          useValue: jasmine.createSpyObj('TopicService', ['updateTopicProgress'], {
            topic$: of(true)
          }),
        },
        {
          provide: AssessmentService,
          useValue: jasmine.createSpyObj('AssessmentService', [
            'saveAnswers',
            'getAssessment',
            'saveFeedbackReviewed',
            'popUpReviewRating',
          ], {
            'assessment$': of(true),
            'submission$': of(true),
            'review$': of(true),
          }),
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', [
            'assessmentSubmittedToast',
            'alert',
          ]),
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', {
            'getUser': {
              hasReviewRating: true
            }
          }),
        },
        {
          provide: UtilsService,
          useClass: TestUtils
        },
      ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityDesktopPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    activitySpy = TestBed.inject(ActivityService) as jasmine.SpyObj<ActivityService>;
    topicSpy = TestBed.inject(TopicService) as jasmine.SpyObj<TopicService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    assessmentSpy = TestBed.inject(AssessmentService) as jasmine.SpyObj<AssessmentService>;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('goToTask()', () => {
    it('should focus "task-content" id element', () => {
      const spy = spyOn(window.document, 'getElementById');
      component.goToTask(NormalisedTaskFixture);
      expect(spy).toHaveBeenCalledWith('task-content');
      expect(activitySpy.goToTask).toHaveBeenCalled();
    });
  });

  describe('topicComplete()', () => {
    it('should request to update progress', () => {
      component.topicComplete(NormalisedTaskFixture);
      expect(topicSpy.updateTopicProgress).toHaveBeenCalled();
      expect(activitySpy.getActivity).toHaveBeenCalled();
    });
  });

  describe('saveAssessment()', () => {
    it('should save answers', fakeAsync(() => {
      assessmentSpy.saveAnswers = jasmine.createSpy().and.returnValue({
        toPromise: jasmine.createSpy()
      });
      const spy = spyOn(component.savingText$, 'next');

      component.saveAssessment({
        assessment: { id: 1, inProgress: true, submssionId: 1, contextId: 1 },
        answers: {},
        action: '',
      }, NormalisedTaskFixture);
      tick();

      expect(assessmentSpy.saveAnswers).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
      expect(component.loading).toBeFalse();
    }));
  });

  describe('readFeedback()', () => {
    it('should mark feedback as read', fakeAsync(() => {
      assessmentSpy.saveFeedbackReviewed = jasmine.createSpy().and.returnValue({ toPromise: jasmine.createSpy() })

      component.readFeedback(1, NormalisedTaskFixture);
      // const spy = spyOn(assessmentSpy.saveFeedbackReviewed);
      tick();
      expect(assessmentSpy.saveFeedbackReviewed).toHaveBeenCalled();
      expect(activitySpy.getActivity).toHaveBeenCalled();
      tick(1000);
      expect(assessmentSpy.popUpReviewRating).toHaveBeenCalled();
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
});
