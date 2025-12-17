import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService } from '@v3/services/activity.service';
import { AssessmentService } from '@v3/services/assessment.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { IonicModule } from '@ionic/angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { ActivityMobilePage } from './activity-mobile.page';
import { of } from 'rxjs';
import { ActivatedRouteStub } from '@testingv3/activated-route-stub';
import { MockRouter } from '@testingv3/mocked.service';

describe('ActivityMobilePage', () => {
  let component: ActivityMobilePage;
  let fixture: ComponentFixture<ActivityMobilePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityMobilePage ],
      imports: [IonicModule.forRoot(), HttpClientTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: ActivatedRoute,
          // useClass: ActivatedRouteStub,
          useValue: jasmine.createSpyObj('ActivatedRoute', [], {
            params: of(true),
          }),
        },
        {
          provide: Router,
          useClass: MockRouter,
          // useValue: jasmine.createSpyObj('Router', ['navigate']),
        },
        {
          provide: ActivityService,
          useValue: jasmine.createSpyObj('ActivityService', {
            'getActivity': of(),
            'goToTask': of(),
          }, {
            'activity$': of(),
          }),
        },
        {
          provide: AssessmentService,
          useValue: jasmine.createSpyObj('AssessmentService', [], {
            'submission$': of(),
          }),
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', [
            'alert',
            'popUp',
            'getTodoItems',
            'markTodoItemAsDone',
          ]),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityMobilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
