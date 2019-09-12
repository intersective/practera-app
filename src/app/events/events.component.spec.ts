import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EventsComponent } from './events.component';
import { EventsService } from './events.service';
import { Observable, of, pipe } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { UtilsService } from '@services/utils.service';
import { ActivatedRouteStub } from '@testing/activated-route-stub';
import { TestUtils } from '@testing/utils';

class Page {
  get eventItems() {
    return this.queryAll<HTMLElement>('event-card');
  }
  fixture: ComponentFixture<EventsComponent>;

  constructor(fixture: ComponentFixture<EventsComponent>) {
    this.fixture = fixture;
  }
  //// query helpers ////
  private query<T>(selector: string): T {
    return this.fixture.nativeElement.querySelector(selector);
  }
  private queryAll<T>(selector: string): T[] {
    return this.fixture.nativeElement.querySelectorAll(selector);
  }
}

describe('EventsComponent', () => {
  let component: EventsComponent;
  let fixture: ComponentFixture<EventsComponent>;
  let page: Page;
  let eventsSpy: jasmine.SpyObj<EventsService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routeStub: ActivatedRouteStub;
  let utils: UtilsService;
  const testUtils = new TestUtils();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [ EventsComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        UtilsService,
        {
          provide: EventsService,
          useValue: jasmine.createSpyObj('EventsService', ['getEvents', 'getActivities'])
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
            events: of()
          }
        },
        {
          provide: ActivatedRoute,
          useValue: new ActivatedRouteStub({ activityId: null })
        }
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    eventsSpy = TestBed.get(EventsService);
    routerSpy = TestBed.get(Router);
    routeStub = TestBed.get(ActivatedRoute);
    utils = TestBed.get(UtilsService);
  });

  // data needed to create mock events
  const activityIds = [1, 2, 1, 3, 2, 2];
  const startTimes = [
    testUtils.getDateString(2, 0), // browse group 1
    testUtils.getDateString(2, 1), // browse group 1
    testUtils.getDateString(3, 0), // browse group 2
    testUtils.getDateString(-2, 0), // browse expired
    testUtils.getDateString(2, 0), // booked
    testUtils.getDateString(-2, 0) // attended
  ];
  const isBookeds = [false, false, false, false, true, true];
  const mockEvents = Array.from({length: 6}, (x, i) => {
    return {
      id: i + 1,
      name: 'event' + i,
      description: 'des' + i,
      location: 'location' + i,
      activityId: activityIds[i],
      activityName: 'activity' + activityIds[i],
      startTime: startTimes[i],
      endTime: startTimes[i],
      capacity: 10,
      remainingCapacity: 1,
      isBooked: isBookeds[i],
      singleBooking: true,
      canBook: true,
      isPast: false,
      assessment: null
    };
  });
  const mockActivities = [1, 2, 3].map(i => {
    return {
      id: i,
      name: 'activity' + 1
    };
  });
  let browse;
  let booked;
  let attended;

  beforeEach(() => {
    eventsSpy.getEvents.and.returnValue(of(mockEvents));
    eventsSpy.getActivities.and.returnValue(of(mockActivities));
    browse = [
      { // group 1
        date: utils.utcToLocal(startTimes[0], 'date'),
        events: [mockEvents[0], mockEvents[1]]
      },
      { // group 2
        date: utils.utcToLocal(startTimes[2], 'date'),
        events: [mockEvents[2]]
      },
      { // expired
        date: 'Expired',
        events: [mockEvents[3]]
      }
    ];
    booked = [
      {
        date: utils.utcToLocal(startTimes[4], 'date'),
        events: [mockEvents[4]]
      }
    ];
    attended = [
      {
        date: utils.utcToLocal(startTimes[5], 'date'),
        events: [mockEvents[5]]
      }
    ];
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  describe('when testing onEnter()', () => {
    let tmpEvents;
    let expectedEvents;
    let expectedCategorised;
    beforeEach(() => {
      tmpEvents = JSON.parse(JSON.stringify(mockEvents));
      expectedEvents = browse;
      expectedCategorised = {
        browse: browse,
        booked: booked,
        attended: attended
      };
    });
    afterEach(() => {
      eventsSpy.getEvents.and.returnValue(of(tmpEvents));
      fixture.detectChanges();
      expect(component.loadingEvents).toBe(false);
      expect(eventsSpy.getEvents.calls.count()).toBe(1);
      expect(component.events).toEqual(expectedEvents);
      expect(component.eventsCategorised).toEqual(expectedCategorised);
    });

    it(`should get correct full events grouped and activities`, () => {
      fixture.detectChanges();
      expect(eventsSpy.getActivities.calls.count()).toBe(1);
      expect(component.activities).toEqual(mockActivities);
    });

    it(`should get correct events grouped without browse`, () => {
      tmpEvents.splice(0, 4);
      expectedEvents = [];
      expectedCategorised.browse = [];
    });

    it(`should get correct events grouped without booked`, () => {
      tmpEvents.splice(4, 1);
      expectedCategorised.booked = [];
    });

    it(`should get correct events grouped without attended`, () => {
      tmpEvents.splice(5, 1);
      expectedCategorised.attended = [];
    });

    it(`should get correct events grouped and filtered by activity`, () => {
      routeStub.setParamMap({ activityId: 1 });
      expectedEvents = [
        { // group 1
          date: utils.utcToLocal(startTimes[0], 'date'),
          events: [mockEvents[0]]
        },
        { // group 2
          date: utils.utcToLocal(startTimes[2], 'date'),
          events: [mockEvents[2]]
        }
      ];
    });

    it(`should get correct events grouped (browse) and filtered by activity`, () => {
      routeStub.setParamMap({ activityId: 2 });
      expectedEvents = [
        { // group 1
          date: utils.utcToLocal(startTimes[0], 'date'),
          events: [mockEvents[1]]
        }
      ];
      fixture.detectChanges();
      component.showBrowse();
    });

    it(`should get correct events grouped (booked) and filtered by activity`, () => {
      routeStub.setParamMap({ activityId: 2 });
      expectedEvents = booked;
      fixture.detectChanges();
      component.showBooked();
    });

    it(`should get correct events grouped (attended) and filtered by activity`, () => {
      routeStub.setParamMap({ activityId: 2 });
      expectedEvents = attended;
      fixture.detectChanges();
      component.showAttended();
    });
  });

  it('when testing back(), it should navigate to the correct page', () => {
    component.back();
    expect(routerSpy.navigate.calls.first().args[0]).toEqual(['app', 'home']);
  });

});

