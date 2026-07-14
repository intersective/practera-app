import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService } from '@v3/services/activity.service';
import { TopicService } from '@v3/services/topic.service';
import { UtilsService } from '@v3/services/utils.service';
import { IonicModule } from '@ionic/angular';

import { TopicMobilePage } from './topic-mobile.page';
import { BehaviorSubject, of, Subject } from 'rxjs';

describe('TopicMobilePage', () => {
  let component: TopicMobilePage;
  let fixture: ComponentFixture<TopicMobilePage>;
  let routeParams$: Subject<any>;
  let topic$: BehaviorSubject<any>;
  let currentTask$: BehaviorSubject<any>;
  let topicServiceSpy: jasmine.SpyObj<TopicService>;
  let activityServiceSpy: jasmine.SpyObj<ActivityService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let utilsSpy: jasmine.SpyObj<UtilsService>;

  beforeEach(waitForAsync(() => {
    routeParams$ = new Subject<any>();
    topic$ = new BehaviorSubject<any>(null);
    currentTask$ = new BehaviorSubject<any>(null);

    TestBed.configureTestingModule({
      declarations: [ TopicMobilePage ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: routeParams$.asObservable(),
          },
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', ['navigate']),
        },
        {
          provide: TopicService,
          useValue: jasmine.createSpyObj('TopicService', ['getTopic', 'updateTopicProgress'], {
            topic$: topic$.asObservable(),
          }),
        },
        {
          provide: ActivityService,
          useValue: jasmine.createSpyObj('ActivityService', ['getActivity', 'goToNextTask'], {
            currentTask$: currentTask$.asObservable(),
          }),
        },
        {
          provide: UtilsService,
          useValue: jasmine.createSpyObj('UtilsService', ['setPageTitle']),
        }
      ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TopicMobilePage);
    component = fixture.componentInstance;
    topicServiceSpy = TestBed.inject(TopicService) as jasmine.SpyObj<TopicService>;
    activityServiceSpy = TestBed.inject(ActivityService) as jasmine.SpyObj<ActivityService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    utilsSpy = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;

    topicServiceSpy.updateTopicProgress.and.returnValue(of(true) as any);
    activityServiceSpy.getActivity.and.callFake((_activityId: number, _refresh: boolean, _task: any, callback: Function) => {
      callback();
      return Promise.resolve(true) as any;
    });

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise topic and current task from streams', () => {
    routeParams$.next({ id: 12, activityId: 44 });
    topic$.next({ id: 12, title: 'Topic A' } as any);
    currentTask$.next({ id: 999, type: 'Topic', status: 'in progress' } as any);

    expect(topicServiceSpy.getTopic).toHaveBeenCalledWith(44, 12);
    expect(component.activityId).toBe(44);
    expect(component.topic).toEqual(jasmine.objectContaining({ id: 12, title: 'Topic A' }));
    expect(component.currentTask).toEqual(jasmine.objectContaining({ id: 999 }));
    expect(utilsSpy.setPageTitle).toHaveBeenCalledWith('Topic A - Practera');
  });

  it('should continue with done task by going directly to next task', async () => {
    component.topic = { id: 7, title: 'Done Topic' } as any;
    component.currentTask = { id: 7, type: 'Topic', status: 'done' } as any;

    await component.continue();

    expect(activityServiceSpy.goToNextTask).toHaveBeenCalledWith(component.currentTask);
    expect(topicServiceSpy.updateTopicProgress).not.toHaveBeenCalled();
    expect(component.btnDisabled$.value).toBeFalse();
  });

  it('should continue incomplete task by updating progress and refreshing activity', async () => {
    component.topic = { id: 9, title: 'In Progress Topic' } as any;
    component.activityId = 88;
    component.currentTask = { id: 9, type: 'Topic', status: 'in progress' } as any;

    await component.continue();

    expect(topicServiceSpy.updateTopicProgress).toHaveBeenCalledWith(9, 'completed');
    expect(activityServiceSpy.getActivity).toHaveBeenCalled();
    expect(component.btnDisabled$.value).toBeFalse();
  });

  it('should build fallback current task when missing', async () => {
    component.topic = { id: 11, title: 'Fallback Topic' } as any;
    component.activityId = 55;
    component.currentTask = null;

    await component.continue();

    expect(component.currentTask).toEqual(jasmine.objectContaining({ id: 11, type: 'Topic', name: 'Fallback Topic' }));
    expect(topicServiceSpy.updateTopicProgress).toHaveBeenCalledWith(11, 'completed');
  });

  it('should go back to activity-mobile page', () => {
    component.activityId = 123;

    component.goBack();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['v3', 'activity-mobile', 123]);
  });
});
