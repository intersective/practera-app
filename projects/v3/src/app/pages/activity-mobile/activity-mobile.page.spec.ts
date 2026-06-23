import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService } from '@v3/services/activity.service';
import { AssessmentService } from '@v3/services/assessment.service';
import { UtilsService } from '@v3/services/utils.service';
import { IonicModule } from '@ionic/angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { ActivityMobilePage } from './activity-mobile.page';
import { of, Subject } from 'rxjs';

describe('ActivityMobilePage', () => {
  let component: ActivityMobilePage;
  let fixture: ComponentFixture<ActivityMobilePage>;
  let routeParams$: Subject<any>;
  let activity$: Subject<any>;
  let submission$: Subject<any>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activityServiceSpy: jasmine.SpyObj<ActivityService>;
  let utilsSpy: jasmine.SpyObj<UtilsService>;

  beforeEach(waitForAsync(() => {
    routeParams$ = new Subject<any>();
    activity$ = new Subject<any>();
    submission$ = new Subject<any>();

    TestBed.configureTestingModule({
      declarations: [ ActivityMobilePage ],
      imports: [IonicModule.forRoot(), HttpClientTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (_key: string) => '1',
              },
            },
            params: routeParams$.asObservable(),
          },
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', ['navigate']),
        },
        {
          provide: ActivityService,
          useValue: jasmine.createSpyObj('ActivityService', ['getActivity', 'goToTask'], {
            activity$: activity$.asObservable(),
          }),
        },
        {
          provide: AssessmentService,
          useValue: jasmine.createSpyObj('AssessmentService', [], {
            submission$: submission$.asObservable(),
          }),
        },
        {
          provide: UtilsService,
          useValue: jasmine.createSpyObj('UtilsService', {
            setPageTitle: undefined,
            getEvent: new Subject(),
          }),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityMobilePage);
    component = fixture.componentInstance;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activityServiceSpy = TestBed.inject(ActivityService) as jasmine.SpyObj<ActivityService>;
    utilsSpy = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load activity and submission data on init', () => {
    routeParams$.next({ id: 1 });
    submission$.next({ id: 10, status: 'in progress' } as any);
    activity$.next({ id: 1, name: 'Activity A' } as any);

    expect(activityServiceSpy.getActivity).toHaveBeenCalledWith(1, false);
    expect(component.submission).toEqual(jasmine.objectContaining({ id: 10 }));
    expect(component.activity).toEqual(jasmine.objectContaining({ id: 1, name: 'Activity A' }));
    expect(utilsSpy.setPageTitle).toHaveBeenCalledWith('Activity A - Practera');
  });

  it('should ignore activity events with non-matching id', () => {
    activity$.next({ id: 999, name: 'Other Activity' } as any);

    expect(component.activity).toBeUndefined();
    expect(utilsSpy.setPageTitle).not.toHaveBeenCalled();
  });

  it('should navigate to assessment task route', () => {
    component.activity = { id: 55 } as any;

    component.goToTask({ id: 9, contextId: 77, type: 'Assessment' } as any);

    expect(activityServiceSpy.goToTask).toHaveBeenCalledWith(jasmine.objectContaining({ id: 9 }), false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['assessment-mobile', 'assessment', 55, 77, 9]);
  });

  it('should navigate to topic task route', () => {
    component.activity = { id: 66 } as any;

    component.goToTask({ id: 3, type: 'Topic' } as any);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['topic-mobile', 66, 3]);
  });

  it('should go back to home', () => {
    component.goBack();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['v3', 'home']);
  });
});
