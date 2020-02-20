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
// import { } from '@anuglar';

describe('ContactNumberFormComponent', () => {
  let component: ContactNumberFormComponent;
  let fixture: ComponentFixture<ContactNumberFormComponent>;
  let storageSpy: BrowserStorageService;

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
        NotificationService,
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
  });

  describe('updateCountry()', () => {});
  describe('updateContactNumber()', () => {});
  describe('disableArrowKeys()', () => {});
});
