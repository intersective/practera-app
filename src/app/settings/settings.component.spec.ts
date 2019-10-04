import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { SettingService } from './setting.service';
import { Observable, of, pipe } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '@shared/shared.module';
import { UtilsService } from '@services/utils.service';
import { FilestackService } from '@shared/filestack/filestack.service';

fdescribe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let settingsSpy: jasmine.SpyObj<SettingService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let utils: UtilsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ SharedModule, HttpClientModule ],
      declarations: [ SettingsComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        UtilsService,
        FilestackService,
        {
          provide: SettingService,
          useValue: jasmine.createSpyObj('SettingService', ['updateProfileImage'])
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
            settings: of()
          }
        },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    settingsSpy = TestBed.get(SettingService);
    routerSpy = TestBed.get(Router);
    utils = TestBed.get(UtilsService);
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });


});

