import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';

import {
  HttpTestingController,
  HttpClientTestingModule
} from '@angular/common/http/testing';
import { FilestackService } from './filestack.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { BrowserStorageServiceMock } from '@testingv3/mocked.service';
import { environment } from '@v3/environments/environment';
import { ModalController, IonicModule } from '@ionic/angular';
import * as filestack from 'filestack-js';
import { TestUtils } from '@testingv3/utils';

describe('FilestackService', async () => {
  let service: FilestackService;
  let notificationSpy: jasmine.SpyObj<NotificationsService>;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;
  let utils: jasmine.SpyObj<UtilsService>;
  let mockBackend: HttpTestingController;
  let modalctrlSpy: jasmine.SpyObj<ModalController>;
  const MODAL_SAMPLE = 'test';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, IonicModule],
      providers: [
        FilestackService,
        {
          provide: ModalController,
          useValue: jasmine.createSpyObj('ModalController', {
            create: Promise.resolve({
              present: () => new Promise(res => {
                res(MODAL_SAMPLE);
              }),
              dismiss: () => new Promise(res => res(true)),
            })
          })
        },
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: BrowserStorageService,
          useClass: BrowserStorageServiceMock
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', [
            'modal', 'alert'
          ])
        },
      ]
    });
    service = TestBed.inject(FilestackService);
    utils = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;
    notificationSpy = TestBed.inject(NotificationsService) as jasmine.SpyObj<NotificationsService>;
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
      spyOn(service, 'previewModal').and.returnValue(Promise.resolve());
    });

    afterEach(() => {
      expect(service.metadata).toHaveBeenCalled();
    });

    it('should popup file preview', fakeAsync(() => {
      spyOn(service, 'metadata').and.returnValue(Promise.resolve({ mimetype: 'testing/format' }));
      service.previewFile({
        handle: 'testingHandleValue'
      }).then();
      flushMicrotasks();
      expect(service.previewModal).toHaveBeenCalled();
    }));

    it('should popup file preview (support older URL format)', fakeAsync(() => {
      spyOn(service, 'metadata').and.returnValue(Promise.resolve({ mimetype: 'testing/format' }));
      service.previewFile({
        url: 'www.filepicker.io/api/file',
        handle: 'testingHandleValue'
      }).then();
      flushMicrotasks();
      expect(service.previewModal).toHaveBeenCalled();
    }));

    it('should popup file preview (support older URL format 2)', fakeAsync(() => {
      spyOn(service, 'metadata').and.returnValue(Promise.resolve({ mimetype: 'testing/format' }));
      service.previewFile({
        url: 'filestackcontent.com',
        handle: 'testingHandleValue'
      }).then();
      flushMicrotasks();
      expect(service.previewModal).toHaveBeenCalled();
    }));

    it('should alert instead of popup preview when file size too large', fakeAsync(() => {
      spyOn(service, 'metadata').and.returnValue(Promise.resolve({
        mimetype: 'application/testType',
        size: 11 * 1000 * 1000 // 11mb
      }));

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
      req.flush({ body: true });

      mockBackend.verify();
    }));
  });

  describe('open()', () => {
    beforeEach(() => {
      spyOn<filestack.Client, any>(service['filestack'], 'picker').and.returnValue({
        open: () => Promise.resolve(null)
      });
      spyOn(service, 'getFileTypes');
      spyOn(service, 'getS3Config');
    });

    it('should instantiate filestack and trigger open fileupload popup', fakeAsync(() => {
      let result;

      service.open().then(res => {
        result = res;
      });
      flushMicrotasks();
      expect(service.getFileTypes).toHaveBeenCalled();
      expect(service.getS3Config).toHaveBeenCalled();
      expect(result).toBeNull();
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
      let result;
      service.previewModal('test.com').then(res => {
        result = res;
      });
      flushMicrotasks();

      expect(modalctrlSpy.create).toHaveBeenCalled();
      expect(result).toEqual(MODAL_SAMPLE);
    }));
  });

  describe('getWorkflowStatus()', () => {
    const workflowId = 'test_workflow_id';
    const policy = 'test_policy';
    const signature = 'test_signature';
    const workflows = { virusDetection: workflowId };

    beforeEach(() => {
      environment.filestack = Object.assign(environment.filestack, {
        policy,
        signature,
        workflows
      });
    });

    it('should get status of provided workflow info', fakeAsync(() => {
      // spyOn(utils, 'each');
      let result = [{ body: true }];
      service.getWorkflowStatus({
        test_workflow_id: [workflows.virusDetection]
      }).then(res => {
        result = res;
      });

      flushMicrotasks();
      const req = mockBackend.expectOne({ method: 'GET' });
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

  describe('onFileSelectedRename()', () => {
    it('should rename file with spacing', fakeAsync(() => {
      let result: any;
      const currentFile = {
        filename: 'a b c',
        handle: 'a-b-c',
        mimetype: 'mimetype',
        originalPath: 'here',
        size: 1,
        source: 'earth',
        uploadId: '12345',
        url: 'https://test.com',
      };
      service['onFileSelectedRename'](currentFile).then(res => {
        result = res.filename;
      });

      flushMicrotasks();
      expect(result).toEqual('a_b_c');
    }));
  });
});
