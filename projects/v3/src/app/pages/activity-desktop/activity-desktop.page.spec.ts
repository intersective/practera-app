import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService } from '@app/activity/activity.service';
import { AssessmentService } from '@app/assessment/assessment.service';
import { BrowserStorageService } from '@app/services/storage.service';
import { UtilsService } from '@app/services/utils.service';
import { TopicService } from '@app/topic/topic.service';
import { IonicModule } from '@ionic/angular';
import { NotificationsService } from '@v3/app/services/notifications.service';

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
          useValue: jasmine.createSpyObj('ActivatedRoute', []),
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', []),
        },
        {
          provide: ActivityService,
          useValue: jasmine.createSpyObj('ActivityService', []),
        },
        {
          provide: TopicService,
          useValue: jasmine.createSpyObj('TopicService', []),
        },
        {
          provide: AssessmentService,
          useValue: jasmine.createSpyObj('AssessmentService', []),
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', []),
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', []),
        },
        {
          provide: UtilsService,
          useValue: jasmine.createSpyObj('UtilsService', []),
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
