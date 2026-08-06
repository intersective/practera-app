import { ChangeDetectorRef } from '@angular/core';
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
  let changeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;

  beforeEach(() => {
    notificationsService = jasmine.createSpyObj<NotificationsService>('NotificationsService', ['alert']);
    modalController = jasmine.createSpyObj<ModalController>('ModalController', ['dismiss']);
    storageService = jasmine.createSpyObj<BrowserStorageService>('BrowserStorageService', ['clearByName']);
    changeDetectorRef = jasmine.createSpyObj<ChangeDetectorRef>('ChangeDetectorRef', ['markForCheck']);
    uppyUploaderService = jasmine.createSpyObj<UppyUploaderService>(
      'UppyUploaderService',
      ['createUppyInstance', 'parseTusUploadResponse'],
      { uppyProps: {} as any }
    );

    component = new UppyUploaderComponent(
      notificationsService,
      modalController,
      storageService,
      uppyUploaderService,
      changeDetectorRef
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
