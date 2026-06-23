import { ComponentFixture, fakeAsync, flush, flushMicrotasks, TestBed } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { of, throwError } from 'rxjs';

import { SupportPopupComponent } from './support-popup.component';
import { HubspotService } from '@v3/services/hubspot.service';
import { UppyFileData, UppyUploaderService } from '../uppy-uploader/uppy-uploader.service';
import { UtilsService } from '@v3/services/utils.service';
import { NotificationsService } from '@v3/app/services/notifications.service';

// Mock services
class HubspotServiceMock {
  submitDataToHubspot() { return of({}); }
}

class UtilsServiceMock {
  isEmpty(value: any): boolean { return !value; }
}

class NotificationsServiceMock {
  alert() { return of({}); }
}

const createMockFile = (overrides: Partial<UppyFileData> = {}): UppyFileData => ({
  source: 'test',
  id: 'test-file-id',
  name: 'test-file',
  extension: 'jpg',
  meta: {
    relativePath: null,
    name: 'test-file',
    type: 'image/jpeg',
  },
  type: 'image/jpeg',
  data: {},
  progress: {
    uploadStarted: 0,
    uploadComplete: true,
    percentage: 100,
    bytesUploaded: 1000,
    bytesTotal: 1000,
  },
  size: 1000,
  isGhost: false,
  isRemote: false,
  preview: 'http://example.com/test.jpg',
  tus: {
    uploadUrl: 'http://example.com/uploads/test-file',
  },
  bucket: 'test-bucket',
  path: 'test-path',
  url: 'http://example.com/test.jpg',
  ...overrides,
});

describe('SupportPopupComponent', () => {
  let component: SupportPopupComponent;
  let fixture: ComponentFixture<SupportPopupComponent>;
  let modalSpy: jasmine.SpyObj<ModalController>;
  let notificationSpy: jasmine.SpyObj<NotificationsService>;
  let uppyUploaderSpy: jasmine.SpyObj<UppyUploaderService>;
  let hubspotSpy: jasmine.SpyObj<HubspotService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SupportPopupComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: HubspotService, useValue: jasmine.createSpyObj('HubspotService', ['submitDataToHubspot']) },
        { provide: UppyUploaderService, useValue: jasmine.createSpyObj('UppyUploaderService', ['open']) },
        { provide: UtilsService, useClass: UtilsServiceMock },
        { provide: NotificationsService, useClass: NotificationsServiceMock },
        { provide: ModalController, useValue: jasmine.createSpyObj('ModalController', ['dismiss', 'getTop']) },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SupportPopupComponent);
    component = fixture.componentInstance;
    modalSpy = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    notificationSpy = TestBed.inject(NotificationsService) as jasmine.SpyObj<NotificationsService>;
    uppyUploaderSpy = TestBed.inject(UppyUploaderService) as jasmine.SpyObj<UppyUploaderService>;
    hubspotSpy = TestBed.inject(HubspotService) as jasmine.SpyObj<HubspotService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isShowForm to true when isShowFormOnly is true', () => {
    component.isShowFormOnly = true;
    component.ngOnInit();
    expect(component.isShowForm).toBeTrue();
  });

  it('should toggle isShowForm when showSupportForm is called', () => {
    component.isShowForm = false;
    component.showSupportForm();
    expect(component.isShowForm).toBeTrue();
    component.showSupportForm();
    expect(component.isShowForm).toBeFalse();
  });

  describe('isPristine', () => {
    it('should return true when problemSubject, problemContent, and selectedFile are all falsy', () => {
      component.problemSubject = '';
      component.problemContent = '';
      component.selectedFile = null;

      const result = component.isPristine();

      expect(result).toBeTrue();
    });

    it('should return false when problemSubject is truthy', () => {
      component.problemSubject = 'A problem subject';
      component.problemContent = '';
      component.selectedFile = null;

      const result = component.isPristine();

      expect(result).toBeFalse();
    });

    it('should return false when problemContent is truthy', () => {
      component.problemSubject = '';
      component.problemContent = 'Some problem content';
      component.selectedFile = null;

      const result = component.isPristine();

      expect(result).toBeFalse();
    });

    it('should return false when selectedFile is truthy', () => {
      component.problemSubject = '';
      component.problemContent = '';
      component.selectedFile = createMockFile();

      const result = component.isPristine();

      expect(result).toBeFalse();
    });
  });

  describe('canDismiss', () => {
    it('should allow dismissal directly when problemSubject, problemContent, and selectedFile are all falsy', fakeAsync(() => {
      component.problemSubject = '';
      component.problemContent = '';
      component.selectedFile = null;

      component.canDismiss(modalSpy);
      flushMicrotasks();

      expect(modalSpy.dismiss).toHaveBeenCalledTimes(1);
    }));

    it('should display alert and await user confirmation when problemSubject is truthy', fakeAsync(() => {
      component.problemSubject = 'A problem subject';
      component.problemContent = '';
      component.selectedFile = null;

      const notificationsService = TestBed.inject(NotificationsService);
      let leaveBtn, cancelBtn;
      notificationSpy.alert = jasmine.createSpy('alert').and.callFake(res => {
        [cancelBtn, leaveBtn] = res.buttons;

        leaveBtn.handler();
        expect(leaveBtn.text).toEqual('Leave');
      });

      component.canDismiss(modalSpy);
      flushMicrotasks();

      expect(notificationSpy.alert).toHaveBeenCalled();
      expect(modalSpy.dismiss).toHaveBeenCalled();
    }));

    it('should display alert and await user confirmation when problemContent is truthy', fakeAsync(() => {
      component.problemSubject = '';
      component.problemContent = 'Some problem content';
      component.selectedFile = null;

      let leaveBtn, cancelBtn;
      notificationSpy.alert = jasmine.createSpy('alert').and.callFake(res => {
        [cancelBtn, leaveBtn] = res.buttons;

        cancelBtn.handler();
        expect(cancelBtn.text).toEqual('Cancel');
      });


      component.canDismiss(modalSpy);
      flushMicrotasks();

      expect(notificationSpy.alert).toHaveBeenCalled();
      expect(modalSpy.dismiss).not.toHaveBeenCalled();
    }));
  });

  describe('closePopup', () => {
    it('should call canDismiss with the current modal when closePopup is called', fakeAsync(() => {
      const fakeModal = {};
      modalSpy.getTop.and.returnValue(Promise.resolve(fakeModal) as any);

      // Spy on canDismiss to ensure it's called with the correct argument
      spyOn(component, 'canDismiss').and.callThrough();

      component.closePopup();
      flushMicrotasks();

      expect(modalSpy.getTop).toHaveBeenCalled();
      expect(component.canDismiss).toHaveBeenCalledWith(fakeModal);
    }));
  });

  describe('removeSelectedFile', () => {
    it('should clear the selected file', fakeAsync(() => {
      component.selectedFile = createMockFile();
      component.removeSelectedFile();
      flushMicrotasks();

      expect(component.selectedFile).toBeUndefined();
    }));
  });

  describe('uploadFile', () => {
    it('should open uppy uploader and set selectedFile on dismiss with data', fakeAsync(() => {
      const mockFile = createMockFile({ name: 'test.jpg' });

      uppyUploaderSpy.open.and.returnValue(Promise.resolve({
        onDidDismiss: () => Promise.resolve({ data: mockFile, role: 'confirm' }),
      } as any));

      component.uploadFile();
      flushMicrotasks();

      expect(uppyUploaderSpy.open).toHaveBeenCalledWith('any');
      expect(component.selectedFile).toEqual(mockFile);
    }));

    it('should not set selectedFile when uppy modal is dismissed without data', fakeAsync(() => {
      uppyUploaderSpy.open.and.returnValue(Promise.resolve({
        onDidDismiss: () => Promise.resolve({ data: undefined, role: 'cancel' }),
      } as any));

      component.uploadFile();
      flushMicrotasks();

      expect(uppyUploaderSpy.open).toHaveBeenCalledWith('any');
      expect(component.selectedFile).toBeUndefined();
    }));

    it('should open uppy uploader when keyboard event is Enter or Space', fakeAsync(() => {
      uppyUploaderSpy.open.and.returnValue(Promise.resolve({
        onDidDismiss: () => Promise.resolve({ data: undefined, role: 'cancel' }),
      } as any));

      const enterEvent = new KeyboardEvent('keydown', { code: 'Enter' });
      const spaceEvent = new KeyboardEvent('keydown', { code: 'Space' });

      component.uploadFile(enterEvent);
      flushMicrotasks();
      component.uploadFile(spaceEvent);
      flushMicrotasks();

      expect(uppyUploaderSpy.open).toHaveBeenCalledTimes(2);
    }));

    it('should not open uppy uploader when keyboard event is not Enter or Space', fakeAsync(() => {
      const escapeEvent = new KeyboardEvent('keydown', { code: 'Escape' });

      component.uploadFile(escapeEvent);
      flushMicrotasks();

      expect(uppyUploaderSpy.open).not.toHaveBeenCalled();
    }));
  });

  describe('submitForm()', () => {
    it('should submit form when all fields are valid', () => {
      component.problemSubject = 'Test Subject';
      component.problemContent = 'Test Content';
      component.hasConsent = true;

      hubspotSpy.submitDataToHubspot = jasmine.createSpy().and.returnValue(of(true));

      component.submitForm();

      expect(component.isShowRequiredError).toBeFalse();
      expect(hubspotSpy.submitDataToHubspot).toHaveBeenCalledWith({
        subject: 'Test Subject',
        content: 'Test Content',
        file: undefined,
        consentToProcess: true,
      });
    });

    it('should handle error when submitting form fails', () => {
      component.problemSubject = 'Test Subject';
      component.problemContent = 'Test Content';
      component.hasConsent = true;

      hubspotSpy.submitDataToHubspot = jasmine.createSpy().and.returnValue(throwError(() => 'An error occurred'));

      component.submitForm();

      expect(component.isShowRequiredError).toBeFalse();
      expect(hubspotSpy.submitDataToHubspot).toHaveBeenCalledWith({
        subject: 'Test Subject',
        content: 'Test Content',
        file: undefined,
        consentToProcess: true,
      });
      // on error, form is NOT cleared - only cleared on success
      expect(component.problemContent).toBe('Test Content');
      expect(component.problemSubject).toBe('Test Subject');
      expect(component.isShowSuccess).toBeFalse();
      expect(component.isShowError).toBeTrue();
    });
  });
});
