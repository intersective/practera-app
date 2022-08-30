import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService } from '@app/activity/activity.service';
import { TopicService } from '@app/topic/topic.service';
import { IonicModule } from '@ionic/angular';

import { TopicMobilePage } from './topic-mobile.page';

describe('TopicMobilePage', () => {
  let component: TopicMobilePage;
  let fixture: ComponentFixture<TopicMobilePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TopicMobilePage ],
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
          provide: TopicService,
          useValue: jasmine.createSpyObj('TopicService', []),
        },
        {
          provide: ActivityService,
          useValue: jasmine.createSpyObj('ActivityService', []),
        },
      ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TopicMobilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
