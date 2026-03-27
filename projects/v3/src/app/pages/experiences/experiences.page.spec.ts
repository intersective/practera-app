import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed, waitForAsync } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { IonicModule, LoadingController } from '@ionic/angular';
import { ExperienceService } from '@v3/app/services/experience.service';
import { NotificationsService } from '@v3/app/services/notifications.service';

import { ExperiencesPage } from './experiences.page';
import { MockRouter } from '@testingv3/mocked.service';
import { ActivatedRouteStub } from '@testingv3/activated-route-stub';
import { TestUtils } from '@testingv3/utils';
import { of } from 'rxjs';

describe('ExperiencesPage', () => {
  let component: ExperiencesPage;
  let fixture: ComponentFixture<ExperiencesPage>;
  let storageSpy: BrowserStorageService;
  let experienceServiceSpy: ExperienceService;
  let loadingCtrlSpy: LoadingController;
  let notificationsSpy: NotificationsService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ExperiencesPage ],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: ActivatedRoute,
          useValue: new ActivatedRouteStub({}),
        },
        {
          provide: ExperienceService,
          useValue: jasmine.createSpyObj('ExperienceService', [
            'getPrograms',
            'switchProgramAndNavigate',
          ], {
            'programsWithProgress$': of(),
          }),
        },
        {
          provide: LoadingController,
          useValue: jasmine.createSpyObj('LoadingController', ['create']),
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', {
            'alert': Promise.resolve(true)
          }),
        },
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['getConfig']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExperiencesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    experienceServiceSpy = TestBed.inject(ExperienceService) as jasmine.SpyObj<ExperienceService>;
    loadingCtrlSpy = TestBed.inject(LoadingController) as jasmine.SpyObj<LoadingController>;
    notificationsSpy = TestBed.inject(NotificationsService) as jasmine.SpyObj<NotificationsService>;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('instituteLogo()', () => {
    it('should get instituteLogo value from localStorage', () => {
      storageSpy.getConfig = jasmine.createSpy('getConfig').and.returnValue({
        instituteLogo: 'abcdefg'
      });
      expect(component.instituteLogo).toEqual('abcdefg');
    });
  });

  describe('switchProgram()', () => {
    let presentLoading: any;
    let dismissLoading: any;

    beforeEach(() => {
      experienceServiceSpy.switchProgramAndNavigate = jasmine.createSpy('switchProgramAndNavigate').and.returnValue(Promise.resolve(true));

      presentLoading = jasmine.createSpy('present');
      dismissLoading = jasmine.createSpy('dismiss').and.returnValue(Promise.resolve(true));
      loadingCtrlSpy.create = jasmine.createSpy('create').and.returnValue(Promise.resolve({
        present: presentLoading,
        dismiss: dismissLoading,
      }));
    });

    it('should redirect user', fakeAsync(() => {
      component.switchProgram({
        testing: true
      } as any);

      flushMicrotasks();
      expect(experienceServiceSpy.switchProgramAndNavigate).toHaveBeenCalledWith({
        testing: true
      });
    }));

    it('should redirect user with keyboard event', fakeAsync(() => {
      component.switchProgram({
        testing: true
      } as any, new KeyboardEvent('keydown', {
        code: 'Enter',
        key: 'Enter',
      }));

      flushMicrotasks();
      expect(experienceServiceSpy.switchProgramAndNavigate).toHaveBeenCalledWith({
        testing: true
      });
    }));

    it('should not redirect user with wrong keyboard event', fakeAsync(() => {

      component.switchProgram({
        testing: true
      } as any, new KeyboardEvent('keydown', {
        code: 'Tab',
        key: 'Tab',
      }));

      flushMicrotasks();
      expect(experienceServiceSpy.switchProgramAndNavigate).not.toHaveBeenCalledWith({
        testing: true
      });
    }));

    it('should throw error with alertCtrl', fakeAsync(() => {
      experienceServiceSpy.switchProgramAndNavigate = jasmine.createSpy('switchProgramAndNavigate').and.throwError('SAMPLE_ERROR');

      component.switchProgram({
        testing: true
      } as any);

      flushMicrotasks();
      expect(notificationsSpy.alert).toHaveBeenCalled();
    }));
  });
});
