import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService } from '@app/activity/activity.service';
import { AssessmentService } from '@app/assessment/assessment.service';
import { BrowserStorageService } from '@app/services/storage.service';
import { UtilsService } from '@app/services/utils.service';
import { IonicModule } from '@ionic/angular';
import { ActivatedRouteStub } from '@testingv3/activated-route-stub';
import { MockRouter } from '@testingv3/mocked.service';
import { TestUtils } from '@testingv3/utils';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { of } from 'rxjs';

import { AssessmentMobilePage } from './assessment-mobile.page';

describe('AssessmentMobilePage', () => {
  let component: AssessmentMobilePage;
  let fixture: ComponentFixture<AssessmentMobilePage>;

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
          useValue: jasmine.createSpyObj('AssessmentService', ['getAssessment'], {
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
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
