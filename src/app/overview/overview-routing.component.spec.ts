import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverviewRoutingComponent } from './overview-routing.component';
import { FastFeedbackService } from '../fast-feedback/fast-feedback.service';
import { UtilsService } from '@services/utils.service';
import { ActivatedRouteStub } from '@testing/activated-route-stub';
import { TestUtils } from '@testing/utils';
import { MockRouter } from '@testing/mocked.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, pipe } from 'rxjs';
import { BrowserStorageService } from '@services/storage.service';

describe('OverviewRoutingComponent', () => {
  const PROGRAM_NAME = 'Dummy Program name';

  let component: OverviewRoutingComponent;
  let fixture: ComponentFixture<OverviewRoutingComponent>;
  let routeStub: ActivatedRouteStub;
  let utils: UtilsService;
  let fastfeedbackSpy: jasmine.SpyObj<FastFeedbackService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // imports: [],
      declarations: [ OverviewRoutingComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
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
          useValue: new ActivatedRouteStub({ activityId: 1 })
        },
        {
          provide: FastFeedbackService,
          useValue: jasmine.createSpyObj('FastFeedbackService', {
            pullFastFeedback: of(true)
          })
        },
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewRoutingComponent);
    component = fixture.componentInstance;
    routeStub = TestBed.get(ActivatedRoute);
    utils = TestBed.get(UtilsService);
    fastfeedbackSpy = TestBed.get(FastFeedbackService);
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
