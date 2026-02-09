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
    topicSpy = jasmine.createSpyObj('TopicService', ['getTopic', 'getTopicProgress', 'updateTopicProgress']);
    filestackSpy = jasmine.createSpyObj('FilestackService', ['previewFile']);
    embedSpy = jasmine.createSpyObj('EmbedVideoService', ['embed']);
    sharedSpy = jasmine.createSpyObj('SharedService', ['stopPlayingVideos']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    utilsSpy = jasmine.createSpyObj('UtilsService', ['downloadFile']);
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
        { provide: UtilsService, useValue: utilsSpy },
        { provide: ActivityService, useValue: activitySpy },
        { provide: ActivatedRouteStub, useValue: new ActivatedRouteStub({ activityId: 1, id: 2 }) },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TopicComponent);
    component = fixture.componentInstance;

    storageSpy.getUser.and.returnValue({ teamId: 1, projectId: 2 });
    storageSpy.get.and.returnValue({});
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call stopPlayingVideos on ionViewWillLeave', () => {
    sharedSpy.stopPlayingVideos.and.returnValue('');
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
        }
      ] as any);

      component.topic = { videolink: 'test.com/vimeo' } as any;
      component.ngOnChanges();
      expect(component.continuing).toBe(false);

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
        }
      ] as any);

      component.topic = { videolink: 'test.com' } as any;
      component.ngOnChanges();
      expect(component.continuing).toBe(false);

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
      notificationSpy.alert.and.returnValue(Promise.resolve(SAMPLE_RESULT));
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
      component.actionBtnClick({ url: 'https://example.com/file.pdf' } as any, 0);
      expect(utilsSpy.downloadFile).toHaveBeenCalled();
    });

    it('should call previewFile when index 1 and url is filestack with supported type', () => {
      spyOn(component, 'previewFile');
      const file = { url: 'https://cdn.filestackcontent.com/abc123', name: 'doc.pdf' };
      component.actionBtnClick(file, 1);
      expect(component.previewFile).toHaveBeenCalledWith(file);
    });

    it('should open video modal when index 1 and file is video', () => {
      spyOn(component, 'previewVideoFile');
      const file = { url: 'https://cdn.filestackcontent.com/abc123.mp4', name: 'video.mp4' };
      component.actionBtnClick(file, 1);
      expect(component.previewVideoFile).toHaveBeenCalledWith(file);
    });

    it('should open new tab when index 1 and url is filestack but file is audio', () => {
      spyOn(window, 'open');
      spyOn(component, 'previewFile');
      const file = { url: 'https://cdn.filestackcontent.com/abc123', name: 'recording.mp3' };
      component.actionBtnClick(file, 1);
      expect(component.previewFile).not.toHaveBeenCalled();
      expect(window.open).toHaveBeenCalledWith(file.url, '_blank');
    });

    it('should open new tab when index 1 and url is not filestack', () => {
      spyOn(window, 'open');
      const file = { url: 'https://example.com/document.pdf', name: 'document.pdf' };
      component.actionBtnClick(file, 1);
      expect(window.open).toHaveBeenCalledWith(file.url, '_blank');
      expect(notificationSpy.presentToast).toHaveBeenCalled();
    });

    it('should open new tab for non-filestack url even without extension', () => {
      spyOn(window, 'open');
      const file = { url: 'https://storage.example.com/files/12345', name: 'report' };
      component.actionBtnClick(file, 1);
      expect(window.open).toHaveBeenCalledWith(file.url, '_blank');
    });
  });

  describe('getFileActionIcons', () => {
    it('should return both download and search icons for filestack url with supported type', () => {
      const file = { url: 'https://cdn.filestackcontent.com/abc123', name: 'document.pdf' };
      const icons = component.getFileActionIcons(file);
      expect(icons).toEqual(['download', 'search']);
    });

    it('should return both download and search icons for video files', () => {
      const file = { url: 'https://cdn.filestackcontent.com/abc123.mp4', name: 'video.mp4' };
      const icons = component.getFileActionIcons(file);
      expect(icons).toEqual(['download', 'search']);
    });

    it('should return both download and search icons for non-filestack video', () => {
      const file = { url: 'https://example.com/video.mp4', name: 'video.mp4' };
      const icons = component.getFileActionIcons(file);
      expect(icons).toEqual(['download', 'search']);
    });

    it('should return only download icon for filestack url with audio', () => {
      const file = { url: 'https://cdn.filestackcontent.com/abc123', name: 'audio.mp3' };
      const icons = component.getFileActionIcons(file);
      expect(icons).toEqual(['download']);
    });

    it('should return only download icon for non-filestack non-video file', () => {
      const file = { url: 'https://example.com/file.pdf', name: 'document.pdf' };
      const icons = component.getFileActionIcons(file);
      expect(icons).toEqual(['download']);
    });

    it('should return only download icon for non-mp4 video files', () => {
      const file = { url: 'https://example.com/video.mov', name: 'video.mov' };
      const icons = component.getFileActionIcons(file);
      expect(icons).toEqual(['download']);
    });
  });

  describe('previewVideoFile', () => {
    it('should open video modal with file properties', async () => {
      const modalSpy = jasmine.createSpyObj('Modal', ['present']);
      spyOn(component['modalController'], 'create').and.returnValue(Promise.resolve(modalSpy));

      const file = { url: 'https://example.com/video.mp4', name: 'test.mp4' };
      await component.previewVideoFile(file);

      expect(component['modalController'].create).toHaveBeenCalledWith({
        component: jasmine.anything(),
        componentProps: {
          file: {
            url: file.url,
            name: file.name,
            type: 'video/mp4',
          },
        },
      });
      expect(modalSpy.present).toHaveBeenCalled();
    });
  });
});
