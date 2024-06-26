import { ComponentFixture, fakeAsync, flush, flushMicrotasks, TestBed } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { of, throwError } from 'rxjs';

import { SupportPopupComponent } from './support-popup.component';
import { HubspotService } from '@v3/services/hubspot.service';
import { FilestackService } from '@v3/app/services/filestack.service';
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

describe('SupportPopupComponent', async () => {
  let component: SupportPopupComponent;
  let fixture: ComponentFixture<SupportPopupComponent>;
  let modalSpy: jasmine.SpyObj<ModalController>;
  let notificationSpy: jasmine.SpyObj<NotificationsService>;
  let filestackSpy: jasmine.SpyObj<FilestackService>;
  let hubspotSpy: jasmine.SpyObj<HubspotService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SupportPopupComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: HubspotService, useValue: jasmine.createSpyObj('HubspotService', ['submitDataToHubspot']) },
        { provide: FilestackService, useValue: jasmine.createSpyObj('FilestackService', ['deleteFile', 'open', 'getS3Config']) },
        { provide: UtilsService, useClass: UtilsServiceMock },
        { provide: NotificationsService, useClass: NotificationsServiceMock },
        { provide: ModalController, useValue: jasmine.createSpyObj('ModalController', ['dismiss', 'getTop']) },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SupportPopupComponent);
    component = fixture.componentInstance;
    modalSpy = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    notificationSpy = TestBed.inject(NotificationsService) as jasmine.SpyObj<NotificationsService>;
    filestackSpy = TestBed.inject(FilestackService) as jasmine.SpyObj<FilestackService>;
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
      component.selectedFile = { handle: 'abc123' };

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
    it('should remove the selected file and call deleteFile with the file handle', fakeAsync(() => {
      filestackSpy.deleteFile = jasmine.createSpy().and.returnValue(of({}));

      component.selectedFile = { handle: 'abc123' };
      component.removeSelectedFile();
      flushMicrotasks();

      expect(filestackSpy.deleteFile).toHaveBeenCalledWith('abc123');
      expect(component.selectedFile).toBeUndefined();
    }));
  });

  describe('uploadFile', () => {
    it('should call FilestackService open method and set the selectedFile on upload finished', fakeAsync(() => {
      const mockResponse = { filename: 'test.jpg', handle: 'abc123', url: 'http://example.com/test.jpg' };

      filestackSpy.open = jasmine.createSpy().and.callFake(options => {
        return options.onFileUploadFinished(mockResponse);
      });

      component.uploadFile();
      flushMicrotasks();

      expect(filestackSpy.open).toHaveBeenCalled();
      expect(component.selectedFile).toEqual(mockResponse);
    }));

    it('should handle file upload failure and not set selectedFile', fakeAsync(() => {
      filestackSpy.open = jasmine.createSpy().and.callFake(options => {
        return options.onFileUploadFailed('Error');
      });

      component.uploadFile();
      flushMicrotasks();

      expect(filestackSpy.open).toHaveBeenCalled();
      expect(component.selectedFile).toBeUndefined();
    }));

    it('should call FilestackService open method when keyboard event is Enter or Space', fakeAsync(() => {
      filestackSpy.open = jasmine.createSpy().and.callThrough();

      const enterEvent = new KeyboardEvent('keydown', { code: 'Enter' });
      const spaceEvent = new KeyboardEvent('keydown', { code: 'Space' });

      component.uploadFile(enterEvent);
      component.uploadFile(spaceEvent);
      flushMicrotasks();

      expect(filestackSpy.open).toHaveBeenCalledTimes(2);
    }));

    it('should not call FilestackService open method when keyboard event is not Enter or Space', fakeAsync(() => {
      const escapeEvent = new KeyboardEvent('keydown', { code: 'Escape' });

      component.uploadFile(escapeEvent);
      flushMicrotasks();

      expect(filestackSpy.open).not.toHaveBeenCalled();
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

      hubspotSpy.submitDataToHubspot = jasmine.createSpy().and.returnValue(throwError('An error occurred'));

      component.submitForm();

      expect(component.isShowRequiredError).toBeFalse();
      expect(hubspotSpy.submitDataToHubspot).toHaveBeenCalledWith({
        subject: 'Test Subject',
        content: 'Test Content',
        file: undefined,
        consentToProcess: true,
      });
      expect(component.selectedFile).toBeUndefined();
      expect(component.problemContent).toBe('');
      expect(component.problemSubject).toBe('');
      expect(component.isShowSuccess).toBeFalse();
      expect(component.isShowError).toBeTrue();
    });
  });
});
