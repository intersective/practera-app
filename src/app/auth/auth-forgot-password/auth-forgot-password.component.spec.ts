import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthForgotPasswordComponent } from './auth-forgot-password.component';
import { AuthService } from '../auth.service';
import { Observable, of, pipe } from 'rxjs';
import { SharedModule } from '@shared/shared.module';
import { UtilsService } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';

fdescribe('AuthForgotPasswordComponent', () => {
  let component: AuthForgotPasswordComponent;
  let fixture: ComponentFixture<AuthForgotPasswordComponent>;
  let serviceSpy: jasmine.SpyObj<AuthService>;
  let utils: UtilsService;
  let notificationSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [ AuthForgotPasswordComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        UtilsService,
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj('AuthService', ['directLogin'])
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', ['presentToast', 'popUp'])
        },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthForgotPasswordComponent);
    component = fixture.componentInstance;
    serviceSpy = TestBed.get(AuthService);
    utils = TestBed.get(UtilsService);
    notificationSpy = TestBed.get(NotificationService);
  });

  describe('when testing send()', () => {

    beforeEach(() => {
      component.email = 'test@test.com'
    });

    it('should pop up toast message if email is empty', () => {
      notificationSpy.presentToast.and.returnValue(true);
      component.email = null;
      component.send();
      expect(notificationSpy.presentToast.calls.count()).toBe(1);
    });

    it('should pop up alert if direct login service throw error', () => {
      serviceSpy.forgotPassword.and.returnValue(of({}));
      component.send();
      expect(component.isSending).toBe(false);
      expect(notificationSpy.popUp.calls.count()).toBe(1);
      expect(notificationSpy.popUp.calls.first().args[1]).toEqual({email: component.email});
    });

    it('should pop up alert if direct login service throw error', () => {
      serviceSpy.forgotPassword.and.returnValue(of({}));
      component.send();
      expect(component.isSending).toBe(false);
      expect(notificationSpy.popUp.calls.count()).toBe(1);
      expect(notificationSpy.popUp.calls.first().args[1]).toEqual({email: component.email});
    });
  });
});

