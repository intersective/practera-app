import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

import { DueDatesComponent } from './due-dates.component';
import { DueDatesService } from './due-dates.service';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { AssessmentService } from '@v3/app/services/assessment.service';
import { UtilsService } from '@v3/services/utils.service';
import { TestUtils } from '@testingv3/utils';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('DueDatesComponent', () => {
  let component: DueDatesComponent;
  let fixture: ComponentFixture<DueDatesComponent>;
  let dueDatesService: jasmine.SpyObj<DueDatesService>;
  let assessmentService: jasmine.SpyObj<AssessmentService>;
  let notificationsService: jasmine.SpyObj<NotificationsService>;
  let router: jasmine.SpyObj<Router>;

  const dueAssessments = [
    {
      id: 1,
      name: 'Assessment A',
      description: 'Description A',
      dueDate: '2026-03-01 10:30:00',
      contextId: 10,
      activityId: 20,
    },
    {
      id: 2,
      name: 'Assessment B',
      description: 'Description B',
      dueDate: null,
      contextId: 11,
      activityId: 21,
    },
  ] as any;

  beforeEach(waitForAsync(() => {
    const dueStatusSubject = new Subject<any[]>();

    TestBed.configureTestingModule({
      declarations: [ DueDatesComponent ],
      imports: [IonicModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: UtilsService, useClass: TestUtils },
        {
          provide: DueDatesService,
          useValue: jasmine.createSpyObj('DueDatesService', ['createCalendarEvent', 'generateGoogleCalendarUrl']),
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', ['alert']),
        },
        {
          provide: AssessmentService,
          useValue: jasmine.createSpyObj('AssessmentService', ['dueStatusAssessments']),
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', ['navigate']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DueDatesComponent);
    component = fixture.componentInstance;
    dueDatesService = TestBed.inject(DueDatesService) as jasmine.SpyObj<DueDatesService>;
    assessmentService = TestBed.inject(AssessmentService) as jasmine.SpyObj<AssessmentService>;
    notificationsService = TestBed.inject(NotificationsService) as jasmine.SpyObj<NotificationsService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    (assessmentService.dueStatusAssessments as jasmine.Spy).and.returnValue(dueStatusSubject.asObservable());
    dueStatusSubject.next([]);
    dueStatusSubject.complete();

    dueDatesService.generateGoogleCalendarUrl.and.returnValue('https://calendar.google.com/test-url');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize filteredAssessments$ in ngOnInit', fakeAsync(() => {
    component.ngOnInit();
    component.assessments$.next(component.groupByDate([dueAssessments[0]]));
    component.searchText$.next({ target: { value: 'assessment a' } });
    let result: any;

    component.filteredAssessments$.subscribe(res => result = res);
    tick(250);

    expect(result.length).toBe(1);
    expect(result[0].assessments.length).toBe(1);
  }));

  it('should keep all groups when search query is whitespace', fakeAsync(() => {
    component.ngOnInit();
    const groups = component.groupByDate(dueAssessments);
    component.assessments$.next(groups);
    component.searchText$.next({ target: { value: '   ' } });
    let result: any;

    component.filteredAssessments$.subscribe(res => result = res);
    tick(250);

    expect(result).toEqual(groups);
  }));

  it('should group assessments by month and place no due date last', () => {
    const grouped = component.groupByDate(dueAssessments);

    expect(grouped.length).toBe(2);
    expect(grouped[grouped.length - 1].month).toBe('No due date');
  });

  it('should convert datetime string to tuple array', () => {
    expect(component.convertDateTimeString('2026-03-01 10:30:00')).toEqual([2026, 3, 1, 10, 30]);
  });

  it('should load grouped assessments in ionViewDidEnter when data exists', () => {
    const subject = new Subject<any[]>();
    (assessmentService.dueStatusAssessments as jasmine.Spy).and.returnValue(subject.asObservable());

    component.ionViewDidEnter();
    subject.next([dueAssessments[0]]);
    subject.complete();

    expect(component.isLoading).toBeFalse();
    expect(component.assessments$.value.length).toBe(1);
  });

  it('should set empty assessments when due list is empty', () => {
    (assessmentService.dueStatusAssessments as jasmine.Spy).and.returnValue(of([]));

    component.ionViewDidEnter();

    expect(component.assessments$.value).toEqual([]);
    expect(component.isLoading).toBeFalse();
  });

  it('should handle dueStatusAssessments error in ionViewDidEnter', () => {
    (assessmentService.dueStatusAssessments as jasmine.Spy).and.returnValue(throwError(() => new Error('boom')) as any);

    component.ionViewDidEnter();

    expect(component.isLoading).toBeFalse();
  });

  it('should call createCalendarEvent in downloadiCal success path', () => {
    component.downloadiCal(dueAssessments[0]);

    expect(dueDatesService.createCalendarEvent).toHaveBeenCalled();
  });

  it('should alert on downloadiCal failure', () => {
    dueDatesService.createCalendarEvent.and.callFake(() => {
      throw new Error('ical error');
    });

    component.downloadiCal(dueAssessments[0]);

    expect(notificationsService.alert).toHaveBeenCalled();
  });

  it('should open google calendar URL in new tab', () => {
    spyOn(window, 'open').and.returnValue({} as Window);

    component.downloadGoogleCalendar(dueAssessments[0]);

    expect(dueDatesService.generateGoogleCalendarUrl).toHaveBeenCalled();
    expect(window.open).toHaveBeenCalledWith('https://calendar.google.com/test-url', '_blank');
  });

  it('should alert when google calendar popup is blocked', () => {
    spyOn(window, 'open').and.returnValue(null);

    component.downloadGoogleCalendar(dueAssessments[0]);

    expect(notificationsService.alert).toHaveBeenCalledWith({
      message: 'Please allow pop-ups for this website',
    });
  });

  it('should alert when google calendar URL generation throws', () => {
    dueDatesService.generateGoogleCalendarUrl.and.callFake(() => {
      throw new Error('url error');
    });

    component.downloadGoogleCalendar(dueAssessments[0]);

    expect(notificationsService.alert).toHaveBeenCalledWith({
      message: 'Failed to generate Google calendar URL',
    });
  });

  it('should navigate to activity desktop route in goTo', () => {
    component.goTo(dueAssessments[0]);

    expect(router.navigate).toHaveBeenCalledWith(['v3', 'activity-desktop', 10, 20, 1]);
  });

  it('should complete unsubscribe subject on destroy', () => {
    const nextSpy = spyOn(component.unsubscribe$, 'next');
    const completeSpy = spyOn(component.unsubscribe$, 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
