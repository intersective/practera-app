import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { EventListComponent } from './event-list.component';
import { EventListService } from './event-list.service';
import { Observable, of, pipe } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { UtilsService } from '@services/utils.service';
import { ActivatedRouteStub } from '@testing/activated-route-stub';
import { TestUtils } from '@testing/utils';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { MockRouter } from '@testing/mocked.service';

class Page {
  get eventItems() {
    return this.queryAll<HTMLElement>('app-list-item');
  }
  fixture: ComponentFixture<EventListComponent>;

  constructor(fixture: ComponentFixture<EventListComponent>) {
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

describe('EventListComponent', () => {
  let component: EventListComponent;
  let fixture: ComponentFixture<EventListComponent>;
  let page: Page;
  let eventsSpy: jasmine.SpyObj<EventListService>;
  let utils: UtilsService;
  const testUtils = new TestUtils();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [ EventListComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        UtilsService,
        NewRelicService,
        {
          provide: EventListService,
          useValue: jasmine.createSpyObj('EventListService', ['getEvents', 'getActivities'])
        },
        {
          provide: Router,
          useClass: MockRouter
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
    fixture = TestBed.createComponent(EventListComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    eventsSpy = TestBed.inject(EventListService) as jasmine.SpyObj<EventListService>;
    utils = TestBed.inject(UtilsService);
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
      name: 'activity' + i
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
    let tmpActivities;
    let expectedEvents;
    let expectedCategorised;
    // call this function after onEnter
    let functionAfterOnEnter;
    beforeEach(() => {
      tmpEvents = JSON.parse(JSON.stringify(mockEvents));
      tmpActivities = JSON.parse(JSON.stringify(mockActivities));
      component.eventId = null;
      functionAfterOnEnter = () => {};
      expectedEvents = browse;
      expectedCategorised = {
        browse: browse,
        booked: booked,
        attended: attended
      };
    });

    afterEach(fakeAsync(() => {
      eventsSpy.getEvents.and.returnValue(of(tmpEvents));
      tick();
      component.onEnter();
      if (functionAfterOnEnter) {
        functionAfterOnEnter();
      }
      expect(component.loadingEvents).toBe(false);
      expect(eventsSpy.getEvents.calls.count()).toBe(1);
      expect(component.events).toEqual(expectedEvents);
      expect(component.eventsCategorised).toEqual(expectedCategorised);
      expect(eventsSpy.getActivities.calls.count()).toBe(1);
      expect(component.activities).toEqual(tmpActivities);
    }));

    it(`should get correct full events grouped and activities`, () => {});

    it(`should get correct events grouped without browse`, () => {
      tmpEvents.splice(0, 4);
      expectedEvents = [];
      expectedCategorised.browse = [];
      // activity list only include activity that has event
      tmpActivities = [{ id: 2, name: 'activity2' }];
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
      component.activityId = 1;
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

    it(`should get correct events grouped (browse) and filtered by activity if eventId passed in`, () => {
      component.eventId = 1;
      component.activityId = 2;
      expectedEvents = [
        { // group 1
          date: utils.utcToLocal(startTimes[0], 'date'),
          events: [mockEvents[1]]
        }
      ];
    });
    it(`should get correct events grouped (browse) and filtered by activity`, () => {
      component.activityId = 2;
      expectedEvents = [
        { // group 1
          date: utils.utcToLocal(startTimes[0], 'date'),
          events: [mockEvents[1]]
        }
      ];
      functionAfterOnEnter = () => component.showBrowse();
    });

    it(`should get correct events grouped (booked) and filtered by activity if eventId passed in`, () => {
      component.eventId = 5;
      component.activityId = 2;
      expectedEvents = booked;
    });
    it(`should get correct events grouped (booked) and filtered by activity if eventId passed in`, () => {
      component.activityId = 2;
      expectedEvents = booked;
      functionAfterOnEnter = () => component.showBooked();
    });

    it(`should get correct events grouped (attended) and filtered by activity if eventId passed in`, () => {
      component.eventId = 6;
      component.activityId = 2;
      expectedEvents = attended;
    });
    it(`should get correct events grouped (attended) and filtered by activity if eventId passed in`, () => {
      component.activityId = 2;
      expectedEvents = attended;
      functionAfterOnEnter = () => component.showAttended();
    });
  });

});

