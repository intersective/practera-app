import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService } from '@v3/services/activity.service';
import { TopicService } from '@v3/services/topic.service';
import { IonicModule } from '@ionic/angular';
import { MockRouter } from '@testingv3/mocked.service';
import { ActivatedRouteStub } from '@testingv3/activated-route-stub';

import { TopicMobilePage } from './topic-mobile.page';
import { of } from 'rxjs';

describe('TopicMobilePage', () => {
  let component: TopicMobilePage;
  let fixture: ComponentFixture<TopicMobilePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TopicMobilePage ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: new ActivatedRouteStub({
            id: 1, activityId: 1
          }),
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: TopicService,
          useValue: jasmine.createSpyObj('TopicService', [
          'getTopic',
          'updateTopicProgress',
          ], {
            topic$: of(true)
          }),
        },
        {
          provide: ActivityService,
          useValue: jasmine.createSpyObj('ActivityService', [
            'getActivity', 'goToNextTask'
          ], {
            currentTask$: of(true)
          }),
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
