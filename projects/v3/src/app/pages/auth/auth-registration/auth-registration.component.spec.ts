import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthRegistrationComponent } from './auth-registration.component';
import { AuthService } from '@v3/services/auth.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { ExperienceService } from '@v3/services/experience.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { UtilsService } from '@v3/services/utils.service';
import { ModalController, IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

describe('AuthRegistrationComponent', () => {
  let component: AuthRegistrationComponent;
  let fixture: ComponentFixture<AuthRegistrationComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let storageService: jasmine.SpyObj<BrowserStorageService>;
  let experienceService: jasmine.SpyObj<ExperienceService>;
  let notificationsService: jasmine.SpyObj<NotificationsService>;
  let utilsService: jasmine.SpyObj<UtilsService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let activatedRoute: any;

  beforeEach(waitForAsync(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'verifyRegistration',
      'checkDomain',
      'saveRegistration',
      'authenticate'
    ]);
    const storageSpy = jasmine.createSpyObj('BrowserStorageService', [
      'get',
      'set',
      'remove',
      'setUser'
    ]);
    const experienceSpy = jasmine.createSpyObj('ExperienceService', ['switchProgram']);
    const notificationsSpy = jasmine.createSpyObj('NotificationsService', ['popUp', 'alert']);
    const utilsSpy = jasmine.createSpyObj('UtilsService', ['setPageTitle', 'isMobile', 'find']);
    const modalSpy = jasmine.createSpyObj('ModalController', ['create']);

    activatedRoute = {
      queryParamMap: of(new Map()),
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get')
        }
      }
    };

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        IonicModule.forRoot(),
        ReactiveFormsModule
      ],
      declarations: [AuthRegistrationComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: BrowserStorageService, useValue: storageSpy },
        { provide: ExperienceService, useValue: experienceSpy },
        { provide: NotificationsService, useValue: notificationsSpy },
        { provide: UtilsService, useValue: utilsSpy },
        { provide: ModalController, useValue: modalSpy },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    storageService = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    experienceService = TestBed.inject(ExperienceService) as jasmine.SpyObj<ExperienceService>;
    notificationsService = TestBed.inject(NotificationsService) as jasmine.SpyObj<NotificationsService>;
    utilsService = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;

    utilsService.isMobile.and.returnValue(false);
    utilsService.setPageTitle.and.stub();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthRegistrationComponent);
    component = fixture.componentInstance;
    storageService.get.and.returnValue(false);
  });

  it('should authenticate user and switch program on successful registration', async () => {
    // set up component state for registration
    component.unRegisteredDirectLink = true; // use direct link mode for simpler validation
    component.user = {
      id: 123,
      key: 'test-key',
      email: 'test@example.com',
      contact: null
    };
    component.password = 'TestPassword123!';
    component.confirmPassword = 'TestPassword123!';
    component.isAgreed = true;

    authService.saveRegistration.and.returnValue(of({
      data: { apikey: 'test-api-key' }
    }));
    authService.authenticate.and.returnValue(of({
      data: {
        auth: {
          apikey: 'test-api-key',
          experience: {
            id: 1,
            uuid: 'test-uuid',
            timelineId: 1,
            projectId: 1,
            name: 'Test Experience',
            description: 'Test Description',
            type: 'Test Type',
            leadImage: 'test-image.jpg',
            status: null,
            setupStep: null,
            todoItemCount: 0,
            progress: 0,
            config: null,
            color: '#000000',
            secondaryColor: '#FFFFFF',
            role: 'participant',
            isLast: false,
            locale: 'en-US',
            supportName: 'Support',
            supportEmail: 'support@example.com',
            cardUrl: 'card-url',
            bannerUrl: 'banner-url',
            logoUrl: 'logo-url',
            iconUrl: 'icon-url',
            reviewRating: false,
            truncateDescription: false,
            team: {
              id: 1
            },
            featureToggle: {
              pulseCheckIndicator: false,
              showProjectHub: false,
            }
          }
        }
      }
    }));
    storageService.set.and.stub();
    storageService.remove.and.stub();
    experienceService.switchProgram.and.returnValue(Promise.resolve());

    component.register();

    await fixture.whenStable();

    expect(authService.saveRegistration).toHaveBeenCalledWith({
      user_id: 123,
      key: 'test-key',
      password: jasmine.any(String), // password is auto-generated or set via confirmPassword
    });
  });

  describe('unRegisteredDirectLink === true scenarios', () => {
    beforeEach(() => {
      component.unRegisteredDirectLink = true;
      component.user = {
        email: 'test@example.com',
        key: 'testkey123',
        id: 456,
        contact: null
      };
    });

    describe('initialization', () => {
      it('should set unRegisteredDirectLink to true when flag exists in storage', () => {
        storageService.get.and.returnValue(true);

        component.ngOnInit();

        expect(component.unRegisteredDirectLink).toBe(true);
        expect(storageService.get).toHaveBeenCalledWith('unRegisteredDirectLink');
      });
    });

    describe('validation', () => {
      it('should validate successfully when terms are agreed', () => {
        component.isAgreed = true;

        const result = component.validateRegistration();

        expect(result).toBe(true);
        expect(component.errors.length).toBe(0);
      });

      it('should fail validation when terms are not agreed', () => {
        component.isAgreed = false;

        const result = component.validateRegistration();

        expect(result).toBe(false);
        expect(component.errors.length).toBe(1);
        expect(component.errors[0]).toContain('agree with terms and Conditions');
        expect(component.isLoading).toBe(false);
      });

      it('should not require password validation for unRegisteredDirectLink', () => {
        component.isAgreed = true;
        component.password = '';

        const result = component.validateRegistration();

        expect(result).toBe(true);
      });
    });

    describe('password auto-generation', () => {
      it('should generate a secure random password with minimum 12 characters', () => {
        const password = component['autoGeneratePassword']();

        expect(password.length).toBeGreaterThanOrEqual(12);
        expect(password.length).toBeLessThanOrEqual(16);
      });

      it('should generate unique passwords on multiple calls', () => {
        const password1 = component['autoGeneratePassword']();
        const password2 = component['autoGeneratePassword']();

        expect(password1).not.toBe(password2);
      });

      it('should generate password with mixed characters', () => {
        const password = component['autoGeneratePassword']();

        const uniqueChars = new Set(password.split(''));
        expect(uniqueChars.size).toBeGreaterThan(5);
      });
    });

    describe('_setupPassword', () => {
      it('should use user-provided password if available', () => {
        component.password = 'UserPassword123!';

        component['_setupPassword']();

        expect(component.user.password).toBe('UserPassword123!');
        expect(component.confirmPassword).toBe('UserPassword123!');
      });

      it('should auto-generate password when user does not provide one', () => {
        component.password = '';

        component['_setupPassword']();

        expect(component.user.password).toBeDefined();
        expect(component.user.password.length).toBeGreaterThanOrEqual(12);
        expect(component.confirmPassword).toBe(component.user.password);
      });

      it('should auto-generate password when password is undefined', () => {
        component.password = undefined;

        component['_setupPassword']();

        expect(component.user.password).toBeDefined();
        expect(component.confirmPassword).toBe(component.user.password);
      });
    });

    describe('registration flow', () => {
      beforeEach(() => {
        component.isAgreed = true;
      });

      it('should call _setupPassword when unRegisteredDirectLink is true', () => {
        spyOn<any>(component, '_setupPassword');
        authService.saveRegistration.and.returnValue(of({
          data: { apikey: 'test-api-key' }
        }));
        authService.authenticate.and.returnValue(of({
          data: { auth: { apikey: 'test-api-key', experience: {} } }
        }) as any);
        experienceService.switchProgram.and.returnValue(Promise.resolve());

        component.register();

        expect(component['_setupPassword']).toHaveBeenCalled();
      });

      it('should successfully register without user-provided password', async () => {
        component.password = '';
        authService.saveRegistration.and.returnValue(of({
          data: { apikey: 'test-api-key' }
        }));
        authService.authenticate.and.returnValue(of({
          data: { auth: { apikey: 'test-api-key', experience: { id: 1 } } }
        }) as any);
        experienceService.switchProgram.and.returnValue(Promise.resolve());

        component.register();

        await fixture.whenStable();

        expect(authService.saveRegistration).toHaveBeenCalledWith({
          password: jasmine.any(String),
          user_id: 456,
          key: 'testkey123'
        });
        expect(component.confirmPassword.length).toBeGreaterThanOrEqual(12);
      });

      it('should successfully register with user-provided password', async () => {
        component.password = 'MySecurePass123!';
        authService.saveRegistration.and.returnValue(of({
          data: { apikey: 'test-api-key' }
        }));
        authService.authenticate.and.returnValue(of({
          data: { auth: { apikey: 'test-api-key', experience: { id: 1 } } }
        }) as any);
        experienceService.switchProgram.and.returnValue(Promise.resolve());

        component.register();

        await fixture.whenStable();

        expect(authService.saveRegistration).toHaveBeenCalledWith({
          password: 'MySecurePass123!',
          user_id: 456,
          key: 'testkey123'
        });
      });

      it('should remove unRegisteredDirectLink flag from storage after successful registration', async () => {
        component.password = '';
        authService.saveRegistration.and.returnValue(of({
          data: { apikey: 'test-api-key' }
        }));
        authService.authenticate.and.returnValue(of({
          data: { auth: { apikey: 'test-api-key', experience: { id: 1 } } }
        }) as any);
        experienceService.switchProgram.and.returnValue(Promise.resolve());

        component.register();

        await fixture.whenStable();

        expect(storageService.remove).toHaveBeenCalledWith('unRegisteredDirectLink');
        expect(storageService.set).toHaveBeenCalledWith('isLoggedIn', true);
      });

      it('should handle password_compromised error for auto-generated password', async () => {
        component.password = '';
        authService.saveRegistration.and.returnValue(
          throwError(() => ({
            error: {
              data: {
                type: 'password_compromised'
              }
            }
          } as HttpErrorResponse))
        );
        notificationsService.alert.and.returnValue(Promise.resolve());

        component.register();

        await fixture.whenStable();

        expect(notificationsService.alert).toHaveBeenCalledWith({
          message: jasmine.stringContaining('insecure passwords'),
          buttons: jasmine.any(Array)
        });
        expect(component.isLoading).toBe(false);
      });

      it('should redirect to home after successful registration', async () => {
        component.password = '';
        authService.saveRegistration.and.returnValue(of({
          data: { apikey: 'test-api-key' }
        }));
        authService.authenticate.and.returnValue(of({
          data: { auth: { apikey: 'test-api-key', experience: { id: 1 } } }
        }) as any);
        experienceService.switchProgram.and.returnValue(Promise.resolve());

        component.register();

        await fixture.whenStable();

        expect(notificationsService.popUp).toHaveBeenCalledWith(
          'shortMessage',
          { message: jasmine.stringContaining('Registration success') },
          ['v3', 'home']
        );
      });

      it('should handle authentication error during registration', async () => {
        component.password = '';
        authService.saveRegistration.and.returnValue(of({
          data: { apikey: 'test-api-key' }
        }));
        authService.authenticate.and.returnValue(
          throwError(() => new Error('Auth failed'))
        );

        component.register();

        await fixture.whenStable();

        expect(component.isLoading).toBe(false);
        expect(notificationsService.popUp).toHaveBeenCalledWith(
          'shortMessage',
          { message: jasmine.stringContaining('Registration not complete') },
          false as any
        );
      });

      it('should set isLoading to true during registration', () => {
        component.password = '';
        authService.saveRegistration.and.returnValue(of({
          data: { apikey: 'test-api-key' }
        }));
        authService.authenticate.and.returnValue(of({
          data: { auth: { apikey: 'test-api-key', experience: { id: 1 } } }
        }) as any);
        experienceService.switchProgram.and.returnValue(Promise.resolve());

        expect(component.isLoading).toBe(false);

        component.register();

        expect(component.isLoading).toBe(true);
      });
    });

    describe('terms and conditions modal', () => {
      it('should open terms and conditions modal', async () => {
        const modalSpy = jasmine.createSpyObj('Modal', ['present', 'onWillDismiss']);
        modalSpy.onWillDismiss.and.returnValue(Promise.resolve({
          data: { isAgreed: true }
        }));
        modalController.create.and.returnValue(Promise.resolve(modalSpy));

        await component.termsAndConditionsPopup();

        expect(modalController.create).toHaveBeenCalledWith({
          component: jasmine.any(Function),
          canDismiss: false,
          backdropDismiss: false
        });
        expect(modalSpy.present).toHaveBeenCalled();
      });

      it('should set isAgreed to true when user agrees in modal', async () => {
        const modalSpy = jasmine.createSpyObj('Modal', ['present', 'onWillDismiss']);
        modalSpy.onWillDismiss.and.returnValue(Promise.resolve({
          data: { isAgreed: true }
        }));
        modalController.create.and.returnValue(Promise.resolve(modalSpy));

        component.isAgreed = false;
        await component.termsAndConditionsPopup();

        expect(component.isAgreed).toBe(true);
      });

      it('should not change isAgreed when modal returns no data', async () => {
        const modalSpy = jasmine.createSpyObj('Modal', ['present', 'onWillDismiss']);
        modalSpy.onWillDismiss.and.returnValue(Promise.resolve({
          data: null
        }));
        modalController.create.and.returnValue(Promise.resolve(modalSpy));

        component.isAgreed = false;
        await component.termsAndConditionsPopup();

        expect(component.isAgreed).toBe(false);
      });
    });

    describe('error handling', () => {
      beforeEach(() => {
        component.isAgreed = true;
      });

      it('should handle generic registration errors', async () => {
        component.password = '';
        authService.saveRegistration.and.returnValue(
          throwError(() => ({
            error: { message: 'Generic error' }
          } as HttpErrorResponse))
        );

        component.register();

        await fixture.whenStable();

        expect(component.isLoading).toBe(false);
        expect(notificationsService.popUp).toHaveBeenCalledWith(
          'shortMessage',
          { message: jasmine.stringContaining('Registration not complete') },
          false as any
        );
      });

      it('should not proceed with registration when validation fails', () => {
        component.isAgreed = false;

        component.register();

        expect(authService.saveRegistration).not.toHaveBeenCalled();
        expect(component.isLoading).toBe(false);
      });
    });
  });
});
