import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TopicComponent } from './topic.component';
import { TopicService } from '@v3/services/topic.service';
import { FilePreviewService } from '@v3/services/file-preview.service';
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
import { ModalController } from '@ionic/angular';

describe('TopicComponent', () => {
  let component: TopicComponent;
  let fixture: ComponentFixture<TopicComponent>;
  let topicSpy: jasmine.SpyObj<TopicService>;
  let filePreviewSpy: jasmine.SpyObj<FilePreviewService>;
  let embedSpy: jasmine.SpyObj<EmbedVideoService>;
  let sharedSpy: jasmine.SpyObj<SharedService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let utilsSpy: jasmine.SpyObj<UtilsService>;
  let notificationSpy: jasmine.SpyObj<NotificationsService>;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;
  let activitySpy: jasmine.SpyObj<ActivityService>;

  beforeEach(async () => {
    topicSpy = jasmine.createSpyObj('TopicService', ['getTopic', 'getTopicProgress', 'updateTopicProgress', 'clearTopic']);
    filePreviewSpy = jasmine.createSpyObj('FilePreviewService', ['preview']);
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
        { provide: FilePreviewService, useValue: filePreviewSpy },
        { provide: EmbedVideoService, useValue: embedSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NotificationsService, useValue: notificationSpy },
        { provide: SharedService, useValue: sharedSpy },
        { provide: BrowserStorageService, useValue: storageSpy },
        { provide: UtilsService, useClass: TestUtils },
        { provide: ActivityService, useValue: activitySpy },
        { provide: ActivatedRouteStub, useValue: new ActivatedRouteStub({ activityId: 1, id: 2 }) },
        { provide: ModalController, useValue: jasmine.createSpyObj('ModalController', ['create', 'dismiss']) },
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
      const originalQSA = component['document'].querySelectorAll.bind(component['document']);
      spyOn(component['document'], 'querySelectorAll').and.callFake((selector: string) => {
        if (selector === 'audio' || selector === 'video' || selector === '.plyr__video-embed') {
          return [] as any;
        }
        if (selector === '.video-embed') {
          return [{
            classList: {
              add: () => true,
              remove: () => true,
              contains: jasmine.createSpy('contains').and.returnValue(true),
            },
            nodeName: 'VIDEO',
            setAttribute: jasmine.createSpy('setAttribute'),
            removeAttribute: jasmine.createSpy('removeAttribute'),
            innerHTML: '',
          }] as any;
        }
        return originalQSA(selector);
      });

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
      const originalQSA = component['document'].querySelectorAll.bind(component['document']);
      spyOn(component['document'], 'querySelectorAll').and.callFake((selector: string) => {
        if (selector === 'audio' || selector === 'video' || selector === '.plyr__video-embed') {
          return [] as any;
        }
        if (selector === '.video-embed') {
          return [{
            classList: {
              add: () => true,
              remove: () => true,
              contains: jasmine.createSpy('contains').and.returnValue(false),
            },
            nodeName: 'NON_VIDEO',
            setAttribute: jasmine.createSpy('setAttribute'),
            removeAttribute: jasmine.createSpy('removeAttribute'),
          }] as any;
        }
        return originalQSA(selector);
      });

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
      filePreviewSpy.preview.and.returnValue(Promise.resolve(SAMPLE_RESULT));
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
      filePreviewSpy.preview.and.rejectWith(new Error('File preview test error'));
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

    it('should open video modal when index 1 and file is mp4 video', () => {
      spyOn(component, 'previewVideoFile');
      const file = { url: 'https://cdn.filestackcontent.com/abc123.mp4', name: 'video.mp4' };
      component.actionBtnClick(file, 1);
      expect(component.previewVideoFile).toHaveBeenCalledWith(file);
    });

    it('should open video modal when index 1 and file is webm video', () => {
      spyOn(component, 'previewVideoFile');
      const file = { url: 'https://cdn.filestackcontent.com/abc123.webm', name: 'video.webm' };
      component.actionBtnClick(file, 1);
      expect(component.previewVideoFile).toHaveBeenCalledWith(file);
    });

    it('should open video modal when index 1 and file is ogg video', () => {
      spyOn(component, 'previewVideoFile');
      const file = { url: 'https://cdn.filestackcontent.com/abc123.ogg', name: 'video.ogg' };
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

    it('should return both download and search icons for webm video', () => {
      const file = { url: 'https://example.com/video.webm', name: 'video.webm' };
      const icons = component.getFileActionIcons(file);
      expect(icons).toEqual(['download', 'search']);
    });

    it('should return both download and search icons for ogg video', () => {
      const file = { url: 'https://example.com/video.ogg', name: 'video.ogg' };
      const icons = component.getFileActionIcons(file);
      expect(icons).toEqual(['download', 'search']);
    });

    it('should return only download icon for unsupported video formats', () => {
      const formats = [
        { url: 'https://example.com/video.mov', name: 'video.mov' },
        { url: 'https://cdn.filestackcontent.com/abc123', name: 'file_example_AVI_640_800kB.avi' },
        { url: 'https://cdn.filestackcontent.com/abc123.wmv', name: 'video.wmv' },
        { url: 'https://example.com/video.mkv', name: 'video.mkv' },
      ];
      for (const file of formats) {
        const icons = component.getFileActionIcons(file);
        expect(icons).withContext(file.name).toEqual(['download']);
      }
    });
  });

  describe('previewVideoFile', () => {
    it('should open video modal with mp4 mime type', async () => {
      const modalSpy = jasmine.createSpyObj('Modal', ['present']);
      (component['modalController'].create as jasmine.Spy).and.returnValue(Promise.resolve(modalSpy));

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

    it('should open video modal with webm mime type', async () => {
      const modalSpy = jasmine.createSpyObj('Modal', ['present']);
      (component['modalController'].create as jasmine.Spy).and.returnValue(Promise.resolve(modalSpy));

      const file = { url: 'https://example.com/video.webm', name: 'test.webm' };
      await component.previewVideoFile(file);

      expect(component['modalController'].create).toHaveBeenCalledWith({
        component: jasmine.anything(),
        componentProps: {
          file: {
            url: file.url,
            name: file.name,
            type: 'video/webm',
          },
        },
      });
      expect(modalSpy.present).toHaveBeenCalled();
    });

    it('should open video modal with ogg mime type', async () => {
      const modalSpy = jasmine.createSpyObj('Modal', ['present']);
      (component['modalController'].create as jasmine.Spy).and.returnValue(Promise.resolve(modalSpy));

      const file = { url: 'https://example.com/video.ogg', name: 'test.ogg' };
      await component.previewVideoFile(file);

      expect(component['modalController'].create).toHaveBeenCalledWith({
        component: jasmine.anything(),
        componentProps: {
          file: {
            url: file.url,
            name: file.name,
            type: 'video/ogg',
          },
        },
      });
      expect(modalSpy.present).toHaveBeenCalled();
    });
  });
});
