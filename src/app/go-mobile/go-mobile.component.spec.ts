import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { async, TestBed, ComponentFixture } from '@angular/core/testing';
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

describe('GoMobileComponent', () => {
  let component: GoMobileComponent;
  let fixture: ComponentFixture<GoMobileComponent>;
  let newRelicSpy: NewRelicService;

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
        NotificationService,
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
    newRelicSpy = TestBed.get(NewRelicService);
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

});
