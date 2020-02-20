import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  HttpTestingController,
  HttpClientTestingModule
} from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactNumberFormComponent } from './contact-number-form.component';
import { CommonModule } from '@angular/common';
import { UtilsService } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { BrowserStorageService } from '@services/storage.service';
import { SettingService } from '@app/settings/setting.service';
import { RouterModule, Router } from '@angular/router';
import { MockRouter, BrowserStorageServiceMock } from '@testing/mocked.service';
import { of } from 'rxjs';

describe('ContactNumberFormComponent', () => {
  let component: ContactNumberFormComponent;
  let fixture: ComponentFixture<ContactNumberFormComponent>;
  let storageSpy: BrowserStorageService;
  let notificationSpy: NotificationService;
  let settingSpy: SettingService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ IonicModule, CommonModule, FormsModule, HttpClientTestingModule, RouterModule ],
      declarations: [ ContactNumberFormComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        {
          provide: BrowserStorageService,
          useClass: BrowserStorageServiceMock,
        },
        UtilsService,
        SettingService,
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj(['alert', 'presentToast', 'popUp'])
        },
        {
          provide: Router,
          useClass: MockRouter
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactNumberFormComponent);
    component = fixture.componentInstance;
    storageSpy = TestBed.get(BrowserStorageService);
    notificationSpy = TestBed.get(NotificationService);
    settingSpy = TestBed.get(SettingService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    beforeEach(() => {
      component.page = 'settings';
    });

    it('should check existing contact number format if available', () => {
      component.countryModel = 'AUS';
      storageSpy.getUser = jasmine.createSpy('getUser').and.returnValue({
        contactNumber: '012345678912',
      });
      component.ngOnInit();
    });

    describe('_checkCurrentContactNumberOrigin()', () => {
      const formats = [
        { number: '+61234567890', locale: 'AUS' },
        { number: '61123456789', locale: 'AUS' },
        { number: '04123456789', locale: 'AUS' },
        { number: '+101234567890', locale: 'US' },
        { number: '101234567890', locale: 'US' },
        { number: '01234567890', locale: 'AUS' },
      ];
      formats.forEach(format => {
        it(`should identify ${format.number} as ${format.locale} format`, () => {
          const locale = format.locale;
          storageSpy.getUser = jasmine.createSpy('getUser').and.returnValue({
            contactNumber: format.number,
          });

          component.ngOnInit();

          expect(component.countryModel).toEqual(locale);
          expect(component.activeCountryModelInfo.countryCode).toEqual(component.contactNumberFormat.masks[locale].format);
          expect(component.activeCountryModelInfo.placeholder).toEqual(component.contactNumberFormat.masks[locale].placeholder);
          expect(component.activeCountryModelInfo.pattern).toEqual(component.contactNumberFormat.masks[locale].pattern);
          expect(component.activeCountryModelInfo.length).toEqual(component.contactNumberFormat.masks[locale].numberLength);
        });
      });

    });
  });

  describe('formatContactNumber()', () => {
    it('should recognize and split contactNumber into format based on provided countryModel', () => {
      component.contactNumber = '012345678912';
      component.formatContactNumber();
      expect(component.contactNumber).toEqual('012 345 678 912');
    });

    it('should emit event in go-mobile page', () => {
      spyOn(component.updateNumber, 'emit');
      component.page = 'go-mobile';
      component.contactNumber = '012345678912';
      component.formatContactNumber();
      expect(component.contactNumber).toEqual('012 345 678 912');
      expect(component.updateNumber.emit).toHaveBeenCalledWith(component.activeCountryModelInfo.countryCode + component.contactNumber);
    });
  });

  describe('updateCountry()', () => {
    beforeEach(() => {
      component.countryModel = 'AUS';
    });

    it('should update form model criteria based on selected locale', () => {
      component.updateCountry();

      expect(component.activeCountryModelInfo.countryCode).toEqual(component.contactNumberFormat.masks[component.countryModel].format);
      expect(component.activeCountryModelInfo.placeholder).toEqual(component.contactNumberFormat.masks[component.countryModel].placeholder);
      expect(component.activeCountryModelInfo.pattern).toEqual(component.contactNumberFormat.masks[component.countryModel].pattern);
      expect(component.activeCountryModelInfo.length).toEqual(component.contactNumberFormat.masks[component.countryModel].numberLength);

      // will clear input fill once locale get changed to other
      expect(component.contactNumber).toEqual('');
    });

    it('should emit event when user is in "go-mobile" page', () => {
      spyOn(component.updateNumber, 'emit');
      component.page = 'go-mobile';

      component.updateCountry();
      expect(component.updateNumber.emit).toHaveBeenCalledWith(component.activeCountryModelInfo.countryCode + component.contactNumber);
    });
  });

  describe('updateContactNumber()', () => {
    it('should prevent wrong formated contactNumber', () => {
      component.countryModel = 'AUS';
      component.contactNumber = '1234567';
      component.activeCountryModelInfo.countryCode = '10';

      component.updateContactNumber();
      expect(notificationSpy.presentToast).toHaveBeenCalledWith('Invalid contact number', false);
    });

    it('should update contact number (US)', () => {
      let submitBtn, cancelBtn;
      spyOn(settingSpy, 'updateProfile').and.returnValue(of({
        success: true
      }));
      notificationSpy.alert = jasmine.createSpy('alert').and.callFake(res => {
        [cancelBtn, submitBtn] = res.buttons;

        submitBtn.handler();
        expect(submitBtn.text).toEqual('Okay');
        expect(notificationSpy.popUp).toHaveBeenCalledWith('shortMessage', { message: 'Profile successfully updated!'});
      });

      component.countryModel = 'US';
      component.contactNumber = '12345678901';
      component.activeCountryModelInfo.countryCode = '1';

      component.updateContactNumber();
    });

    it('should update contact number (AUS)', () => {
      let submitBtn, cancelBtn;
      spyOn(settingSpy, 'updateProfile').and.returnValue(of({
        success: true
      }));
      notificationSpy.alert = jasmine.createSpy('alert').and.callFake(res => {
        [cancelBtn, submitBtn] = res.buttons;

        submitBtn.handler();
        expect(submitBtn.text).toEqual('Okay');
        expect(notificationSpy.popUp).toHaveBeenCalledWith('shortMessage', { message: 'Profile successfully updated!'});
      });

      component.countryModel = 'AUS';
      component.contactNumber = '1234567890';
      component.activeCountryModelInfo.countryCode = '10';

      component.updateContactNumber();
    });

    it('should fail update contact number gracefully (notify user)', () => {
      let submitBtn, cancelBtn;
      spyOn(settingSpy, 'updateProfile').and.returnValue(of({
        success: false
      }));
      notificationSpy.alert = jasmine.createSpy('alert').and.callFake(res => {
        [cancelBtn, submitBtn] = res.buttons;

        submitBtn.handler();
        expect(submitBtn.text).toEqual('Okay');
        expect(notificationSpy.popUp).toHaveBeenCalledWith('shortMessage', { message: 'Profile updating failed!'});
      });

      component.countryModel = 'AUS';
      component.contactNumber = '1234567890';
      component.activeCountryModelInfo.countryCode = '10';

      component.updateContactNumber();
    });
  });

  describe('disableArrowKeys()', () => {});
});
