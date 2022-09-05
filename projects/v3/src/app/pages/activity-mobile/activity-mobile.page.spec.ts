import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService } from '@v3/services/activity.service';
import { AssessmentService } from '@v3/services/assessment.service';
import { IonicModule } from '@ionic/angular';

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
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: ActivatedRoute,
          useClass: ActivatedRouteStub,
          // useValue: jasmine.createSpyObj('ActivatedRoute', ['params']),
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
