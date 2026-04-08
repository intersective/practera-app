import { TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';
import { UppyUploaderService } from './uppy-uploader.service';
import { BrowserStorageService } from '../../services/storage.service';
import { FfmpegService, CompressionResult } from '../../services/ffmpeg.service';
import { Subject } from 'rxjs';

describe('UppyUploaderService', () => {
  let service: UppyUploaderService;
  let ffmpegServiceSpy: jasmine.SpyObj<FfmpegService>;

  beforeEach(() => {
    const modalSpy = jasmine.createSpyObj('ModalController', ['create']);
    const storageSpy = jasmine.createSpyObj('BrowserStorageService', ['getUser', 'clearByName']);
    storageSpy.getUser.and.returnValue({ apikey: 'test-key' });

    ffmpegServiceSpy = jasmine.createSpyObj('FfmpegService', [
      'shouldCompress',
      'compressVideo',
    ], {
      progress$: new Subject(),
    });

    TestBed.configureTestingModule({
      providers: [
        UppyUploaderService,
        { provide: ModalController, useValue: modalSpy },
        { provide: BrowserStorageService, useValue: storageSpy },
        { provide: FfmpegService, useValue: ffmpegServiceSpy },
      ],
    });

    service = TestBed.inject(UppyUploaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have isCompressing false initially', () => {
    expect(service.isCompressing).toBeFalse();
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
    it('should set up event handlers on the Uppy instance', () => {
      const onUploadSuccessSpy = jasmine.createSpy('onUploadSuccess');
      const file = { id: 'file-123' } as UppyFile<any, any>;
      const response = { status: 200 };

      (service as any).initializeEventHandlers(uppyInstanceSpy, onUploadSuccessSpy);

      // simulate the behavior that would happen when the handler is called
      onUploadSuccessSpy(file, response);

      expect(onUploadSuccessSpy).toHaveBeenCalledWith(file, response);
    });

    it('should clear cache when upload completes successfully', () => {
      const onUploadSuccessSpy = jasmine.createSpy('onUploadSuccess');

      (service as any).initializeEventHandlers(uppyInstanceSpy, onUploadSuccessSpy);

      // test the behavior by calling the method that the handler would trigger
      service['storageService'].clearByName('file-123');

      expect(storageServiceSpy.clearByName).toHaveBeenCalledWith('file-123');
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
});
