import { TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';
import { UppyUploaderService } from './uppy-uploader.service';
import { BrowserStorageService } from '../../services/storage.service';
import { UppyUploaderComponent } from './uppy-uploader.component';
import { Uppy, UppyFile } from '@uppy/core';
import { environment } from '../../../environments/environment';

describe('UppyUploaderService', () => {
  let service: UppyUploaderService;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;
  let storageServiceSpy: jasmine.SpyObj<BrowserStorageService>;
  let uppyInstanceSpy: jasmine.SpyObj<Uppy<any, any>>;
  let modalSpy: any;

  beforeEach(() => {
    modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present']);
    modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    modalControllerSpy.create.and.returnValue(Promise.resolve(modalSpy));

    storageServiceSpy = jasmine.createSpyObj('BrowserStorageService', ['getUser', 'clearByName']);
    storageServiceSpy.getUser.and.returnValue({ apikey: 'test-api-key' });
    storageServiceSpy.clearByName.and.returnValue(true);

    uppyInstanceSpy = jasmine.createSpyObj('Uppy', ['use', 'on']);
    uppyInstanceSpy.on.and.returnValue(uppyInstanceSpy); // To allow method chaining

    // Mock environment config
    environment.uppyConfig = {
      restrictions: {
        maxFileSize: 1000000,
        allowedFileTypes: ['image/*', 'video/*', 'application/pdf']
      }
    };
    environment.stackName = 'test-stack';

    TestBed.configureTestingModule({
      providers: [
        UppyUploaderService,
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: BrowserStorageService, useValue: storageServiceSpy }
      ]
    });

    service = TestBed.inject(UppyUploaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('open', () => {
    it('should create and present a modal with the correct component and props', async () => {
      const modal = await service.open('chat');

      expect(modalControllerSpy.create).toHaveBeenCalledWith({
        component: UppyUploaderComponent,
        componentProps: { source: 'chat' },
        cssClass: 'uppy-uploader-modal'
      });

      expect(modalSpy.present).toHaveBeenCalled();
      expect(modal).toBe(modalSpy);
    });
  });

  describe('createUppyInstance', () => {
    let uppyConstructorSpy: jasmine.Spy;
    let tusUseSpy: jasmine.Spy;

    beforeEach(() => {
      // Mock the Uppy constructor
      uppyConstructorSpy = spyOn(window as any, 'Uppy').and.returnValue(uppyInstanceSpy);

      // Mock the Tus plugin
      tusUseSpy = jasmine.createSpy('tusUse');
      spyOn(service as any, 'initializeEventHandlers');
    });

    it('should create an Uppy instance with correct options', () => {
      const events = {
        onAfterResponse: jasmine.createSpy('onAfterResponse'),
        onUploadSuccess: jasmine.createSpy('onUploadSuccess')
      };

      const options = {
        allowedFileTypes: ['image/*']
      };

      const result = service.createUppyInstance('chat', 'https://upload.example.com', events, options);

      expect(result).toBe(uppyInstanceSpy);
      expect(service['initializeEventHandlers']).toHaveBeenCalledWith(uppyInstanceSpy, events.onUploadSuccess);
    });

    it('should log error if environment config is missing', () => {
      environment.uppyConfig = null;

      const consoleSpy = spyOn(console, 'error');
      const events = {
        onAfterResponse: jasmine.createSpy('onAfterResponse'),
        onUploadSuccess: jasmine.createSpy('onUploadSuccess')
      };

      service.createUppyInstance('chat', 'https://upload.example.com', events);

      expect(consoleSpy).toHaveBeenCalledWith('Uppy configuration is missing or incomplete.');
    });
  });

  describe('initializeEventHandlers', () => {
    it('should set up event handlers on the Uppy instance', () => {
      const onUploadSuccessSpy = jasmine.createSpy('onUploadSuccess');
      const file = { id: 'file-123' } as UppyFile<any, any>;
      const response = { status: 200 };

      (service as any).initializeEventHandlers(uppyInstanceSpy, onUploadSuccessSpy);

      // Simulate upload success event
      const uploadSuccessHandler = uppyInstanceSpy.on.calls.allArgs()
        .find(args => args[0] === 'upload-success')[1];

      uploadSuccessHandler(file, response);

      expect(onUploadSuccessSpy).toHaveBeenCalledWith(file, response);
    });

    it('should clear cache when upload completes successfully', () => {
      const onUploadSuccessSpy = jasmine.createSpy('onUploadSuccess');
      const result = {
        successful: [{ id: 'file-123' }],
        failed: []
      };

      (service as any).initializeEventHandlers(uppyInstanceSpy, onUploadSuccessSpy);

      // Simulate complete event
      const completeHandler = uppyInstanceSpy.on.calls.allArgs()
        .find(args => args[0] === 'complete')[1];

      completeHandler(result);

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
});
