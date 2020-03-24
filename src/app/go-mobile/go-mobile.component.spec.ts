import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import {
  HttpTestingController,
  HttpClientTestingModule
} from '@angular/common/http/testing';
import { GoMobileComponent } from './go-mobile.component';
// import { GoMobileModule } from './go-mobile.module';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { UtilsService } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { BrowserStorageService } from '@services/storage.service';
import { BrowserStorageServiceMock, MockNewRelicService, MockRouter } from '@testing/mocked.service';
import { SharedModule } from '@shared/shared.module';
import { GoMobileService } from './go-mobile.service';
import { ReactiveFormsModule } from '@angular/forms';
import { TextMaskModule } from 'angular2-text-mask';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { of, throwError } from 'rxjs';

describe('GoMobileComponent', () => {
  let component: GoMobileComponent;
  let fixture: ComponentFixture<GoMobileComponent>;
  let newRelicSpy: NewRelicService;
  let goMobileSpy: GoMobileService;
  let notificationSpy: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ GoMobileComponent ],
      imports: [
        IonicModule,
        SharedModule,
        // ReactiveFormsModule,
        // TextMaskModule,
        HttpClientTestingModule
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        GoMobileService,
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj(['alert', 'presentToast']),
        },
        {
          provide: NewRelicService,
          useClass: MockNewRelicService
        },
        UtilsService,
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: BrowserStorageService,
          useClass: BrowserStorageServiceMock
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GoMobileComponent);
    component = fixture.debugElement.componentInstance;
    newRelicSpy = TestBed.inject(NewRelicService);
    goMobileSpy = TestBed.inject(GoMobileService);
    notificationSpy = TestBed.inject(NotificationService);
  });

  it('should created', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    it('should pre-configure profile and locale standard', () => {
      const testContactNumber = '0123456789'; // same as mocked user in testing/mocked.service;
      expect(component.profile.contactNumber).toEqual('');

      component.ngOnInit();
      expect(newRelicSpy.setPageViewName).toHaveBeenCalledWith('go-mobile');
      expect(component.profile.contactNumber).toEqual(testContactNumber);
      expect(component.saved).toEqual(true);
      expect(component.invalidNumber).toEqual(false);
    });

    it('should set model to "US" if apiEndpoint has "us" in the string', () => {
      environment.APIEndpoint = 'http://us.something.com';
      expect(component.countryModel).toEqual('AUS');

      component.ngOnInit();
      expect(component.countryModel).toEqual('US');
    });
  });

  describe('submit()', () => {
    beforeEach(() => {
      component.countryModel = 'AUS';
      spyOn(goMobileSpy, 'submit').and.returnValue(of(true));
      expect(component.sendingSMS).toBeFalsy();
    });

    it('should prevent bad contact number format', () => {
      component.profile.contactNumber = '0123456789'; // mock bad format
      component.submit();
      expect(notificationSpy.presentToast).toHaveBeenCalledWith('Invalid contact number');
    });

    it('should submit to update profile', () => {
      component.profile.contactNumber = '012345678912'; // mock correct format
      component.submit();

      expect(newRelicSpy.addPageAction).toHaveBeenCalled();
      expect(goMobileSpy.submit).toHaveBeenCalled();
      expect(notificationSpy.alert).toHaveBeenCalled();
    });

    it('should fail gracefully (notify user) if API return error', () => {
      goMobileSpy.submit = jasmine.createSpy('submit').and.returnValue(throwError(false));
      component.profile.contactNumber = '012345678912'; // mock correct format
      component.submit();

      expect(newRelicSpy.addPageAction).toHaveBeenCalled();
      expect(goMobileSpy.submit).toHaveBeenCalled();
      expect(notificationSpy.alert).toHaveBeenCalledWith({ header: 'Error submitting contact info', message: 'false' });
    });
  });

  describe('validateContactNumber()', () => {
    beforeEach(() => {
      component.profile.contactNumber = '012345678912'; // 12 digit contact numbers
    });

    it('should validate AUS format of contact number', () => {
      component.countryModel = 'AUS';
      const result = component.validateContactNumber();
      expect(result).toBeTruthy();
    });

    it('should validate US format of contact number', () => {
      component.countryModel = 'US';
      const result = component.validateContactNumber();
      expect(result).toBeTruthy();
    });

    it('should invalidate contact number (it not belong to US/AUS)', () => {
      component.countryModel = 'ANY_WRONG_NAME';
      const result = component.validateContactNumber();
      expect(result).toBeFalsy();
    });

    it('should return false when contact number is not 12 digits number', () => {
      component.profile.contactNumber = '0123456789';
      const result = component.validateContactNumber();
      expect(result).toBeFalsy();
    });

    it('should return false and reset contactNumber to NULL when contact number is 3 digits number for AUS', () => {
      component.countryModel = 'AUS';
      component.profile.contactNumber = '012';
      const result = component.validateContactNumber();
      expect(result).toBeFalsy();
      expect(component.invalidNumber).toBeTruthy();
      expect(component.profile.contactNumber).toBeNull();
    });

    it('should return false and reset contactNumber to NULL when contact number is 2 digits number for US', () => {
      component.countryModel = 'US';
      component.profile.contactNumber = '01';
      const result = component.validateContactNumber();
      expect(result).toBeFalsy();
      expect(component.invalidNumber).toBeTruthy();
      expect(component.profile.contactNumber).toBeNull();
    });
  });

  describe('updateCountry()', () => {
    it('should be able to update locale', () => {
      const testNumber = '0000000000';

      // @TODO: verify with team why is this only update number rather than locale
      component.profile.contactNumber = '0123456789';
      component.updateCountry(testNumber);
      expect(component.profile.contactNumber).toEqual(testNumber);
    });
  });
});
