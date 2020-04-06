import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';

import { MockBackend } from '@angular/http/testing';

import {
  HttpTestingController,
  HttpClientTestingModule
} from '@angular/common/http/testing';
import { FilestackService } from './filestack.service';
import { NotificationService } from '@shared/notification/notification.service';
import { BrowserStorageService } from '@services/storage.service';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageServiceMock } from '@testing/mocked.service';
import { environment } from '@environments/environment';
import { ModalController, IonicModule } from '@ionic/angular';
import * as filestack from 'filestack-js';

describe('FilestackService', () => {
  let service: FilestackService;
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;
  let utils: UtilsService;
  let mockBackend: HttpTestingController;
  let modalctrlSpy: jasmine.SpyObj<ModalController>;

  beforeEach(() => {
    TestBed.configureTestingModule({
        imports: [ HttpClientTestingModule, IonicModule ],
        providers: [
          FilestackService,
          UtilsService,
          ModalController,
          {
            provide: BrowserStorageService,
            useClass: BrowserStorageServiceMock
          },
          {
            provide: NotificationService,
            useValue: jasmine.createSpyObj('NotificationService', ['modal', 'alert'])
          },
        ]
    });
    service = TestBed.inject(FilestackService);
    utils = TestBed.inject(UtilsService);
    notificationSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    mockBackend = TestBed.inject(HttpTestingController);
    modalctrlSpy = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getFileTypes', () => {
    it('should return mimetype wildcard based on provided type', () => {
      const anyType = service.getFileTypes();
      const imageType = service.getFileTypes('image');
      const videoType = service.getFileTypes('video');

      expect(anyType).toEqual('');
      expect(imageType).toEqual('image/*');
      expect(videoType).toEqual('video/*');
    });
  });

  describe('getS3Config()', () => {
    it('should get config value from environment variable', () => {
      const userHash = 'testUserHash';
      storageSpy.getUser.and.returnValue({
        userHash
      });

      const location = 'test';
      const container = 'test';
      const region = 'test';
      const workflows = ['test', 'test2'];
      const paths = {
        test: 'test-type',
        any: 'test'
      };

      const testConfig = {
        location,
        container,
        region,
        workflows,
        paths,
      };

      environment.filestack.s3Config = Object.assign(environment.filestack.s3Config, testConfig);

      const result = service.getS3Config('test');

      expect(storageSpy.getUser).toHaveBeenCalled();
      expect(result).toEqual({
        location,
        container,
        region,
        path: `${paths.test}${userHash}/`,
        workflows,
      });
    });
  });

  describe('previewFile()', () => {
    beforeEach(() => {
      spyOn(service, 'previewModal').and.returnValue(Promise.resolve(true));
    });

    afterEach(() => {
      expect(service.metadata).toHaveBeenCalled();
    });

    it('should popup file preview', fakeAsync(() => {
      spyOn(service, 'metadata').and.returnValue({ mimetype: 'testing/format' });
      service.previewFile({
        handle: 'testingHandleValue'
      }).then();
      flushMicrotasks();
      expect(service.previewModal).toHaveBeenCalled();
    }));

    it('should popup file preview (support older URL format)', fakeAsync(() => {
      spyOn(service, 'metadata').and.returnValue({ mimetype: 'testing/format' });
      service.previewFile({
        url: 'www.filepicker.io/api/file',
        handle: 'testingHandleValue'
      }).then();
      flushMicrotasks();
      expect(service.previewModal).toHaveBeenCalled();
    }));

    it('should popup file preview (support older URL format 2)', fakeAsync(() => {
      spyOn(service, 'metadata').and.returnValue({ mimetype: 'testing/format' });
      service.previewFile({
        url: 'filestackcontent.com',
        handle: 'testingHandleValue'
      }).then();
      flushMicrotasks();
      expect(service.previewModal).toHaveBeenCalled();
    }));

    it('should alert instead of popup preview when file size too large', fakeAsync(() => {
      spyOn(service, 'metadata').and.returnValue({
        mimetype: 'application/testType',
        size: 11 * 1000 * 1000 // 11mb
      });

      service.previewFile({
        url: 'filestackcontent.com',
        handle: 'testingHandleValue'
      }).then();
      flushMicrotasks();

      expect(notificationSpy.alert).toHaveBeenCalled();
      expect(service.previewModal).not.toHaveBeenCalled();
    }));
  });

  describe('metadata()', () => {
    it('should get metadata from filestack', fakeAsync(() => {
      const handle = 'testingFilestackHandle';
      let result;
      service.metadata({
        url: `http://testing.com/${handle}`,
      }).then(res => result = res);

      const req = mockBackend.expectOne({
        url: `https://www.filestackapi.com/api/file/${handle}/metadata`,
        method: 'GET',
      });
      req.flush({body: true});

      mockBackend.verify();
    }));
  });

  describe('open()', () => {
    beforeEach(() => {
      spyOn(service['filestack'], 'picker').and.returnValue({
        open: () => Promise.resolve(true)
      });
      spyOn(service, 'getFileTypes');
      spyOn(service, 'getS3Config').and.returnValue(true);
    });

    it('should instantiate filestack and trigger open fileupload popup', fakeAsync(() => {
      let result;

      service.open().then(res => {
        result = res;
      });
      flushMicrotasks();

      expect(service.getFileTypes).toHaveBeenCalled();
      expect(service.getS3Config).toHaveBeenCalled();
      expect(result).toBeTruthy();
    }));

    it('should initiate picker with correct settings', fakeAsync(() => {
      let result;
      let onSuccessRes;
      let onErrorRes;

      const onSuccess = res => {
        onSuccessRes = res;
      };

      const onError = res => {
        onErrorRes = res;
      };

      service.open({
        testOnly: true,
      },
                   res => res,
                   res => res
      ).then(res => {
        result = res;
      });
      flushMicrotasks();

      expect(service['filestack'].picker).toHaveBeenCalledWith(jasmine.objectContaining({ testOnly: true }));
    }));
  });

  describe('previewModal()', () => {
    it('should pop up modal for provided filestack link', fakeAsync(() => {
      const apiRes = { passed: true };
      let result;
      spyOn(modalctrlSpy, 'create').and.returnValue({
        present: () => Promise.resolve(apiRes),
      });

      service.previewModal('test.com').then(res => {
        result = res;
      });
      flushMicrotasks();

      expect(modalctrlSpy.create).toHaveBeenCalled();
      expect(result).toEqual(apiRes);
    }));
  });

  describe('getWorkflowStatus()', () => {
    const workflowId = 'test_workflow_id';
    const policy = 'test_policy';
    const signature = 'test_signature';
    const workflows = { virusDetection : workflowId };

    beforeEach(() => {
      environment.filestack = Object.assign(environment.filestack, {
        policy,
        signature,
        workflows
      });
    });

    it('should get status of provided workflow info', fakeAsync(() => {
      // spyOn(utils, 'each');
      let result = [{body: true}];
      service.getWorkflowStatus({
        test_workflow_id: [workflows.virusDetection]
      }).then(res => {
        result = res;
      });

      const req = mockBackend.expectOne({method: 'GET'});
      req.flush(result);

      expect(req.request.url).toEqual(`https://cdn.filestackcontent.com/${environment.filestack.key}/security=p:${policy},s:${signature}/workflow_status=job_id:${workflowId}`);

      mockBackend.verify();
    }));

    it('should return empty if processedJobs is 0', fakeAsync(() => {
      let result;
      service.getWorkflowStatus().then(res => {
        result = res;
      });

      flushMicrotasks();
      expect(result).toEqual([]);
    }));
  });
});
