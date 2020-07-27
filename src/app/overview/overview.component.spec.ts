import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverviewComponent } from './overview.component';
import { FastFeedbackService } from '../fast-feedback/fast-feedback.service';
import { UtilsService } from '@services/utils.service';
import { TestUtils } from '@testing/utils';
import { MockRouter } from '@testing/mocked.service';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Observable, of, pipe } from 'rxjs';
import { BrowserStorageService } from '@services/storage.service';
import { Apollo } from 'apollo-angular';

describe('OverviewComponent', () => {
  const PROGRAM_NAME = 'Dummy Program name';

  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;
  let routeSpy: ActivatedRoute;
  let utils: UtilsService;
  let fastfeedbackSpy: jasmine.SpyObj<FastFeedbackService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // imports: [],
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
            }
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
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    routeSpy = TestBed.inject(ActivatedRoute);
    utils = TestBed.inject(UtilsService);
    fastfeedbackSpy = TestBed.inject(FastFeedbackService) as jasmine.SpyObj<FastFeedbackService>;
    fastfeedbackSpy.pullFastFeedback.and.returnValue(of(true));
    component.initiator$ = of({});
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should get program name and pull fastfeedback', () => {
      component.ngOnInit();
      expect(component.programName).toEqual(PROGRAM_NAME);
      expect(fastfeedbackSpy.pullFastFeedback).toHaveBeenCalled();
    });
  });
});
