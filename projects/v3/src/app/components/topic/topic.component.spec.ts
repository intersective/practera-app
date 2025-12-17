import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TopicComponent } from './topic.component';
import { TopicService } from '@v3/services/topic.service';
import { FilestackService } from '@v3/services/filestack.service';
import { ActivatedRouteStub } from '@testingv3/activated-route-stub';
import { NotificationsService } from '@v3/services/notifications.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { SharedService } from '@v3/services/shared.service';
import { of } from 'rxjs';
import { MockRouter } from '@testingv3/mocked.service';
import { UtilsService } from '@v3/services/utils.service';
import { TestUtils } from '@testingv3/utils';
import { ActivityService } from '@v3/services/activity.service';
import { EmbedVideoService } from '@v3/services/ngx-embed-video.service';

describe('TopicComponent', () => {
  let component: TopicComponent;
  let fixture: ComponentFixture<TopicComponent>;
  let topicSpy: jasmine.SpyObj<TopicService>;
  let filestackSpy: jasmine.SpyObj<FilestackService>;
  let embedSpy: jasmine.SpyObj<EmbedVideoService>;
  let sharedSpy: jasmine.SpyObj<SharedService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let utilsSpy: jasmine.SpyObj<UtilsService>;
  let notificationSpy: jasmine.SpyObj<NotificationsService>;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;
  let activitySpy: jasmine.SpyObj<ActivityService>;

  beforeEach(async () => {
    topicSpy = jasmine.createSpyObj('TopicService', ['getTopic', 'getTopicProgress', 'updateTopicProgress', 'clearTopic']);
    filestackSpy = jasmine.createSpyObj('FilestackService', ['previewFile']);
    embedSpy = jasmine.createSpyObj('EmbedVideoService', ['embed']);
    embedSpy.embed.and.returnValue('<iframe src="test"></iframe>'); // return valid embed html
    sharedSpy = jasmine.createSpyObj('SharedService', ['stopPlayingVideos']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    notificationSpy = jasmine.createSpyObj('NotificationsService', ['alert', 'presentToast']);
    storageSpy = jasmine.createSpyObj('BrowserStorageService', ['getUser', 'get', 'remove']);
    activitySpy = jasmine.createSpyObj('ActivityService', ['gotoNextTask']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [TopicComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: TopicService, useValue: topicSpy },
        { provide: FilestackService, useValue: filestackSpy },
        { provide: EmbedVideoService, useValue: embedSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NotificationsService, useValue: notificationSpy },
        { provide: SharedService, useValue: sharedSpy },
        { provide: BrowserStorageService, useValue: storageSpy },
        { provide: UtilsService, useClass: TestUtils },
        { provide: ActivityService, useValue: activitySpy },
        { provide: ActivatedRouteStub, useValue: new ActivatedRouteStub({ activityId: 1, id: 2 }) },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TopicComponent);
    component = fixture.componentInstance;
    utilsSpy = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;

    storageSpy.getUser.and.returnValue({ teamId: 1, projectId: 2 });
    storageSpy.get.and.returnValue({});
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call stopPlayingVideos on ionViewWillLeave', () => {
    sharedSpy.stopPlayingVideos.and.returnValue(undefined);
    component.ionViewWillLeave();
    expect(sharedSpy.stopPlayingVideos).toHaveBeenCalledTimes(1);
  });

  describe('ngOnChanges', () => {
    it('should embed video when video element found', fakeAsync(() => {
      spyOn(component['document'], 'querySelectorAll').and.returnValue([
        {
          classList: {
            add: () => true,
            remove: () => true,
            contains: jasmine.createSpy('contains').and.returnValue(true),
          },
          nodeName: 'VIDEO',
          setAttribute: jasmine.createSpy('setAttribute'),
          removeAttribute: jasmine.createSpy('removeAttribute'),
          innerHTML: '',
        }
      ] as any);

      component.topic = {
        videolink: 'test.com/vimeo',
      } as any;
      component.ngOnChanges({
        topic: {
          currentValue: component.topic,
          firstChange: true,
          previousValue: undefined,
          isFirstChange: () => true
        }
      });
      expect(component.continuing).toEqual(false);

      tick(500);

      expect(embedSpy.embed).toHaveBeenCalled();
    }));

    it('should not embed video when no video element found', fakeAsync(() => {
      spyOn(component['document'], 'querySelectorAll').and.returnValue([
        {
          classList: {
            add: () => true,
            remove: () => true,
            contains: jasmine.createSpy('contains').and.returnValue(false),
          },
          nodeName: 'NON_VIDEO',
          setAttribute: jasmine.createSpy('setAttribute'),
          removeAttribute: jasmine.createSpy('removeAttribute'),
        }
      ] as any);

      component.topic = {
        videolink: 'test.com',
      } as any;
      component.ngOnChanges({
        topic: {
          currentValue: component.topic,
          firstChange: true,
          previousValue: undefined,
          isFirstChange: () => true
        }
      });
      expect(component.continuing).toEqual(false);

      tick(500);

      expect(embedSpy.embed).not.toHaveBeenCalled();
    }));
  });

  describe('previewFile', () => {
    it('should load file successfully', fakeAsync(() => {
      const SAMPLE_RESULT = 'SAMPLE';
      let result: any;
      filestackSpy.previewFile.and.returnValue(Promise.resolve(SAMPLE_RESULT));
      component.isLoadingPreview = false;

      component.previewFile('').then(res => result = res);
      expect(component.isLoadingPreview).toBe(true);

      flushMicrotasks();
      expect(result).toBe(SAMPLE_RESULT);
      expect(component.isLoadingPreview).toBe(false);
    }));

    it('should handle preview file failure', fakeAsync(() => {
      const SAMPLE_RESULT = 'FAILED_SAMPLE';
      let result: any;
      notificationSpy.alert.and.returnValue(Promise.resolve(SAMPLE_RESULT as any));
      filestackSpy.previewFile.and.rejectWith(new Error('File preview test error'));
      component.isLoadingPreview = false;

      component.previewFile('').then(res => result = res);
      flushMicrotasks();

      expect(result).toBe(SAMPLE_RESULT);
      expect(notificationSpy.alert).toHaveBeenCalledWith({ header: 'Error Previewing file', message: '{}' });
    }));
  });

  describe('actionBtnClick', () => {
    it('should call downloadFile when index 0', () => {
      component.actionBtnClick({} as any, 0);
      expect(utilsSpy.downloadFile).toHaveBeenCalled();
    });

    it('should call previewFile when index 1', () => {
      spyOn(component, 'previewFile');
      component.actionBtnClick({} as any, 1);
      expect(component.previewFile).toHaveBeenCalled();
    });
  });
});
