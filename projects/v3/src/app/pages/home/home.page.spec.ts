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
          useValue: jasmine.createSpyObj('ActivatedRoute', [''])
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', [''])
        },
        {
          provide: HomeService,
          useValue: jasmine.createSpyObj('HomeService', [''])
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
