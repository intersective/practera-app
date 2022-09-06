import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService } from '@v3/services/activity.service';
import { AssessmentService } from '@v3/services/assessment.service';
import { UtilsService } from '@v3/services/utils.service';
import { IonicModule } from '@ionic/angular';
import { AchievementService } from '@v3/app/services/achievement.service';
import { HomeService } from '@v3/app/services/home.service';
import { NotificationsService } from '@v3/app/services/notifications.service';

import { HomePage } from './home.page';
import { of } from 'rxjs';
import { ActivatedRouteStub } from '@testingv3/activated-route-stub';
import { MockRouter } from '@testingv3/mocked.service';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HomePage ],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: new ActivatedRouteStub({}),
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: HomeService,
          useValue: jasmine.createSpyObj('HomeService', [
            'getExperience',
            'getMilestones',
            'getProjectProgress',
          ], {
            'experience$': of(),
            'experienceProgress$': of(),
            'activityCount$': of(),
            'milestonesWithProgress$': of(),
          })
        },
        {
          provide: AchievementService,
          useValue: jasmine.createSpyObj('AchievementService', [''])
        },
        {
          provide: ActivityService,
          useValue: jasmine.createSpyObj('ActivityService', [''])
        },
        {
          provide: AssessmentService,
          useValue: jasmine.createSpyObj('AssessmentService', [''])
        },
        {
          provide: UtilsService,
          useValue: jasmine.createSpyObj('UtilsService', [''])
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', [''])
        },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
