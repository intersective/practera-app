import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed, fakeAsync, tick, inject, flushMicrotasks, flush } from '@angular/core/testing';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { TopicComponent } from './topic.component';
import { TopicService } from './topic.service';
import { FilestackService } from '@shared/filestack/filestack.service';
import { EmbedVideoService } from 'ngx-embed-video';
import { ActivatedRouteStub } from '@testing/activated-route-stub';
import { NotificationService } from '@shared/notification/notification.service';
import { BrowserStorageService } from '@services/storage.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { SharedService } from '@services/shared.service';
import { of, throwError } from 'rxjs';
import { MockRouter } from '@testing/mocked.service';
import { UtilsService } from '@app/services/utils.service';
import { TestUtils } from '@testing/utils';
import { ActivityService } from '@app/activity/activity.service';

describe('TopicComponent', () => {
  let component: TopicComponent;
  let fixture: ComponentFixture<TopicComponent>;
  const topicSpy = jasmine.createSpyObj('TopicService', {
    'getTopic': of(),
    'getTopicProgress': of(),
    'updateTopicProgress': of()
  });
  const filestackSpy = jasmine.createSpyObj('FilestackService', ['previewFile']);
  const embedSpy = jasmine.createSpyObj('EmbedVideoService', ['embed']);
  const newRelicSpy = jasmine.createSpyObj('NewRelicService', ['noticeError', 'addPageAction', 'setPageViewName']);
  const sharedSpy = jasmine.createSpyObj('SharedService', ['stopPlayingVideos']);
  const activitySpy = jasmine.createSpyObj('ActivityService', {
    'gotoNextTask': new Promise(() => { })
  });
  let routerSpy: jasmine.SpyObj<Router>;
  let utilsSpy: jasmine.SpyObj<UtilsService>;
  const routeStub = new ActivatedRouteStub({ activityId: 1, id: 2 });
  const notificationSpy = jasmine.createSpyObj('NotificationService', {
    'alert': data => Promise.resolve(data),
    'presentToast': data => Promise.resolve(data),
  });
  const storageSpy = jasmine.createSpyObj('BrowserStorageService', ['getUser', 'get', 'remove']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ TopicComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: TopicService,
          useValue: topicSpy
        },
        {
          provide: FilestackService,
          useValue: filestackSpy
        },
        {
          provide: EmbedVideoService,
          useValue: embedSpy
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: ActivatedRoute,
          useValue: routeStub
        },
        {
          provide: NotificationService,
          useValue: notificationSpy
        },
        {
          provide: SharedService,
          useValue: sharedSpy
        },
        {
          provide: BrowserStorageService,
          useValue: storageSpy
        },
        {
          provide: NewRelicService,
          useValue: newRelicSpy
        },
        {
          provide: ActivityService,
          useValue: activitySpy,
        },
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(TopicComponent);
    component = fixture.componentInstance;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    utilsSpy = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;
    storageSpy.getUser.and.returnValue({
      teamId: 1,
      projectId: 2
    });
    storageSpy.get.and.returnValue({});
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when testing onEnter()', () => {
    it('should get correct data #1', fakeAsync(() => {
      const topic = {
        id: 1,
        title: 'title',
        content: 'content',
        files: [],
        hasComments: false
      };
      topicSpy.getTopic.and.returnValue(of(topic));
      topicSpy.getTopicProgress.and.returnValue(of(1));
      topicSpy.updateTopicProgress.and.returnValue(of(null));
      fixture.detectChanges();
      component.onEnter();
      tick(20000);
      flush();

      expect(component.loadingTopic).toBe(false);
      expect(component.topic).toEqual(topic);
      expect(component.topicProgress).toBe(1);
      expect(component.btnToggleTopicIsDone).toBe(true);
    }));

    it('should get correct data #2', fakeAsync(() => {
      const topic = {
        id: 1,
        title: 'title',
        content: 'content',
        files: [],
        videolink: 'abc',
        hasComments: false
      };
      topicSpy.getTopic.and.returnValue(of(topic));
      topicSpy.getTopicProgress.and.returnValue(of(null));
      fixture.detectChanges();
      component.onEnter();
      tick(20000);

      flush();
      expect(component.loadingTopic).toBe(false);
      expect(component.topic).toEqual(topic);
      expect(component.topicProgress).toBe(null);
      expect(component.btnToggleTopicIsDone).toBe(false);
    }));

    it('should get correct data #3', fakeAsync(() => {
      const topic = {
        id: 1,
        title: 'title',
        content: 'content',
        files: [],
        videolink: 'abc',
        hasComments: false
      };
      topicSpy.getTopic.and.returnValue(of(topic));
      topicSpy.getTopicProgress.and.returnValue(of(0));
      fixture.detectChanges();
      component.onEnter();
      tick(20000);

      flushMicrotasks();
      expect(component.loadingTopic).toBe(false);
      expect(component.topic).toEqual(topic);
      expect(component.topicProgress).toBe(0);
      expect(component.btnToggleTopicIsDone).toBe(false);
    }));

    it('should throw error to newRelic', fakeAsync(() => {
      topicSpy.getTopic = jasmine.createSpy().and.returnValue(throwError(''));
      topicSpy.getTopicProgress = jasmine.createSpy().and.returnValue(throwError(''));
      fixture.detectChanges();
      component.onEnter();
      tick(20000);
      flush();
      expect(newRelicSpy.noticeError).toHaveBeenCalledTimes(2);
    }));
  });

  it('should stop playing videos when leave the page', () => {
    sharedSpy.stopPlayingVideos.and.returnValue('');
    component.ionViewWillLeave();
    expect(sharedSpy.stopPlayingVideos.calls.count()).toBe(1);
  });

  it('should mark topic as done', () => {
    component.markAsDone().subscribe();

    expect(topicSpy.updateTopicProgress).toHaveBeenCalledTimes(5);
    expect(component.btnToggleTopicIsDone).toBe(true);
  });
  describe('when testing continue()', () => {
    it('should go to the next task #1', () => {
      component.continue();
      expect(component.redirecting).toBe(false);
      expect(component.loadingTopic).toBe(true);
    });
    it('should go to the next task #2', () => {
      component.btnToggleTopicIsDone = true;
      component.continue();
      expect(component.redirecting).toBe(true);
      expect(component.loadingTopic).toBe(true);
    });
  });
  describe('when testing previewFile()', () => {
    it('should load the file', fakeAsync(() => {
      const SAMPLE_RESULT = 'SAMPLE';
      let result;
      component.isLoadingPreview = false;
      filestackSpy.previewFile.and.returnValue(Promise.resolve(SAMPLE_RESULT));
      component.previewFile('').then(filestack => {
        result = filestack;
      });
      expect(component.isLoadingPreview).toBe(true);
      fixture.detectChanges();
      flushMicrotasks();
      expect(result).toEqual(SAMPLE_RESULT);
      expect(component.isLoadingPreview).toBe(false);
    }));

    it('should not load if preview fail', fakeAsync(() => {
      const SAMPLE_RESULT = 'FAILED_SAMPLE';
      let result;
      notificationSpy.alert.and.returnValue(Promise.resolve(SAMPLE_RESULT));
      filestackSpy.previewFile.and.rejectWith(new Error('File preview test error'));
      component.isLoadingPreview = false;
      component.previewFile('').then(filestack => {
        result = filestack;
      });
      fixture.detectChanges();
      flushMicrotasks();

      expect(result).toEqual(SAMPLE_RESULT);
      expect(notificationSpy.alert).toHaveBeenCalledWith({ header: 'Error Previewing file', message: '{}' });
    }));
  });

  describe('when testing back()', () => {
    const SAMPLE_NOTIFICATION = true;

    beforeEach(() => {
      notificationSpy.alert.and.returnValue(Promise.resolve(SAMPLE_NOTIFICATION));
    });

    it('should navigate to activity page #1', fakeAsync(() => {
      routerSpy.navigate.and.returnValue(Promise.resolve(SAMPLE_NOTIFICATION));
      utilsSpy.isMobile.and.returnValue(false);
      component.btnToggleTopicIsDone = true;
      component.activityId = 1;
      let result;
      component.back().then((res) => {
        result = res;
      });
      flushMicrotasks();
      expect(result).toEqual(SAMPLE_NOTIFICATION);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['app', 'activity', 1]);
    }));

    it('should navigate to activity page #2', fakeAsync(() => {
      topicSpy.updateTopicProgress = jasmine.createSpy('updateTopicProgress').and.returnValue(of(''));
      component['_markAsStartStop'] = jasmine.createSpy('_markAsStartStop');
      component.btnToggleTopicIsDone = false;
      component.askForMarkAsDone = true;
      component.activityId = 1;
      fixture.detectChanges();

      let result;
      component.back().then(res => {
        console.log('#nativegate2-result::', res);
        result = res;
      });

      flush();

      expect(component['_markAsStartStop']).toHaveBeenCalled();
      expect(result).toEqual(SAMPLE_NOTIFICATION);
      // Times:
      // 1. confirm submission
      // 2. ???
      expect(notificationSpy.alert).toHaveBeenCalledTimes(2);


      console.log('ABC::', JSON.stringify(notificationSpy.alert.calls.first()));

      let button = notificationSpy.alert.calls.first().args[0].buttons[0];
      (typeof button == 'string') ? button : button.handler(true);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['app', 'activity', 1]);

      button = notificationSpy.alert.calls.first().args[0].buttons[1];
      (typeof button == 'string') ? button : button.handler(true);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['app', 'activity', 1]);

      topicSpy.updateTopicProgress.and.returnValue(throwError(''));
      button = notificationSpy.alert.calls.first().args[0].buttons[1];
      (typeof button == 'string') ? button : button.handler(true);

      expect(newRelicSpy.noticeError).toHaveBeenCalledTimes(4);
    }));
  });
});
