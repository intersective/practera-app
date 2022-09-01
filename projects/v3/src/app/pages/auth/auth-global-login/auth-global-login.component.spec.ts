import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { AuthGlobalLoginComponent } from './auth-global-login.component';
import { AuthService } from '@v3/services/auth.service';
import { Observable, of, pipe } from 'rxjs';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { NotificationsService } from '@v3/services/notifications.service';
import { ExperienceService } from '@v3/services/experience.service';

describe('AuthGlobalLoginComponent', () => {
  let component: AuthGlobalLoginComponent;
  let fixture: ComponentFixture<AuthGlobalLoginComponent>;
  let serviceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routeSpy: ActivatedRoute;
  let notificationSpy: jasmine.SpyObj<NotificationsService>;
  let switcherSpy: jasmine.SpyObj<ExperienceService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [AuthGlobalLoginComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj('AuthService', ['globalLogin'])
        },
        {
          provide: ExperienceService,
          useValue: jasmine.createSpyObj('ExperienceService', ['getMyInfo', 'switchProgram'])
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', ['alert'])
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({
                apikey: 'abc'
              })
            }
          }
        },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthGlobalLoginComponent);
    component = fixture.componentInstance;
    serviceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    routeSpy = TestBed.inject(ActivatedRoute);
    notificationSpy = TestBed.inject(NotificationsService) as jasmine.SpyObj<NotificationsService>;
    switcherSpy = TestBed.inject(ExperienceService) as jasmine.SpyObj<ExperienceService>;
  });

  beforeEach(() => {
    serviceSpy.globalLogin.and.returnValue(of({}));
    switcherSpy.getMyInfo.and.returnValue(of({}));
  });

  describe('when testing ngOnInit()', () => {
    it('should pop up alert if apikey is not provided', fakeAsync(() => {
      const params = { apikey: null };
      routeSpy.snapshot.paramMap.get = jasmine.createSpy().and.callFake(key => params[key]);
      tick(50);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(notificationSpy.alert.calls.count()).toBe(1);
      });
      flushMicrotasks();
    }));

    it('should pop up alert if direct login service throw error', fakeAsync(() => {
      const params = { apikey: 'abc' };
      routeSpy.snapshot.paramMap.get = jasmine.createSpy().and.callFake(key => params[key]);
      serviceSpy.globalLogin.and.throwError('');
      fixture.detectChanges();
      tick(50);
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(notificationSpy.alert.calls.count()).toBe(1);
        const button = notificationSpy.alert.calls.first().args[0].buttons[0];
        (typeof button == 'string') ? button : button.handler(true);
        expect(routerSpy.navigate.calls.first().args[0]).toEqual(['auth', 'login']);
      });
    }));

    describe('should navigate to', () => {
      const params = {
        apikey: 'abc'
      };
      let tmpParams;
      beforeEach(() => {
        tmpParams = JSON.parse(JSON.stringify(params));
      });
      afterEach(fakeAsync(() => {
        routeSpy.snapshot.paramMap.get = jasmine.createSpy().and.callFake(key => tmpParams[key]);
        fixture.detectChanges();
        tick(50);
        fixture.detectChanges();
        expect(serviceSpy.globalLogin.calls.count()).toBe(1);
        expect(switcherSpy.getMyInfo.calls.count()).toBe(1);
      }));
    });
  });
});

