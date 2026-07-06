import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ModalController, AlertController, LoadingController } from '@ionic/angular';
import { of } from 'rxjs';

import { BadgeDetailModalComponent } from './badge-detail-modal.component';
import { AchievementService } from '@v3/app/services/achievement.service';
import { UtilsService } from '@v3/services/utils.service';

const EARNED_BADGE = {
  id: 10,
  name: 'Test Badge',
  description: '<p>A badge description</p>',
  type: 'badge',
  badge: 'https://cdn/badge.png',
  openBadge: 'https://cdn/open-badge.png',
  points: 100,
  isEarned: true,
  earnedDate: '2024-01-15',
  progress: 1,
  active: true,
  certificateUrl: 'https://s3/cert.pdf',
};

const UNEARNED_BADGE = {
  ...EARNED_BADGE,
  id: 11,
  isEarned: false,
  certificateUrl: null,
  openBadge: null,
};

describe('BadgeDetailModalComponent', () => {
  let component: BadgeDetailModalComponent;
  let fixture: ComponentFixture<BadgeDetailModalComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let alertCtrlSpy: jasmine.SpyObj<AlertController>;
  let loadingCtrlSpy: jasmine.SpyObj<LoadingController>;
  let achievementSvcSpy: jasmine.SpyObj<AchievementService>;
  let utilsSpy: jasmine.SpyObj<UtilsService>;
  let httpMock: HttpTestingController;

  const loadingMock = {
    present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
    dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve()),
  };

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    alertCtrlSpy = jasmine.createSpyObj('AlertController', ['create']);
    loadingCtrlSpy = jasmine.createSpyObj('LoadingController', ['create']);
    achievementSvcSpy = jasmine.createSpyObj('AchievementService', [
      'getCertificateUrl',
      'rebadgeOpenBadge',
    ]);
    utilsSpy = jasmine.createSpyObj('UtilsService', ['isMobile']);

    loadingCtrlSpy.create.and.returnValue(Promise.resolve(loadingMock as any));

    TestBed.configureTestingModule({
      declarations: [BadgeDetailModalComponent],
      imports: [HttpClientTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: AlertController, useValue: alertCtrlSpy },
        { provide: LoadingController, useValue: loadingCtrlSpy },
        { provide: AchievementService, useValue: achievementSvcSpy },
        { provide: UtilsService, useValue: utilsSpy },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(BadgeDetailModalComponent);
    component = fixture.componentInstance;
    component.achievement = { ...EARNED_BADGE };
    fixture.detectChanges();
    // Directly replace the component's modalController with a spy to bypass any
    // DI override issues where Ionic's root provider may win over the TestBed provider.
    (component as any).modalController = modalCtrlSpy;
  }));

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('hasCertificate', () => {
    it('returns true when certificateUrl is an https URL', () => {
      component.achievement = { ...EARNED_BADGE };
      expect(component.hasCertificate).toBeTrue();
    });

    it('returns false when certificateUrl is null', () => {
      component.achievement = { ...UNEARNED_BADGE };
      expect(component.hasCertificate).toBeFalse();
    });

    it('returns false when certificateUrl is a non-https string', () => {
      component.achievement = { ...EARNED_BADGE, certificateUrl: 'http://insecure.com/cert.pdf' };
      expect(component.hasCertificate).toBeFalse();
    });
  });

  describe('hasOpenBadge', () => {
    it('returns true when openBadge is an https URL', () => {
      component.achievement = { ...EARNED_BADGE };
      expect(component.hasOpenBadge).toBeTrue();
    });

    it('returns false when openBadge is null', () => {
      component.achievement = { ...UNEARNED_BADGE };
      expect(component.hasOpenBadge).toBeFalse();
    });
  });

  describe('dismiss()', () => {
    it('dismisses the modal', () => {
      modalCtrlSpy.dismiss.and.returnValue(Promise.resolve(true));
      component.dismiss();
      expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
    });
  });

  describe('downloadCertificate()', () => {
    it('ignores unsupported keyboard keys', async () => {
      await component.downloadCertificate(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(alertCtrlSpy.create).not.toHaveBeenCalled();
    });

    it('opens an alert for Enter key', async () => {
      const alertMock = { present: jasmine.createSpy('present').and.returnValue(Promise.resolve()) };
      alertCtrlSpy.create.and.returnValue(Promise.resolve(alertMock as any));

      await component.downloadCertificate(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(alertCtrlSpy.create).toHaveBeenCalled();
      expect(alertMock.present).toHaveBeenCalled();
    });

    it('opens an alert on mouse click event', async () => {
      const alertMock = { present: jasmine.createSpy('present').and.returnValue(Promise.resolve()) };
      alertCtrlSpy.create.and.returnValue(Promise.resolve(alertMock as any));

      await component.downloadCertificate();

      expect(alertCtrlSpy.create).toHaveBeenCalledWith(
        jasmine.objectContaining({ header: jasmine.any(String) })
      );
    });

    it('alert has two buttons: download now and change name', async () => {
      const alertMock = { present: jasmine.createSpy('present').and.returnValue(Promise.resolve()) };
      alertCtrlSpy.create.and.returnValue(Promise.resolve(alertMock as any));

      await component.downloadCertificate();

      const alertOptions = alertCtrlSpy.create.calls.mostRecent().args[0];
      expect(alertOptions.buttons.length).toBe(2);
    });
  });

  describe('downloadCertificate() – "No, download now" handler', () => {
    it('opens certificateUrl directly in new tab', async () => {
      spyOn(window, 'open');
      let noHandler: Function;

      alertCtrlSpy.create.and.callFake((opts: any) => {
        noHandler = opts.buttons[0].handler;
        return Promise.resolve({ present: () => Promise.resolve() } as any);
      });

      await component.downloadCertificate();
      noHandler();

      expect(window.open).toHaveBeenCalledWith(EARNED_BADGE.certificateUrl, '_system');
    });
  });

  describe('downloadCertificate() – "Yes, change name" handler', () => {
    it('calls getCertificateUrl with name and opens returned URL', async () => {
      spyOn(window, 'open');
      achievementSvcSpy.getCertificateUrl.and.returnValue(of('https://s3/renamed.pdf'));

      let resolveInnerComplete: () => void;
      const innerComplete = new Promise<void>(res => resolveInnerComplete = res);

      let changeNameHandler: Function;
      alertCtrlSpy.create.and.callFake((opts: any) => {
        if (opts.inputs) {
          const downloadBtn = opts.buttons.find((b: any) => typeof b.handler === 'function' && !b.role);
          const capturedHandler = downloadBtn?.handler;
          return Promise.resolve({
            present: async () => {
              await capturedHandler?.({ userName: 'Jane Doe' });
              resolveInnerComplete();
            }
          } as any);
        } else {
          changeNameHandler = opts.buttons[1].handler;
          return Promise.resolve({ present: () => Promise.resolve() } as any);
        }
      });

      await component.downloadCertificate();
      changeNameHandler();
      await innerComplete;

      expect(achievementSvcSpy.getCertificateUrl).toHaveBeenCalledWith(
        EARNED_BADGE.id,
        'Jane Doe'
      );
      expect(window.open).toHaveBeenCalledWith('https://s3/renamed.pdf', '_system');
    });
  });

  describe('downloadOpenBadge()', () => {
    it('ignores unsupported keyboard keys', async () => {
      await component.downloadOpenBadge(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(alertCtrlSpy.create).not.toHaveBeenCalled();
    });

    it('opens an alert on click', async () => {
      const alertMock = { present: jasmine.createSpy('present').and.returnValue(Promise.resolve()) };
      alertCtrlSpy.create.and.returnValue(Promise.resolve(alertMock as any));

      await component.downloadOpenBadge();

      expect(alertCtrlSpy.create).toHaveBeenCalled();
    });
  });

  describe('downloadOpenBadge() – "No, download now" handler', () => {
    it('fetches the open badge blob and triggers download', fakeAsync(() => {
      let noHandler: Function;
      alertCtrlSpy.create.and.callFake((opts: any) => {
        noHandler = opts.buttons[0].handler;
        return Promise.resolve({ present: () => Promise.resolve() } as any);
      });

      component.downloadOpenBadge();
      tick();
      noHandler();

      const req = httpMock.expectOne(EARNED_BADGE.openBadge);
      expect(req.request.method).toBe('GET');

      // Simulate blob response
      const mockBlob = new Blob(['png-data'], { type: 'image/png' });
      req.flush(mockBlob);
    }));

    it('falls back to window.open when blob download request fails', fakeAsync(() => {
      spyOn(window, 'open');
      let noHandler: Function;
      alertCtrlSpy.create.and.callFake((opts: any) => {
        noHandler = opts.buttons[0].handler;
        return Promise.resolve({ present: () => Promise.resolve() } as any);
      });

      component.downloadOpenBadge();
      tick();
      noHandler();

      const req = httpMock.expectOne(EARNED_BADGE.openBadge);
      req.error(new ProgressEvent('network error'));

      expect(window.open).toHaveBeenCalledWith(EARNED_BADGE.openBadge, '_blank');
    }));
  });

  describe('downloadOpenBadge() – "Yes, change email" handler', () => {
    it('calls rebadgeOpenBadge then downloads the badge', fakeAsync(() => {
      achievementSvcSpy.rebadgeOpenBadge.and.returnValue(of({ success: true }));

      let changeEmailHandler: Function;
      alertCtrlSpy.create.and.callFake((opts: any) => {
        if (opts.inputs) {
          const downloadBtn = opts.buttons.find((b: any) => typeof b.handler === 'function' && !b.role);
          return Promise.resolve({
            present: () => {
              downloadBtn?.handler({ email: 'new@example.com' });
              return Promise.resolve();
            }
          } as any);
        } else {
          changeEmailHandler = opts.buttons[1].handler;
          return Promise.resolve({ present: () => Promise.resolve() } as any);
        }
      });

      component.downloadOpenBadge();
      tick();
      changeEmailHandler();
      tick();

      expect(achievementSvcSpy.rebadgeOpenBadge).toHaveBeenCalledWith(
        EARNED_BADGE.id,
        'new@example.com'
      );

      httpMock.expectOne(EARNED_BADGE.openBadge).flush(new Blob());
    }));
  });
});
