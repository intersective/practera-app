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

describe('FilestackService', () => {
  let service: FilestackService;
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;
  let utils: UtilsService;
  let mockBackend: HttpTestingController;

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
            useValue: jasmine.createSpyObj('NotificationService', ['modal'])
          },
        ]
    });
    service = TestBed.get(FilestackService);
    utils = TestBed.get(UtilsService);
    notificationSpy = TestBed.get(NotificationService);
    storageSpy = TestBed.get(BrowserStorageService);
    mockBackend = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
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
    it('should popup file preview', () => {

    });
  });

  describe('metadata()', () => {
    it('should get metadata from filestack', () => {

    });
  });

  describe('open()', () => {
    it('should instantiate filestack and trigger open fileupload popup', () => {

    });
  });

  describe('previewModal()', () => {
    it('should pop up modal for provided filestack link', () => {

    });
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
        console.log(res);
      });

      const req = mockBackend.expectOne({method: 'GET'});
      req.flush(result);

      expect(req.request.url).toEqual(`https://cdn.filestackcontent.com/${environment.filestack.key}/security=p:${policy},s:${signature}/workflow_status=job_id:${workflowId}`);
    }));
  });
});
