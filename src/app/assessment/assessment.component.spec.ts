import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Router, ActivatedRoute } from '@angular/router';
import { ActivatedRouteStub } from '@testing/activated-route-stub';
import { AssessmentComponent } from './assessment.component';
import { AssessmentService } from './assessment.service';
import { UtilsService } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { ActivityService } from '@app/activity/activity.service';
import { FastFeedbackService } from '@app/fast-feedback/fast-feedback.service';
import { BrowserStorageService } from '@services/storage.service';
import { of } from 'rxjs';

fdescribe('AssessmentComponent', () => {
  let component: AssessmentComponent;
  let fixture: ComponentFixture<AssessmentComponent>;
  let element: HTMLElement;
  let assessmentSpy: jasmine.SpyObj<AssessmentService>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  let activitySpy: jasmine.SpyObj<ActivityService>;
  let fastFeedbackSpy: jasmine.SpyObj<FastFeedbackService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routeStub: Partial<ActivatedRouteStub>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientModule],
      declarations: [AssessmentComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        UtilsService,
        {
          provide: AssessmentService,
          useValue: jasmine.createSpyObj('AssessmentService', ['getAssessment', 'getSubmission', 'getFeedbackReviewed', 'saveAnswers', 'saveFeedbackReviewed', 'popUpReviewRating'])
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', ['alert', 'customToast', 'popUp'])
        },
        {
          provide: ActivityService,
          useValue: jasmine.createSpyObj('ActivityService', ['getTasksByActivityId'])
        },
        {
          provide: FastFeedbackService,
          useValue: jasmine.createSpyObj('FastFeedbackService', ['pullFastFeedback'])
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', {
            'getUser': {
              role: 'participant',
              teamId: 1,
              name: 'Test User',
              email: 'user@test.com',
              id: 1
            }
          })
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
            events: of()
          }
        },
        {
          provide: ActivatedRoute,
          useValue: routeStub
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentComponent);
    component = fixture.componentInstance;
    assessmentSpy = TestBed.get(AssessmentService);
    notificationSpy = TestBed.get(NotificationService);
    activitySpy = TestBed.get(ActivityService);
    fastFeedbackSpy = TestBed.get(FastFeedbackService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should list unanswered question compulsoryQuestionsAnswered', () => {
    expect(component.compulsoryQuestionsAnswered).toBeDefined();

    component.assessment = {
      name: 'test',
      description: 'test',
      isForTeam: false,
      groups: [{
        name: 'test groups',
        description: 'test groups description',
        questions: [
          {
            id: 123,
            name: 'test',
            description: 'test',
            canAnswer: true,
            canComment: false,
            type: 'moderated',
            isRequired: true,
            audience: ['participant', 'mentor']
          },
          {
            id: 124,
            name: 'test',
            description: 'test',
            canAnswer: true,
            canComment: false,
            type: 'moderated',
            isRequired: true,
            audience: ['participant', 'mentor']
          }
        ],
      }],
    };

    const answers = {
      'Assessment': {
        'id': 1,
        'context_id': 1,
        'in_progress': false
      },
      'AssessmentSubmission': {
        'id': 1
      },
      'AssessmentSubmissionAnswer': [
        {
          'assessment_question_id': 123,
          'answer': null
        },
        {
          'assessment_question_id': 124,
          'answer': null
        }
      ]
    };

    const unansweredCompulsoryQuestion = component.compulsoryQuestionsAnswered(answers);
    console.log('unansweredCompulsoryQuestion::', unansweredCompulsoryQuestion);
  });
});
