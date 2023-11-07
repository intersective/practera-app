import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthRegistrationComponent } from './auth-registration.component';
import { AuthService } from '@v3/app/services/auth.service';
import { BrowserStorageService } from '@v3/app/services/storage.service';
import { ExperienceService } from '@v3/app/services/experience.service';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

describe('AuthRegistrationComponent', () => {
  let component: AuthRegistrationComponent;
  let fixture: ComponentFixture<AuthRegistrationComponent>;
  let authService: AuthService;
  let storageService: BrowserStorageService;
  let experienceService: ExperienceService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [AuthRegistrationComponent],
      providers: [AuthService, BrowserStorageService, ExperienceService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthRegistrationComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    storageService = TestBed.inject(BrowserStorageService);
    experienceService = TestBed.inject(ExperienceService);
    fixture.detectChanges();
  });

  it('should authenticate user and switch program on successful registration', async () => {
    spyOn(authService, 'authenticate').and.returnValue(of({ data: { auth: { apikey: 'test-api-key', experience: {} } } }));
    spyOn(storageService, 'set');
    spyOn(storageService, 'remove');
    spyOn(experienceService, 'switchProgram').and.returnValue(Promise.resolve(of()));

    await authService.authenticate({apikey: 'test-api-key'});

    expect(authService.saveRegistration).toHaveBeenCalledWith({
      user_id: component.user.id,
      key: component.user.key,
      password: component.user.password,
    });
    expect(authService.authenticate).toHaveBeenCalledWith({
      apikey: 'test-api-key',
    });
    expect(component['showPopupMessages']).toHaveBeenCalledWith('shortMessage', $localize`Registration success!`, ['v3', 'home']);
    expect(storageService.set).toHaveBeenCalledWith('isLoggedIn', true);
    expect(storageService.remove).toHaveBeenCalledWith('unRegisteredDirectLink');
    expect(experienceService.switchProgram).toHaveBeenCalledWith({ experience: 'test' });
  });

  it('should show error message on failed registration', async () => {
    spyOn(authService, 'saveRegistration').and.returnValue(throwError(new HttpErrorResponse({})));
    spyOn(authService, 'authenticate');

    await authService.authenticate({ apikey: 'test-api-key' });

    expect(authService.saveRegistration).toHaveBeenCalledWith({
      user_id: component.user.id,
      key: component.user.key,
    });
    expect(authService.authenticate).not.toHaveBeenCalled();
    expect(component['showPopupMessages']).toHaveBeenCalledWith('shortMessage', $localize`Registration not complete!`);
  });
});
