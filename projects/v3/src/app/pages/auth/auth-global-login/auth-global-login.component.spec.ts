import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { UtilsService } from '@v3/services/utils.service';
import { AuthService } from '@v3/services/auth.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { ExperienceService } from '@v3/services/experience.service';
import { AuthGlobalLoginComponent } from './auth-global-login.component';
import { ActivatedRoute, Router } from '@angular/router';

describe('AuthGlobalLoginComponent', () => {
  let component: AuthGlobalLoginComponent;
  let fixture: ComponentFixture<AuthGlobalLoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockUtilsService: jasmine.SpyObj<UtilsService>;
  let mockStorageService: jasmine.SpyObj<BrowserStorageService>;
  let mockNotificationService: jasmine.SpyObj<NotificationsService>;
  let mockExperienceService: jasmine.SpyObj<ExperienceService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let activatedRoute: any;

  beforeEach(waitForAsync(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['autologin', 'getMyInfo', 'logout']);
    mockUtilsService = jasmine.createSpyObj('UtilsService', ['redirectToUrl']);
    mockStorageService = jasmine.createSpyObj('BrowserStorageService', ['get', 'set', 'remove']);
    mockNotificationService = jasmine.createSpyObj('NotificationsService', ['alert']);
    mockExperienceService = jasmine.createSpyObj('ExperienceService', ['switchProgram']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    activatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.callFake((key: string) => {
            if (key === 'apikey') return 'test-apikey';
            if (key === 'multiple') return null;
            return null;
          })
        }
      }
    };

    TestBed.configureTestingModule({
      declarations: [AuthGlobalLoginComponent],
      imports: [RouterTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UtilsService, useValue: mockUtilsService },
        { provide: BrowserStorageService, useValue: mockStorageService },
        { provide: NotificationsService, useValue: mockNotificationService },
        { provide: ExperienceService, useValue: mockExperienceService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthGlobalLoginComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle missing apikey on init', async () => {
    activatedRoute.snapshot.paramMap.get.and.returnValue(null);
    mockNotificationService.alert.and.returnValue(Promise.resolve());

    await component.ngOnInit();

    expect(mockNotificationService.alert).toHaveBeenCalled();
  });

  it('should login and navigate on valid apikey', async () => {
    const mockExperience = {
      id: 1,
      locale: 'en-US'
    };
    mockAuthService.autologin.and.returnValue(of({ experience: mockExperience }));
    mockAuthService.getMyInfo.and.returnValue(of({
      data: {
        user: {
          id: 1,
          uuid: 'test-uuid',
          name: 'Test User',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          image: 'test.jpg',
          role: 'participant',
          contactNumber: '+1234567890',
          userHash: 'hash123'
        }
      }
    }));
    mockExperienceService.switchProgram.and.returnValue(Promise.resolve());
    mockRouter.navigate.and.returnValue(Promise.resolve(true));

    await component.ngOnInit();

    expect(mockAuthService.autologin).toHaveBeenCalledWith({ apikey: 'test-apikey' });
    expect(mockAuthService.getMyInfo).toHaveBeenCalled();
    expect(mockExperienceService.switchProgram).toHaveBeenCalledWith({ experience: mockExperience });
  });

  it('should set hasMultipleStacks when multiple param is true', async () => {
    activatedRoute.snapshot.paramMap.get.and.callFake((key: string) => {
      if (key === 'apikey') return 'test-apikey';
      if (key === 'multiple') return 'true';
      return null;
    });
    const mockExperience = {
      id: 1,
      locale: 'en-US'
    };
    mockAuthService.autologin.and.returnValue(of({ experience: mockExperience }));
    mockAuthService.getMyInfo.and.returnValue(of({
      data: {
        user: {
          id: 1,
          uuid: 'test-uuid',
          name: 'Test User',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          image: 'test.jpg',
          role: 'participant',
          contactNumber: '+1234567890',
          userHash: 'hash123'
        }
      }
    }));
    mockExperienceService.switchProgram.and.returnValue(Promise.resolve());
    mockRouter.navigate.and.returnValue(Promise.resolve(true));

    await component.ngOnInit();

    expect(mockStorageService.set).toHaveBeenCalledWith('hasMultipleStacks', true);
  });

  it('should show error alert on login failure', async () => {
    mockAuthService.autologin.and.returnValue(throwError(() => ({ message: 'Login failed' })));
    mockNotificationService.alert.and.returnValue(Promise.resolve());

    await component.ngOnInit();

    expect(mockNotificationService.alert).toHaveBeenCalled();
  });

  it('should show specific error for user not enrolled', async () => {
    mockAuthService.autologin.and.returnValue(throwError(() => ({ message: 'User not enrolled in program' })));
    mockNotificationService.alert.and.returnValue(Promise.resolve());

    await component.ngOnInit();

    expect(mockNotificationService.alert).toHaveBeenCalledWith(jasmine.objectContaining({
      message: jasmine.stringContaining('User not enrolled')
    }));
  });
});
