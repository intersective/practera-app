import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EventDetailComponent } from './event-detail.component';
import { EventDetailService } from './event-detail.service';
import { Observable, of, pipe } from 'rxjs';
import { Router } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { UtilsService } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { TestUtils } from '@testing/utils';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

class Page {
  get eventName() {
    return this.query<HTMLElement>('h1');
  }
  get activityName() {
    return this.query<HTMLElement>('.div-activity-name');
  }
  get expired() {
    return this.query<HTMLElement>('h3.expired-text');
  }
  get date() {
    return this.query<HTMLElement>('#date');
  }
  get time() {
    return this.query<HTMLElement>('#time');
  }
  get location() {
    return this.query<HTMLElement>('#location');
  }
  get capacity() {
    return this.query<HTMLElement>('#capacity');
  }
  get button() {
    return this.query<HTMLElement>('ion-button');
  }

  fixture: ComponentFixture<EventDetailComponent>;
  constructor(fixture: ComponentFixture<EventDetailComponent>) {
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

fdescribe('EventDetailComponent', () => {
  let component: EventDetailComponent;
  let fixture: ComponentFixture<EventDetailComponent>;
  let page: Page;
  let serviceSpy: jasmine.SpyObj<EventDetailService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let utils: UtilsService;
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  const testUtils = new TestUtils();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, BrowserAnimationsModule],
      declarations: [ EventDetailComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        UtilsService,
        {
          provide: EventDetailService,
          useValue: jasmine.createSpyObj('EventDetailService', ['cancelEvent', 'bookEvent'])
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', ['alert'])
        },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventDetailComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    serviceSpy = TestBed.get(EventDetailService);
    routerSpy = TestBed.get(Router);
    utils = TestBed.get(UtilsService);
    notificationSpy = TestBed.get(NotificationService);
  });

  beforeEach(() => {
    serviceSpy.bookEvent.and.returnValue(of({}));
    serviceSpy.cancelEvent.and.returnValue(of({}));
  });

  const mockEvent = {
    id: 1,
    title: 'event',
    description: 'des',
    location: 'location',
    activityId: 2,
    activityName: 'activity2',
    start: testUtils.getDateString(-2, 0),
    end: testUtils.getDateString(-2, 0),
    capacity: 10,
    remainingCapacity: 1,
    isBooked: false,
    singleBooking: true,
    canBook: true,
    isPast: true,
    assessment: null
  };

  it('should create', () => {
    expect(component).toBeDefined();
  });

  describe('when testing buttonText() and confirmed()', () => {
    let tmpEvent;
    let expected;
    beforeEach(() => {
      tmpEvent = JSON.parse(JSON.stringify(mockEvent));
    });
    afterEach(() => {
      component.event = tmpEvent;
      fixture.detectChanges();
      expect(component.buttonText()).toEqual(expected);
    });

    it(`should return 'Expired' if the event is not booked and is past`, () => {
      tmpEvent.isBooked = false;
      tmpEvent.isPast = true;
      expected = 'Expired';
    });

    it(`should return 'Booked' if the event is not booked and is past`, () => {
      tmpEvent.isBooked = false;
      tmpEvent.isPast = false;
      tmpEvent.remainingCapacity = 1;
      tmpEvent.canBook = true;
      expected = 'Book';
    });
  });

  // it('when testing back(), it should navigate to the correct page', () => {
  //   component.back();
  //   expect(routerSpy.navigate.calls.first().args[0]).toEqual(['app', 'home']);
  // });

});

