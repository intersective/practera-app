import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService } from '@app/activity/activity.service';
import { AssessmentService } from '@app/assessment/assessment.service';
import { BrowserStorageService } from '@app/services/storage.service';
import { UtilsService } from '@app/services/utils.service';
import { TopicService } from '@app/topic/topic.service';
import { IonicModule } from '@ionic/angular';
import { ActivatedRouteStub } from '@testingv3/activated-route-stub';
import { MockRouter } from '@testingv3/mocked.service';
import { TestUtils } from '@testingv3/utils';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { of } from 'rxjs';

import { ActivityDesktopPage } from './activity-desktop.page';

describe('ActivityDesktopPage', () => {
  let component: ActivityDesktopPage;
  let fixture: ComponentFixture<ActivityDesktopPage>;

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
          useValue: jasmine.createSpyObj('BrowserStorageService', ['getUser']),
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
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
