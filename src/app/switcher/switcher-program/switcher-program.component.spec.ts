import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { Observable, of, pipe, throwError } from 'rxjs';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { SwitcherProgramComponent } from './switcher-program.component';
import { SwitcherService } from '../switcher.service';
import { MockSwitcherService, MockRouter, MockNewRelicService } from '@testing/mocked.service';
import { ProgramFixture } from '@testing/fixtures/programs';
import { Router } from '@angular/router';
import { PusherService } from '@shared/pusher/pusher.service';
import { NotificationService } from '@shared/notification/notification.service';
import { UtilsService } from '@services/utils.service';
import { SharedModule } from '@shared/shared.module';
import { LoadingController } from '@ionic/angular';
import { Apollo } from 'apollo-angular';

describe('SwitcherProgramComponent', () => {
  let component: SwitcherProgramComponent;
  let fixture: ComponentFixture<SwitcherProgramComponent>;
  let newrelicSpy: jasmine.SpyObj<NewRelicService>;
  let switcherSpy: jasmine.SpyObj<SwitcherService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let loadingSpy: jasmine.SpyObj<LoadingController>;
  let notifySpy: jasmine.SpyObj<NotificationService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, HttpClientTestingModule],
      declarations: [SwitcherProgramComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        Apollo,
        PusherService,
        NotificationService,
        UtilsService,
        LoadingController,
        {
          provide: NewRelicService,
          useClass: MockNewRelicService
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: SwitcherService,
          useClass: MockSwitcherService,
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SwitcherProgramComponent);
    component = fixture.componentInstance;
    newrelicSpy = TestBed.inject(NewRelicService) as jasmine.SpyObj<NewRelicService>;
    switcherSpy = TestBed.inject(SwitcherService) as jasmine.SpyObj<SwitcherService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    loadingSpy = TestBed.inject(LoadingController) as jasmine.SpyObj<LoadingController>;
    notifySpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwitcherProgramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onEnter()', () => {
    it('should instantiate with API program list', () => {
      const programs = ProgramFixture;
      programs.forEach((p, i) => {
        programs[i].progress = (i + 1) / 10,
        programs[i].todoItems = (i + 1);
      });
      switcherSpy.getPrograms.and.returnValue(of(programs));
      component.onEnter();

      expect(newrelicSpy.setPageViewName).toHaveBeenCalledWith('program switcher');
      expect(switcherSpy.getPrograms).toHaveBeenCalled();
      expect(component.programs).toEqual(programs);
    });
  });

  describe('switch()', () => {
    const testRoute = ['test', 'path'];
    const programIndex = 0;

    beforeEach(() => {
      component.programs = ProgramFixture; // load fixture
      spyOn(loadingSpy, 'create').and.returnValue({
        present: () => new Promise(res => res('test')),
        dismiss: () => new Promise(res => res(true))
      });
    });

    it('should switch to selected program based on provided programmatic index', fakeAsync(() => {
      switcherSpy.switchProgramAndNavigate = jasmine.createSpy('switchProgramAndNavigate').and.returnValue(new Promise(res => res(testRoute)));

      component.switch(programIndex);
      flushMicrotasks();

      expect(newrelicSpy.createTracer).toHaveBeenCalled();
      expect(newrelicSpy.actionText).toHaveBeenCalled();
      expect(switcherSpy.switchProgramAndNavigate).toHaveBeenCalledWith(ProgramFixture[programIndex]);
      expect(routerSpy.navigate).toHaveBeenCalledWith(testRoute);
    }));

    it('should popup error at failed program switching', fakeAsync(() => {
      const error = {
        msg: 'test error msg',
      };
      switcherSpy.switchProgramAndNavigate = jasmine.createSpy('switchProgramAndNavigate').and.returnValue(new Promise((res, reject) => reject(error)
      ));
      spyOn(notifySpy, 'alert');

      component.switch(programIndex);
      flushMicrotasks();

      expect(newrelicSpy.createTracer).toHaveBeenCalled();
      expect(newrelicSpy.actionText).toHaveBeenCalled();
      expect(switcherSpy.switchProgramAndNavigate).toHaveBeenCalledWith(ProgramFixture[programIndex]);
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      expect(notifySpy.alert).toHaveBeenCalledWith({
        header: 'Error switching program',
        message: error.msg,
      });
      expect(newrelicSpy.noticeError).toHaveBeenCalled();
    }));

    it('should popup error at failed program switching (without error message)', fakeAsync(() => {
      const error = {
        different: 'kind of format'
      };
      switcherSpy.switchProgramAndNavigate = jasmine.createSpy('switchProgramAndNavigate').and.returnValue(new Promise((res, reject) => reject(error)
      ));
      spyOn(notifySpy, 'alert');

      component.switch(programIndex);
      flushMicrotasks();

      expect(newrelicSpy.createTracer).toHaveBeenCalled();
      expect(newrelicSpy.actionText).toHaveBeenCalled();
      expect(switcherSpy.switchProgramAndNavigate).toHaveBeenCalledWith(ProgramFixture[programIndex]);
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      expect(notifySpy.alert).toHaveBeenCalledWith({
        header: 'Error switching program',
        message: JSON.stringify(error)
      });
      expect(newrelicSpy.noticeError).toHaveBeenCalled();
    }));
  });
});
