import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
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
import { of } from 'rxjs';

class Page {
  get savingMessage() {
    return this.query<HTMLElement>('ion-title.subTitle');
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

fdescribe('AssessmentComponent', () => {
  let component: AssessmentComponent;
  let fixture: ComponentFixture<AssessmentComponent>;
  let page: Page;
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
          isRequired: false,
          audience: ['participant', 'mentor']
        }
      ],
    }],
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, QuestionsModule, HttpClientModule],
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
    page = new Page(fixture);
    assessmentSpy = TestBed.get(AssessmentService);
    notificationSpy = TestBed.get(NotificationService);
    activitySpy = TestBed.get(ActivityService);
    fastFeedbackSpy = TestBed.get(FastFeedbackService);
    routeStub = TestBed.get(ActivatedRoute);
    shared = TestBed.get(SharedService);
    // initialise service calls
    assessmentSpy.getAssessment.and.returnValue(of(mockAssessment));
    // no submissions by default
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
    expect(page.savingMessage).toBeTruthy();
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
