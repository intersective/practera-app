import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { UtilsService } from '@v3/services/utils.service';
import { AuthService } from '@v3/services/auth.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { ExperienceService } from '@v3/services/experience.service';
import { AuthRegistrationComponent } from './auth-registration.component';

describe('AuthRegistrationComponent', () => {
  let component: AuthRegistrationComponent;
  let fixture: ComponentFixture<AuthRegistrationComponent>;
  let mockAuthService, mockUtilsService, mockStorageService, mockNotificationService, mockExperienceService;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj(['verifyRegistration', 'checkDomain', 'saveRegistration', 'authenticate']);
    mockUtilsService = jasmine.createSpyObj(['find']);
    mockStorageService = jasmine.createSpyObj(['get', 'set', 'remove', 'setUser']);
    mockNotificationService = jasmine.createSpyObj(['popUp', 'alert']);
    mockExperienceService = jasmine.createSpyObj(['switchProgram']);

    await TestBed.configureTestingModule({
      declarations: [AuthRegistrationComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UtilsService, useValue: mockUtilsService },
        { provide: BrowserStorageService, useValue: mockStorageService },
        { provide: NotificationsService, useValue: mockNotificationService },
        { provide: ExperienceService, useValue: mockExperienceService }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AuthRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    component.initForm();
    expect(component.registerationForm).toBeDefined();
    expect(component.registerationForm.get('email').value).toEqual('');
  });

  it('should validate query parameters', () => {
    mockAuthService.verifyRegistration.and.returnValue(of(true));
    mockAuthService.checkDomain.and.returnValue(of(true));

    component.validateQueryParams();

    expect(mockAuthService.verifyRegistration).toHaveBeenCalled();
    expect(mockAuthService.checkDomain).toHaveBeenCalled();
  });

  it('should register the user', () => {
    mockAuthService.saveRegistration.and.returnValue(of(true));
    mockAuthService.authenticate.and.returnValue(of(true));

    component.register();

    expect(mockAuthService.saveRegistration).toHaveBeenCalled();
    expect(mockAuthService.authenticate).toHaveBeenCalled();
  });
});
