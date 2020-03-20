import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed, fakeAsync, tick, inject } from '@angular/core/testing';
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
import { ActivityService } from '../activity/activity.service';
import { of, throwError } from 'rxjs';
import { MockRouter } from '@testing/mocked.service';

describe('TopicComponent', () => {
  let component: TopicComponent;
  let fixture: ComponentFixture<TopicComponent>;
  const topicSpy = jasmine.createSpyObj('TopicService', ['getTopic', 'getTopicProgress', 'updateTopicProgress']);
  const filestackSpy = jasmine.createSpyObj('FilestackService', ['previewFile']);
  const embedSpy = jasmine.createSpyObj('EmbedVideoService', ['embed']);
  const newRelicSpy = jasmine.createSpyObj('NewRelicService', ['noticeError', 'addPageAction', 'setPageViewName']);
  const sharedSpy = jasmine.createSpyObj('SharedService', ['stopPlayingVideos']);
  const activitySpy = jasmine.createSpyObj('ActivityService', ['gotoNextTask']);
  let routerSpy: jasmine.SpyObj<Router>;
  const routeStub = new ActivatedRouteStub({ activityId: 1, id: 2 });
  const notificationSpy = jasmine.createSpyObj('NotificationService', ['alert', 'presentToast']);
  const storageSpy = jasmine.createSpyObj('BrowserStorageService', ['getUser']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ TopicComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
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
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopicComponent);
    component = fixture.componentInstance;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    storageSpy.getUser.and.returnValue({
      teamId: 1,
      projectId: 2
    });
    activitySpy.gotoNextTask.and.returnValue(new Promise(() => {}));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when testing onEnter()', () => {
    it('should get correct data #1', () => {
      const topic = {
        id: 1,
        title: 'title',
        content: 'content',
        files: [],
        hasComments: false
      };
      topicSpy.getTopic.and.returnValue(of(topic));
      topicSpy.getTopicProgress.and.returnValue(of(1));
      fixture.detectChanges();
      component.onEnter();
      expect(component.loadingTopic).toBe(false);
      expect(component.topic).toEqual(topic);
      expect(component.topicProgress).toBe(1);
      expect(component.btnToggleTopicIsDone).toBe(true);
    });
    it('should get correct data #2', () => {
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
      expect(component.loadingTopic).toBe(false);
      expect(component.topic).toEqual(topic);
      expect(component.topicProgress).toBe(null);
      expect(component.btnToggleTopicIsDone).toBe(false);
    });
    it('should get correct data #3', () => {
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
      expect(component.loadingTopic).toBe(false);
      expect(component.topic).toEqual(topic);
      expect(component.topicProgress).toBe(0);
      expect(component.btnToggleTopicIsDone).toBe(false);
    });
    it('should throw error to newRelic', () => {
      topicSpy.getTopic.and.returnValue(throwError(''));
      topicSpy.getTopicProgress.and.returnValue(throwError(''));
      fixture.detectChanges();
      component.onEnter();
      expect(newRelicSpy.noticeError.calls.count()).toBe(2);
    });
  });
  it('should stop playing videos when leave the page', () => {
    sharedSpy.stopPlayingVideos.and.returnValue('');
    component.ionViewWillLeave();
    expect(sharedSpy.stopPlayingVideos.calls.count()).toBe(1);
  });
  it('should mark topic as done', () => {
    topicSpy.updateTopicProgress.and.returnValue(of(''));
    component.markAsDone();
    expect(topicSpy.updateTopicProgress.calls.count()).toBe(1);
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
    it('should load the file', () => {
      filestackSpy.previewFile.and.returnValue('');
      component.previewFile('');
      expect(component.isLoadingPreview).toBe(true);
      expect(filestackSpy.previewFile.calls.count()).toBe(1);
    });
    it('should load the file', () => {
      filestackSpy.previewFile.and.throwError('');
      component.isLoadingPreview = false;
      component.previewFile('');
      expect(component.isLoadingPreview).toBe(true);
    });
  });
  describe('when testing back()', () => {
    it('should navigate to activity page #1', () => {
      component.btnToggleTopicIsDone = true;
      component.activityId = 1;
      component.back();
      expect(routerSpy.navigate.calls.first().args[0]).toEqual(['app', 'activity', 1]);
    });
    it('should navigate to activity page #2', () => {
      component.btnToggleTopicIsDone = false;
      component.askForMarkAsDone = true;
      component.activityId = 1;
      component.back();
      expect(notificationSpy.alert.calls.count()).toBe(2);
      notificationSpy.alert.calls.argsFor(1)[0].buttons[0].handler();
      expect(routerSpy.navigate.calls.first().args[0]).toEqual(['app', 'activity', 1]);
      notificationSpy.presentToast.and.returnValue(Promise.resolve());
      notificationSpy.alert.calls.argsFor(1)[0].buttons[1].handler();
      expect(routerSpy.navigate.calls.first().args[0]).toEqual(['app', 'activity', 1]);
      topicSpy.updateTopicProgress.and.returnValue(throwError(''));
      notificationSpy.alert.calls.argsFor(1)[0].buttons[1].handler();
      expect(newRelicSpy.noticeError.calls.count()).toBe(4);
    });
  });
});
