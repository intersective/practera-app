import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { OverviewComponent } from './overview.component';
import { FastFeedbackService } from '../fast-feedback/fast-feedback.service';
import { UtilsService } from '@services/utils.service';
import { TestUtils } from '@testing/utils';
import { MockRouter } from '@testing/mocked.service';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Observable, of, pipe } from 'rxjs';
import { BrowserStorageService } from '@services/storage.service';
import { Apollo } from 'apollo-angular';
import { SharedService } from '@app/services/shared.service';
import { OverviewService } from './overview.service';

describe('OverviewComponent', () => {
  const PROGRAM_NAME = 'Dummy Program name';

  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;
  let routeSpy: ActivatedRoute;
  let utils: UtilsService;
  let fastfeedbackSpy: jasmine.SpyObj<FastFeedbackService>;
  let sharedSpy: jasmine.SpyObj<SharedService>;
  let overviewSpy: jasmine.SpyObj<OverviewService>;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ OverviewComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        Apollo,
        UtilsService,
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', {
            getUser: {
              programName: PROGRAM_NAME,
            },
            set: true
          })
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ activityId: 1 })
            }
          }
        },
        {
          provide: FastFeedbackService,
          useValue: jasmine.createSpyObj('FastFeedbackService', ['pullFastFeedback'])
        },
        {
          provide: SharedService,
          useValue: jasmine.createSpyObj('SharedService', {
            getTeamInfo: of(true)
          })
        },
        {
          provide: OverviewService,
          useValue: jasmine.createSpyObj('OverviewService', ['getProgress'])
        },
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    overviewSpy = TestBed.inject(OverviewService) as jasmine.SpyObj<OverviewService>;
    routeSpy = TestBed.inject(ActivatedRoute);
    sharedSpy = TestBed.inject(SharedService) as jasmine.SpyObj<SharedService>;
    utils = TestBed.inject(UtilsService);
    fastfeedbackSpy = TestBed.inject(FastFeedbackService) as jasmine.SpyObj<FastFeedbackService>;
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    fastfeedbackSpy.pullFastFeedback.and.returnValue(of({}));
    overviewSpy.getProgress.and.returnValue(of({}));
    component.initiator$ = of({});
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should get program name and pull fastfeedback', fakeAsync(() => {
      spyOn(utils, 'broadcastEvent');
      component.ngOnInit();

      flushMicrotasks();
      fixture.detectChanges();
      expect(component.programName).toEqual(PROGRAM_NAME);
      expect(fastfeedbackSpy.pullFastFeedback).toHaveBeenCalled();
      expect(sharedSpy.getTeamInfo).toHaveBeenCalled();
    }));
  });
});
