import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick, inject, flushMicrotasks, flush } from '@angular/core/testing';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { TopicComponent } from './topic.component';
import { TopicService } from './topic.service';
import { FilestackService } from '@shared/filestack/filestack.service';
import { ActivatedRouteStub } from '@testingv3/activated-route-stub';
import { NotificationService } from '@shared/notification/notification.service';
import { BrowserStorageService } from '@services/storage.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { SharedService } from '@services/shared.service';
import { of, throwError } from 'rxjs';
import { MockRouter } from '@testingv3/mocked.service';
import { UtilsService } from '@app/services/utils.service';
import { TestUtils } from '@testingv3/utils';
import { ActivityService } from '@app/activity/activity.service';
import { EmbedVideoService } from '@shared/ngx-embed-video/ngx-embed-video.service';

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
  const newRelicSpy = jasmine.createSpyObj('NewRelicService', {
    'noticeError': data => {
      console.log(data);
    },
    'addPageAction': data => {
      console.log(data);
    },
    'setPageViewName': data => {
      console.log(data);
    }
  });
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [TopicComponent],
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
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when testing onEnter()', () => {
    it('should throw error to newRelic', fakeAsync(() => {
      topicSpy.getTopic = jasmine.createSpy().and.returnValue(throwError('SAMPLE_ERROR::getTopic'));
      topicSpy.getTopicProgress = jasmine.createSpy().and.returnValue(throwError('SAMPLE_ERROR::getTopicProgress'));
      fixture.detectChanges();
      component.onEnter();
      flush();
      tick(15000);
      fixture.whenStable().then(() => {
        expect(newRelicSpy.noticeError).toHaveBeenCalled();
        expect(component.askForMarkAsDone).toBeTrue();
      });
    }));

    it('should get correct data #1', fakeAsync(() => {
      const topic = {
        id: 1,
        title: 'title',
        content: 'content',
        files: [],
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
      expect(component.askForMarkAsDone).toBeTrue();
    }));

    it('should get correct data #2', fakeAsync(() => {
      const topic = {
        id: 1,
        title: 'title',
        content: 'content',
        files: [],
        videolink: 'abc',
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
      expect(component.askForMarkAsDone).toBeTrue();
    }));

    it('should get correct data #3', fakeAsync(() => {
      const topic = {
        id: 1,
        title: 'title',
        content: 'content',
        files: [],
        videolink: 'abc',
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
      expect(component.askForMarkAsDone).toBeTrue();
    }));
  });

  it('should stop playing videos when leave the page', () => {
    sharedSpy.stopPlayingVideos.and.returnValue('');
    component.ionViewWillLeave();
    expect(sharedSpy.stopPlayingVideos.calls.count()).toBe(1);
  });

  it('should mark topic as done', () => {
    const SAMPLE_ID = 12345;
    component.id = SAMPLE_ID;
    component.changeStatus.emit = jasmine.createSpy();
    topicSpy.updateTopicProgress = jasmine.createSpy('updateTopicProgress').and.returnValue(of(''));
    component.markAsDone().subscribe();

    expect(topicSpy.updateTopicProgress).toHaveBeenCalledWith(SAMPLE_ID, 'completed');
    expect(component.btnToggleTopicIsDone).toBe(true);
    expect(component.changeStatus.emit).toHaveBeenCalled();
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
      fixture.detectChanges();
      component.previewFile('').then(filestack => {
        result = filestack;
      });
      expect(component.isLoadingPreview).toBe(true);
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
      fixture.detectChanges();

      component.previewFile('').then(filestack => {
        result = filestack;
      });
      flushMicrotasks();

      expect(result).toEqual(SAMPLE_RESULT);
      expect(notificationSpy.alert).toHaveBeenCalledWith({ header: 'Error Previewing file', message: '{}' });
      expect(newRelicSpy.noticeError).toHaveBeenCalled();
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
      fixture.detectChanges();

      component.back().then((res) => {
        result = res;
      });
      flushMicrotasks();
      expect(result).toEqual(SAMPLE_NOTIFICATION);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['app', 'activity', 1]);
    }));

    it('should navigate to activity page #2', fakeAsync(() => {
      let handlers;
      notificationSpy.alert = jasmine.createSpy().and.callFake(data => {
        handlers = data;
        return Promise.resolve(SAMPLE_NOTIFICATION);
      });
      notificationSpy.presentToast = jasmine.createSpy().and.callFake(data => {
        return Promise.resolve(true);
      });
      topicSpy.updateTopicProgress = jasmine.createSpy('updateTopicProgress').and.returnValue(of(''));
      component['_markAsStartStop'] = jasmine.createSpy('_markAsStartStop');

      component.btnToggleTopicIsDone = false;
      component.askForMarkAsDone = true;
      component.activityId = 1;
      fixture.detectChanges();

      let result;
      /* component.back().then(res => {
        result = res;
      }); */

      flush();

      fixture.whenStable().then(() => {
        expect(component['_markAsStartStop']).toHaveBeenCalled();
        expect(result).toEqual(SAMPLE_NOTIFICATION);

        const first = handlers;
        first.buttons[0].handler();
        flushMicrotasks();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['app', 'activity', 1]);

        first.buttons[1].handler();
        flushMicrotasks();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['app', 'activity', 1]);
        expect(notificationSpy.presentToast).toHaveBeenCalled();

        topicSpy.updateTopicProgress.and.returnValue(throwError('SAMPLE_ERROR::back()'));
        first.buttons[1].handler();
        flushMicrotasks();
        expect(newRelicSpy.noticeError).toHaveBeenCalledWith('"SAMPLE_ERROR::back()"');
      });
    }));
  });
});
