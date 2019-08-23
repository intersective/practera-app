import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { AssessmentComponent } from './assessment.component';
import { AssessmentService } from './assessment.service';
import { UtilsService } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { ActivityService } from '@app/activity/activity.service';
import { FastFeedbackService } from '@app/fast-feedback/fast-feedback.service';
import { BrowserStorageService } from '@services/storage.service';
import { SharedService } from '@services/shared.service';
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
  let routeStub: Partial<ActivatedRoute>;
  let shared: SharedService;
  const mockAssessment = {
    name: 'test',
    description: 'test',
    isForTeam: false,
    dueDate: '2029-02-02',
    isOverdue: false,
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
          type: 'text',
          isRequired: true,
          audience: ['participant', 'mentor']
        },
        {
          id: 124,
          name: 'test',
          description: 'test',
          canAnswer: true,
          canComment: false,
          type: 'text',
          isRequired: true,
          audience: ['participant', 'mentor']
        }
      ],
    }],
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, HttpClientModule],
      declarations: [AssessmentComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        UtilsService,
        SharedService,
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
            getUser: {
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
              }
            }
          }
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
    routeStub = TestBed.get(ActivatedRoute);
    shared = TestBed.get(SharedService);
    // initialise service calls
    assessmentSpy.getAssessment.and.returnValue(of(mockAssessment));
    assessmentSpy.getSubmission.and.returnValue(of({
      submission: {},
      review: {}
    }));
  });

  it('should create', () => {
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

  it('should get correct assessment and display correct info in html', () => {
    fixture.detectChanges();
    expect(component.assessment).toEqual(mockAssessment);
    expect(component.loadingAssessment).toEqual(false);
    expect(element.querySelector('ion-title.subTitle')).toBeTruthy();
    expect(element.querySelector('h1').innerHTML).toEqual(mockAssessment.name);
    expect(element.querySelector('app-description')).toBeTruthy();
    expect(element.querySelector('p.over')).toBeFalsy();
    expect(element.querySelector('p.due-date').innerHTML).toEqual(shared.dueDateFormatter(mockAssessment.dueDate));
  });

  it('should list unanswered question compulsoryQuestionsAnswered', () => {
    expect(component.compulsoryQuestionsAnswered).toBeDefined();

    component.assessment = mockAssessment;

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
