import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Uppy } from '@uppy/core';
import { ModalController } from '@ionic/angular';
import { NotificationsService } from '../../services/notifications.service';
import { BrowserStorageService } from '../../services/storage.service';
import { UppyUploaderComponent } from './uppy-uploader.component';
import { TusUploadResponse, UppyUploaderService } from './uppy-uploader.service';

describe('UppyUploaderComponent', () => {
  let component: UppyUploaderComponent;
  let notificationsService: jasmine.SpyObj<NotificationsService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let storageService: jasmine.SpyObj<BrowserStorageService>;
  let uppyUploaderService: jasmine.SpyObj<UppyUploaderService>;

  beforeEach(() => {
    notificationsService = jasmine.createSpyObj<NotificationsService>('NotificationsService', ['alert']);
    modalController = jasmine.createSpyObj<ModalController>('ModalController', ['dismiss']);
    storageService = jasmine.createSpyObj<BrowserStorageService>('BrowserStorageService', ['clearByName']);
    uppyUploaderService = jasmine.createSpyObj<UppyUploaderService>(
      'UppyUploaderService',
      ['createUppyInstance', 'parseTusUploadResponse'],
      { uppyProps: {} as any }
    );

    component = new UppyUploaderComponent(
      notificationsService,
      modalController,
      storageService,
      uppyUploaderService
    );
  });

  it('restricts user profile uploads to images', () => {
    component.source = 'user-profile';

    expect(component.loadAllowedFileTypes()).toEqual(['image/*']);
  });

  it('returns the canonical CDN URL from the TUS response', () => {
    const tusResponse: TusUploadResponse = {
      bucket: 'profile-images',
      path: '/users/profile.png',
      cdnUrl: 'https://cdn.example.com/users/profile.png',
      directUrl: 'https://files.example.com/users/profile.png',
    };
    component.s3Info = tusResponse;
    const file = {
      name: 'profile.png',
      type: 'image/png',
      size: 10,
      extension: 'png',
    } as any;

    component.closeModal(file);

    expect(modalController.dismiss).toHaveBeenCalledWith(jasmine.objectContaining({
      bucket: tusResponse.bucket,
      path: tusResponse.path,
      url: tusResponse.cdnUrl,
      cdnUrl: tusResponse.cdnUrl,
      directUrl: tusResponse.directUrl,
    }));
  });

  it('reports and rethrows an invalid TUS response', () => {
    uppyUploaderService.parseTusUploadResponse.and.throwError(
      'Upload server returned an empty response.'
    );
    const response = { getBody: () => '' };

    expect(() => component.onAfterResponse({}, response)).toThrowError(
      'Upload server returned an empty response.'
    );
    expect(notificationsService.alert).toHaveBeenCalledWith({
      header: 'Upload Failed',
      message: 'Upload server returned an empty response.',
    });
  });
});


describe('UppyUploaderComponent dashboard rendering', () => {
  let fixture: ComponentFixture<UppyUploaderComponent>;
  let uppy: Uppy<any, any>;

  beforeEach(async () => {
    uppy = new Uppy({
      autoProceed: false,
      restrictions: { allowedFileTypes: ['image/*'] },
    });
    const uploader = jasmine.createSpyObj<UppyUploaderService>(
      'UppyUploaderService', ['createUppyInstance'], { uppyProps: { ...new UppyUploaderService(null!, null!).uppyProps } }
    );
    uploader.createUppyInstance.and.returnValue(uppy);

    TestBed.configureTestingModule({
      declarations: [UppyUploaderComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    TestBed.overrideProvider(UppyUploaderService, { useValue: uploader });
    TestBed.overrideProvider(NotificationsService, {
      useValue: jasmine.createSpyObj('NotificationsService', ['alert']),
    });
    TestBed.overrideProvider(BrowserStorageService, {
      useValue: jasmine.createSpyObj('BrowserStorageService', ['clearByName']),
    });
    await TestBed.compileComponents();
    fixture = TestBed.createComponent(UppyUploaderComponent);
    fixture.componentInstance.source = 'user-profile';
    fixture.componentInstance.tusEndpoint = 'https://upload.example.test/uploads/';
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    uppy.destroy();
  });

  it('renders a usable file picker inside the upload popup', () => {
    const picker = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;

    expect(fixture.nativeElement.querySelector('.uppy-Dashboard-browse')).not.toBeNull();
    expect(picker).not.toBeNull();
    expect(picker?.accept).toBe('image/*');
  });

  it('releases selected files and the dashboard when the popup is destroyed', () => {
    uppy.addFile({ name: 'profile.png', type: 'image/png', data: new Blob(['image'], { type: 'image/png' }) });
    expect(uppy.getFiles().length).toBe(1);

    fixture.destroy();

    expect(uppy.getFiles().length).toBe(0);
    expect(uppy.getPlugin('Dashboard')).toBeUndefined();
  });
});
