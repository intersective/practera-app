import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@v3/services/auth.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { of, Subject, throwError } from 'rxjs';
import { NotificationsService } from '@v3/services/notifications.service';
import { SettingsPage } from './settings.page';
import { ModalController } from '@ionic/angular';
import { UppyUploaderService } from '../../components/uppy-uploader/uppy-uploader.service';
import { SupportPopupComponent } from '../../components/support-popup/support-popup.component';

describe('SettingsPage', () => {
  let component: SettingsPage;
  let routerSpy: jasmine.SpyObj<Router>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;
  let utilsSpy: jasmine.SpyObj<UtilsService>;
  let notificationsServiceSpy: jasmine.SpyObj<NotificationsService>;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;
  let uppyUploaderServiceSpy: jasmine.SpyObj<UppyUploaderService>;
  let queryParams$: Subject<any>;

  const createComponent = () => {
    queryParams$ = new Subject<any>();

    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getMyInfo', 'logout', 'updateUserProfile']);
    storageSpy = jasmine.createSpyObj<BrowserStorageService>('BrowserStorageService', ['getUser', 'get', 'setUser']);
    utilsSpy = jasmine.createSpyObj<UtilsService>('UtilsService', [
      'setPageTitle',
      'getEvent',
      'checkIsPracteraSupportEmail',
      'isMobile',
      'redirectToUrl',
      'isEmpty',
      'openUrl',
      'getSupportEmail'
    ]);
    notificationsServiceSpy = jasmine.createSpyObj<NotificationsService>('NotificationsService', ['alert', 'modal', 'dismiss']);
    modalControllerSpy = jasmine.createSpyObj<ModalController>('ModalController', ['create', 'dismiss', 'getTop']);
    uppyUploaderServiceSpy = jasmine.createSpyObj<UppyUploaderService>('UppyUploaderService', ['open']);

    authSpy.getMyInfo.and.returnValue(of({
      data: {
        user: {
          id: 1,
          uuid: 'uuid',
          name: 'User',
          firstName: 'First',
          lastName: 'Last',
          email: 'user@example.com',
          image: '',
          role: 'participant',
          contactNumber: '+61',
          userHash: 'hash',
        }
      }
    } as any));
    authSpy.logout.and.returnValue(Promise.resolve() as any);
    authSpy.updateUserProfile.and.returnValue(of({}) as any);

    storageSpy.getUser.and.returnValue({
      email: 'user@example.com',
      contactNumber: '+61',
      avatar: '',
      name: 'User',
      programName: 'Program',
      LtiReturnUrl: '',
      programImage: 'program.png',
      apikey: 'key-1',
    } as any);
    storageSpy.get.withArgs('experience').and.returnValue({ supportEmail: 'support@practera.com' } as any);
    storageSpy.get.withArgs('programs').and.returnValue([1, 2] as any);

    utilsSpy.getEvent.and.returnValue(of(false) as any);
    utilsSpy.checkIsPracteraSupportEmail.and.returnValue(true);
    utilsSpy.isEmpty.and.callFake((value) => value === null || value === undefined || value === '');

    const documentMock = {
      defaultView: {
        history: {
          back: jasmine.createSpy('back'),
        }
      }
    } as any;

    component = new SettingsPage(
      routerSpy,
      { queryParams: queryParams$.asObservable() } as ActivatedRoute,
      authSpy,
      storageSpy,
      utilsSpy,
      notificationsServiceSpy,
      modalControllerSpy,
      uppyUploaderServiceSpy,
      documentMock
    );
  };

  beforeEach(() => {
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should ignore openLink for unsupported keyboard key', () => {
    spyOn(window, 'open');

    component.openLink(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(window.open).not.toHaveBeenCalled();
  });

  it('should open terms link for Enter key', () => {
    spyOn(window, 'open');

    component.openLink(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(window.open).toHaveBeenCalledWith(component.termsUrl, '_system');
  });

  it('should ignore switchProgram for unsupported keyboard key', () => {
    component.switchProgram(new KeyboardEvent('keydown', { key: 'a' }));

    expect(utilsSpy.redirectToUrl).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to LTI URL when returnLtiUrl is set', () => {
    component.returnLtiUrl = 'https://example.com/lti';

    component.switchProgram(new Event('click'));

    expect(utilsSpy.redirectToUrl).toHaveBeenCalledWith('https://example.com/lti');
  });

  it('should navigate to switcher when returnLtiUrl is not set', () => {
    component.returnLtiUrl = '';

    component.switchProgram(new Event('click'));

    expect(routerSpy.navigate).toHaveBeenCalledWith(['switcher', 'switcher-program']);
  });

  it('should return true when user is in multiple programs', () => {
    storageSpy.get.withArgs('programs').and.returnValue([1, 2]);

    expect(component.isInMultiplePrograms()).toBeTrue();
  });

  it('should use experience support email when non-practera and non-empty', () => {
    spyOn(window, 'open');
    storageSpy.get.withArgs('experience').and.returnValue({ supportEmail: 'help@client.com' } as any);
    utilsSpy.getSupportEmail.and.returnValue('help@client.com');
    utilsSpy.checkIsPracteraSupportEmail.and.returnValue(false);
    utilsSpy.isEmpty.and.returnValue(false);

    component.mailTo(new Event('click'));

    expect(window.open).toHaveBeenCalledWith('mailto:help@client.com?subject=', '_self');
  });

  it('should fallback to helpline email when support email is practera/empty', () => {
    spyOn(window, 'open');
    storageSpy.get.withArgs('experience').and.returnValue({ supportEmail: 'support@practera.com' } as any);
    utilsSpy.getSupportEmail.and.returnValue('support@practera.com');
    utilsSpy.checkIsPracteraSupportEmail.and.returnValue(true);

    component.mailTo(new Event('click'));

    expect(window.open).toHaveBeenCalled();
  });

  it('should ignore logout for unsupported keyboard key', () => {
    component.logout(new KeyboardEvent('keydown', { key: 'a' }));

    expect(authSpy.logout).not.toHaveBeenCalled();
  });

  it('should dismiss and logout on valid logout action', async () => {
    await component.logout(new Event('click'));

    expect(modalControllerSpy.dismiss).toHaveBeenCalled();
    expect(authSpy.logout).toHaveBeenCalled();
  });

  it('should ignore support popup for unsupported keyboard key', async () => {
    await component.openSupportPopup(new KeyboardEvent('keydown', { key: 'a' }));

    expect(modalControllerSpy.create).not.toHaveBeenCalled();
  });

  it('should open support modal when hubspot is activated', async () => {
    const modal = { present: jasmine.createSpy('present').and.returnValue(Promise.resolve()) };
    modalControllerSpy.create.and.returnValue(Promise.resolve(modal as any));
    component.hubspotActivated = true;

    await component.openSupportPopup(new Event('click'));

    expect(modalControllerSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      component: SupportPopupComponent,
      cssClass: 'support-popup',
      backdropDismiss: false,
    }));
    expect(modal.present).toHaveBeenCalled();
  });

  it('should fallback to mailTo when hubspot is not activated', async () => {
    spyOn(component, 'mailTo');
    component.hubspotActivated = false;

    await component.openSupportPopup(new Event('click'));

    expect(component.mailTo).toHaveBeenCalled();
  });

  it('should return early in profileImage when modal dismiss has no data', async () => {
    uppyUploaderServiceSpy.open.and.returnValue(Promise.resolve({
      onDidDismiss: () => Promise.resolve({ data: null })
    } as any));

    await component.profileImage();

    expect(authSpy.updateUserProfile).not.toHaveBeenCalled();
  });

  it('should update profile image and notify on success', async () => {
    const uploaded = {
      tus: { uploadUrl: 'https://upload' },
      name: 'profile.png',
      extension: 'png',
      type: 'image/png',
      size: 10,
      bucket: 'bucket',
      path: '/uploads/profile',
      preview: 'https://cdn/profile.png',
    };
    uppyUploaderServiceSpy.open.and.returnValue(Promise.resolve({
      onDidDismiss: () => Promise.resolve({ data: uploaded })
    } as any));

    await component.profileImage();

    expect(authSpy.updateUserProfile).toHaveBeenCalled();
    expect(component.profile.avatar).toBe('https://cdn/profile.png');
    expect(storageSpy.setUser).toHaveBeenCalledWith({ image: 'https://cdn/profile.png' });
    expect(notificationsServiceSpy.alert).toHaveBeenCalled();
  });

  it('should show upload error subHeader when server returns message', async () => {
    uppyUploaderServiceSpy.open.and.returnValue(Promise.resolve({
      onDidDismiss: () => Promise.resolve({ data: { tus: { uploadUrl: 'u' } } })
    } as any));
    authSpy.updateUserProfile.and.returnValue(throwError(() => ({ error: { message: 'Upload denied' } })) as any);

    await component.profileImage();

    expect(notificationsServiceSpy.alert).toHaveBeenCalled();
    const alertArgs = notificationsServiceSpy.alert.calls.mostRecent().args[0];
    expect(alertArgs.subHeader).toBe('Upload denied');
    expect(component.imageUpdating).toBeFalse();
  });

  it('should go back using window history', () => {
    component.goBack();

    expect((component.window.history.back as any)).toHaveBeenCalled();
  });

  describe('openBadgeApp()', () => {
    it('navigates to badges-certificates on click', () => {
      component.openBadgeApp(new Event('click'));

      expect(routerSpy.navigate).toHaveBeenCalledWith(['v3', 'badges-certificates']);
    });

    it('navigates on Enter key', () => {
      component.openBadgeApp(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(routerSpy.navigate).toHaveBeenCalledWith(['v3', 'badges-certificates']);
    });

    it('navigates on Space key', () => {
      component.openBadgeApp(new KeyboardEvent('keydown', { key: ' ' }));

      expect(routerSpy.navigate).toHaveBeenCalledWith(['v3', 'badges-certificates']);
    });

    it('does nothing for other keyboard keys', () => {
      routerSpy.navigate.calls.reset();
      component.openBadgeApp(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  it('should handle retrieve user info failure with alert', async () => {
    authSpy.getMyInfo.and.returnValue(throwError(() => new Error('network')) as any);

    await (component as any)._retrieveUserInfo();

    expect(notificationsServiceSpy.alert).toHaveBeenCalled();
  });

  it('should initialize and trigger support email check on ngOnInit', () => {
    component.ngOnInit();

    expect(utilsSpy.setPageTitle).toHaveBeenCalledWith('Settings - Practera');
    expect(utilsSpy.checkIsPracteraSupportEmail).toHaveBeenCalled();
  });

  it('should complete unsubscribe subject on destroy', () => {
    const nextSpy = spyOn(component.unsubscribe$, 'next');
    const completeSpy = spyOn(component.unsubscribe$, 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
