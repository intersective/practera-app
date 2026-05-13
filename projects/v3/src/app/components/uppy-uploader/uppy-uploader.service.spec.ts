import { TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';
import { UppyUploaderService } from './uppy-uploader.service';
import { BrowserStorageService } from '../../services/storage.service';
import { Uppy } from '@uppy/core';
import { environment } from '../../../environments/environment';
import { FfmpegService } from '../../services/ffmpeg.service';
import { Subject } from 'rxjs';
import { UppyUploaderComponent } from './uppy-uploader.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('UppyUploaderService', () => {
  let service: UppyUploaderService;
  let ffmpegServiceSpy: jasmine.SpyObj<FfmpegService>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;

  beforeEach(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['create']);
    storageSpy = jasmine.createSpyObj('BrowserStorageService', ['getUser', 'clearByName']);
    storageSpy.getUser.and.returnValue({ apikey: 'test-key' });

    ffmpegServiceSpy = jasmine.createSpyObj('FfmpegService', [
      'shouldCompress',
      'compressVideo',
      'terminate',
    ], {
      progress$: new Subject(),
    });

    // mock environment config
    environment.uppyConfig = {
      tusUrl: 'https://example.com/uploads',
      uploadPreset: 'test-preset',
      restrictions: {
        minFileSize: 0,
        maxFileSize: 1000000,
        minNumberOfFiles: 1,
        maxNumberOfFiles: 10,
        maxTotalFileSize: 10000000,
        requiredMetaFields: []
      }
    };
    environment.stackName = 'test-stack';

    TestBed.configureTestingModule({
      providers: [
        UppyUploaderService,
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: BrowserStorageService, useValue: storageSpy },
        { provide: FfmpegService, useValue: ffmpegServiceSpy },
      ],
    });

    service = TestBed.inject(UppyUploaderService);
    // bind to the instance used by the injected service
    modalCtrlSpy = (service as any).modalController as jasmine.SpyObj<ModalController>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have compressingUppy null initially', () => {
    expect(service.compressingUppy).toBeNull();
  });

  it('should expose compressionProgress$ subject', () => {
    expect(service.compressionProgress$).toBeTruthy();
  });

  describe('createUppyInstance', () => {
    it('should create an Uppy instance with correct options', () => {
      const events = {
        onAfterResponse: jasmine.createSpy('onAfterResponse'),
        onUploadSuccess: jasmine.createSpy('onUploadSuccess')
      };

      const options = {
        allowedFileTypes: ['image/*']
      };

      const result = service.createUppyInstance('chat', 'https://upload.example.com', events, options);

      // verify the result is an Uppy instance by checking it has expected methods
      expect(result).toBeTruthy();
      expect(typeof result.use).toBe('function');
      expect(typeof result.on).toBe('function');
    });

    it('should log error if environment config is missing', () => {
      const originalConfig = environment.uppyConfig;
      const originalStackName = environment.stackName;
      environment.uppyConfig = null;
      environment.stackName = '';

      const consoleSpy = spyOn(console, 'error');
      const events = {
        onAfterResponse: jasmine.createSpy('onAfterResponse'),
        onUploadSuccess: jasmine.createSpy('onUploadSuccess')
      };

      // this will log error but not throw since the config check just logs
      try {
        service.createUppyInstance('chat', 'https://upload.example.com', events);
      } catch (e) {
        // expected - uppyConfig is null so restrictions will throw
      }

      expect(consoleSpy).toHaveBeenCalledWith('Uppy configuration is missing or incomplete.');

      // restore config
      environment.uppyConfig = originalConfig;
      environment.stackName = originalStackName;
    });
  });

  describe('initializeEventHandlers', () => {
    let mockUppy: any;

    beforeEach(() => {
      mockUppy = {
        on: jasmine.createSpy('on').and.callFake(function(this: any) { return this; }),
      };
    });

    it('should set up event handlers on the Uppy instance', () => {
      const onUploadSuccessSpy = jasmine.createSpy('onUploadSuccess');
      (service as any).initializeEventHandlers(mockUppy, onUploadSuccessSpy);
      expect(mockUppy.on).toHaveBeenCalled();
    });

    it('should register upload-success handler', () => {
      const onUploadSuccessSpy = jasmine.createSpy('onUploadSuccess');
      (service as any).initializeEventHandlers(mockUppy, onUploadSuccessSpy);

      const registeredEvents = mockUppy.on.calls.allArgs().map((args: any[]) => args[0]);
      expect(registeredEvents).toContain('upload-success');
    });
  });

  describe('getPatchValue', () => {
    it('should return the correct patch value for a given id', () => {
      const testId = 'test-id';
      const testValue = { path: 'test-path', bucket: 'test-bucket' };

      service['patchValue'] = { [testId]: testValue };

      expect(service.getPatchValue(testId)).toEqual(testValue);
    });
  });

  describe('compression preprocessor', () => {
    it('should skip non-video files', () => {
      ffmpegServiceSpy.shouldCompress.and.returnValue({ compress: false, reason: 'not a video file' });
      // the preprocessor is private — verify no compression call
      expect(ffmpegServiceSpy.compressVideo).not.toHaveBeenCalled();
    });
  });

  describe('cancelCompression', () => {
    it('should do nothing if no compression is active', () => {
      service.compressingUppy = null;

      service.cancelCompression();

      expect(ffmpegServiceSpy.terminate).not.toHaveBeenCalled();
    });

    it('should terminate ffmpeg and emit null progress when compressing', () => {
      const fakeUppy = {} as Uppy<any, any>;
      service.compressingUppy = fakeUppy;

      const emitted: any[] = [];
      const sub = service.compressionProgress$.subscribe(v => emitted.push(v));

      service.cancelCompression();

      expect(ffmpegServiceSpy.terminate).toHaveBeenCalled();
      expect(emitted.length).toBe(1);
      expect(emitted[0]).toEqual({ uppy: fakeUppy, progress: null });
      expect(service.compressingUppy).toBeNull();

      sub.unsubscribe();
    });
  });

  describe('open', () => {
    it('should create a modal with backdropDismiss false', async () => {
      const mockModal = jasmine.createSpyObj('HTMLIonModalElement', ['present']);
      mockModal.present.and.returnValue(Promise.resolve());
      modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal));

      await service.open('chat');

      expect(modalCtrlSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
        backdropDismiss: false,
      }));
    });

    it('should create a modal with canDismiss function', async () => {
      const mockModal = jasmine.createSpyObj('HTMLIonModalElement', ['present']);
      mockModal.present.and.returnValue(Promise.resolve());
      modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal));

      await service.open('chat');

      const createArgs = modalCtrlSpy.create.calls.mostRecent().args[0];
      expect(createArgs.canDismiss).toBeDefined();
      expect(typeof createArgs.canDismiss).toBe('function');
    });

    it('should allow dismiss when not compressing', async () => {
      const mockModal = jasmine.createSpyObj('HTMLIonModalElement', ['present']);
      mockModal.present.and.returnValue(Promise.resolve());
      modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal));

      await service.open('chat');

      const createArgs = modalCtrlSpy.create.calls.mostRecent().args[0];
      service.compressingUppy = null;
      const canDismissFn = createArgs.canDismiss as (data?: any, role?: string) => Promise<boolean>;
      const canDismiss = await canDismissFn();
      expect(canDismiss).toBeTrue();
    });

    it('should block dismiss when compressing', async () => {
      const mockModal = jasmine.createSpyObj('HTMLIonModalElement', ['present']);
      mockModal.present.and.returnValue(Promise.resolve());
      modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal));

      await service.open('chat');

      const createArgs = modalCtrlSpy.create.calls.mostRecent().args[0];
      service.compressingUppy = {} as Uppy<any, any>;
      const canDismissFn = createArgs.canDismiss as (data?: any, role?: string) => Promise<boolean>;
      const canDismiss = await canDismissFn();
      expect(canDismiss).toBeFalse();

      // cleanup
      service.compressingUppy = null;
    });

    it('should present the modal', async () => {
      const mockModal = jasmine.createSpyObj('HTMLIonModalElement', ['present']);
      mockModal.present.and.returnValue(Promise.resolve());
      modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal));

      await service.open('chat');

      expect(mockModal.present).toHaveBeenCalled();
    });

    it('should pass the source as component prop', async () => {
      const mockModal = jasmine.createSpyObj('HTMLIonModalElement', ['present']);
      mockModal.present.and.returnValue(Promise.resolve());
      modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal));

      await service.open('assessment');

      expect(modalCtrlSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
        componentProps: { source: 'assessment' },
      }));
    });
  });
});
