import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverviewRoutingComponent } from './overview-routing.component';
import { FastFeedbackService } from '../fast-feedback/fast-feedback.service';
import { UtilsService } from '@services/utils.service';
import { ActivatedRouteStub } from '@testing/activated-route-stub';
import { TestUtils } from '@testing/utils';
import { MockRouter } from '@testing/mocked.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, of, pipe } from 'rxjs';

describe('OverviewRoutingComponent', () => {

  let component: OverviewRoutingComponent;
  let fixture: ComponentFixture<OverviewRoutingComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
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
          provide: ActivatedRoute,
          useValue: new ActivatedRouteStub({ activityId: 1 })
        },
        {
          provide: FastFeedbackService,
          useValue: jasmine.createSpyObj('FastFeedbackService', ['pullFastFeedback'])
        },
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewRoutingComponent);
    component = fixture.componentInstance;
    routerSpy = TestBed.get(Router);
    routeStub = TestBed.get(ActivatedRoute);
    utils = TestBed.get(UtilsService);
  });
});
