import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick, inject, flushMicrotasks, flush, waitForAsync } from '@angular/core/testing';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { TopicComponent } from './topic.component';
import { TopicService } from '@v3/services/topic.service';
import { FilestackService } from '@v3/services/filestack.service';
import { ActivatedRouteStub } from '@testingv3/activated-route-stub';
import { NotificationsService } from '@v3/services/notifications.service';
import { BrowserStorageService } from '@v3/services/storage.service';
// import { NewRelicService } from '@v3/services/new-relic.service';
import { SharedService } from '@v3/services/shared.service';
import { of, throwError } from 'rxjs';
import { MockRouter } from '@testingv3/mocked.service';
import { UtilsService } from '@v3/services/utils.service';
import { TestUtils } from '@testingv3/utils';
import { ActivityService } from '@v3/services/activity.service';
import { EmbedVideoService } from '@v3/services/ngx-embed-video.service';
import * as Plyr from 'plyr';


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
  /* const newRelicSpy = jasmine.createSpyObj('NewRelicService', {
    'noticeError': data => {
      console.log(data);
    },
    'addPageAction': data => {
      console.log(data);
    },
    'setPageViewName': data => {
      console.log(data);
    }
  }); */
  const sharedSpy = jasmine.createSpyObj('SharedService', ['stopPlayingVideos']);
  const activitySpy = jasmine.createSpyObj('ActivityService', {
    'gotoNextTask': new Promise(() => { })
  });
  let routerSpy: jasmine.SpyObj<Router>;
  let utilsSpy: jasmine.SpyObj<UtilsService>;
  const routeStub = new ActivatedRouteStub({ activityId: 1, id: 2 });
  const notificationSpy = jasmine.createSpyObj('NotificationsService', {
    'alert': data => Promise.resolve(data),
    'presentToast': data => Promise.resolve(data),
  });
  const storageSpy = jasmine.createSpyObj('BrowserStorageService', ['getUser', 'get', 'remove']);

  beforeEach(waitForAsync(() => {
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
          useValue: ActivatedRouteStub
        },
        {
          provide: NotificationsService,
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
        /* {
          provide: NewRelicService,
          useValue: newRelicSpy
        }, */
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

  it('should stop playing videos when leave the page', () => {
    sharedSpy.stopPlayingVideos.and.returnValue('');
    component.ionViewWillLeave();
    expect(sharedSpy.stopPlayingVideos.calls.count()).toBe(1);
  });

  describe('ngOnChanges()', () => {
    it('should set video element when available', fakeAsync(() => {
      /* utilsSpy.each = jasmine.createSpy('each').and.callFake((target, cb) => {
        cb();
      }); */
      const spyContains = jasmine.createSpy('contains');
      spyOn(component['document'], 'querySelectorAll').and.returnValue([
        {
          classList: {
            add: () => true,
            remove: () => true,
            contains: spyContains,
          },
          nodeName: 'VIDEO',
        }
      ] as any);

      component.topic = {
        videolink: 'test.com/vimeo',
      } as any;
      component.ngOnChanges();
      expect(component.continuing).toEqual(false);

      tick(500);

      expect(spyContains).toHaveBeenCalledTimes(1);
      expect(embedSpy.embed).toHaveBeenCalled();
    }));

    it('should not set video element', fakeAsync(() => {
      /* utilsSpy.each = jasmine.createSpy('each').and.callFake((target, cb) => {
        cb();
      }); */
      const spyContains = jasmine.createSpy('contains');
      spyOn(component['document'], 'querySelectorAll').and.returnValue([
        {
          classList: {
            add: () => true,
            remove: () => true,
            contains: spyContains,
          },
          nodeName: 'NON_VIDEO',
        }
      ] as any);

      component.topic = {
        videolink: 'test.com',
      } as any;
      component.ngOnChanges();
      expect(component.continuing).toEqual(false);

      tick(500);

      expect(spyContains).not.toHaveBeenCalled();
    }));
  });

  describe('actionBarContinue()', () => {
    const dummyTOPIC = {};
    beforeEach(() => {
      jasmine.createSpyObj('component.continue', ['emit']);
      component.actionBarContinue(dummyTOPIC);
    });

    it('should set "continuing" as true', () => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(component.continuing).toBeTruthy();
      });
    });

    it('should emit continue event', () => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(component.continue.emit).toHaveBeenCalled();
      });
    });
  });

  /* describe('when testing continue()', () => {
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
  }); */

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
      // expect(newRelicSpy.noticeError).toHaveBeenCalled();
    }));
  });

  describe('actionBtnClick()', () => {
    it('should perform action based on provided index number', () => {
      component.actionBtnClick({} as any, 0);
      expect(utilsSpy.downloadFile).toHaveBeenCalled();


      const spy = spyOn(component, 'previewFile');
      component.actionBtnClick({} as any, 1);
      expect(spy).toHaveBeenCalled();
    });
  });
});
