import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EventDetailComponent } from './event-detail.component';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { EventService } from '@v3/services/event.service';
import { ComponentsModule } from '@v3/components/components.module';
import { UtilsService } from '@v3/services/utils.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { TestUtils } from '@testingv3/utils';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ModalController } from '@ionic/angular';
import { BrowserStorageService } from '@v3/services/storage.service';

class Page {
  get eventName() {
    return this.query<HTMLElement>('h1');
  }
  get activityName() {
    return this.query<HTMLElement>('.div-activity-name');
  }
  get expired() {
    return this.query<HTMLElement>('.expired-text');
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

describe('EventDetailComponent', () => {
  let component: EventDetailComponent;
  let fixture: ComponentFixture<EventDetailComponent>;
  let page: Page;
  let serviceSpy: jasmine.SpyObj<EventService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let utils: UtilsService;
  let notificationSpy: jasmine.SpyObj<NotificationsService>;
  let modalSpy: jasmine.SpyObj<ModalController>;
  const testUtils = new TestUtils();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ComponentsModule, BrowserAnimationsModule],
      declarations: [EventDetailComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: EventService,
          useValue: jasmine.createSpyObj('EventService', ['cancelEvent', 'bookEvent'])
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', {
            getBookedEventActivityIds: [2],
            getUser: {
              truncateDescription: true
            },
            setBookedEventActivityIds: () => { },
            removeBookedEventActivityIds: () => { }
          })
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', ['alert'])
        },
        {
          provide: ModalController,
          useValue: {
            dismiss: jasmine.createSpy('dismiss')
          }
        },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventDetailComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    serviceSpy = TestBed.inject(EventService) as jasmine.SpyObj<EventService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    utils = TestBed.inject(UtilsService);
    notificationSpy = TestBed.inject(NotificationsService) as jasmine.SpyObj<NotificationsService>;
    modalSpy = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
  });

  beforeEach(() => {
    serviceSpy.bookEvent.and.returnValue(of({}));
    serviceSpy.cancelEvent.and.returnValue(of({ success: true }));
  });

  const mockEvent = {
    id: 1,
    name: 'event',
    description: 'des',
    location: 'location',
    activityId: 2,
    activityName: 'activity2',
    startTime: testUtils.getDateString(-2, 0),
    endTime: testUtils.getDateString(-2, 0),
    capacity: 10,
    remainingCapacity: 1,
    isBooked: false,
    singleBooking: true,
    canBook: true,
    isPast: true,
    assessment: null,
    allDay: false
  };

  it('should create', () => {
    expect(component).toBeDefined();
  });

  describe('when testing buttonText and confirmed()', () => {
    let tmpEvent;
    let expected;
    const confirmedExpectedArray = [];
    beforeEach(() => {
      tmpEvent = JSON.parse(JSON.stringify(mockEvent));
    });
    afterEach(() => {
      component.event = tmpEvent;
      fixture.detectChanges();
      component.event = tmpEvent;
      expect(component.buttonText.label).toEqual(expected);
      expect(page.eventName.innerHTML).toEqual(tmpEvent.name);
      expect(page.activityName.innerHTML).toEqual(tmpEvent.activityName);
      if (expected === 'Expired') {
        expect(page.expired).toBeTruthy();
      } else {
        expect(page.expired).toBeFalsy();
      }
      expect(page.date.innerHTML).toEqual(`${utils.utcToLocal(tmpEvent.startTime, 'date')}, ${utils.utcToLocal(tmpEvent.startTime, 'time')} - ${utils.utcToLocal(tmpEvent.endTime, 'time')}`);
      // expect(page.time.innerHTML).toEqual(`${utils.utcToLocal(tmpEvent.startTime, 'time')} - ${utils.utcToLocal(tmpEvent.endTime, 'time')}`);
      expect(page.location.innerHTML).toEqual(tmpEvent.location);
      expect(page.capacity.innerHTML).toEqual(`${tmpEvent.remainingCapacity} Seats Available Out of ${tmpEvent.capacity}`);
      if (expected) {
        expect(page.button.innerHTML.trim()).toEqual(expected);
      }
    });

    it(`should return 'Expired' if the event is not booked and is past`, () => {
      tmpEvent.isBooked = false;
      tmpEvent.isPast = true;
      expected = 'Expired';
    });

    describe(`should return 'Book' if the event is not booked and is not past`, () => {
      beforeEach(() => {
        tmpEvent.isBooked = false;
        tmpEvent.isPast = false;
        tmpEvent.remainingCapacity = 1;
        tmpEvent.canBook = true;
        expected = 'Book';
      });

      it(`should display Book as the button text`, () => { });

      it(`should pop up alert if it is single booking`, () => {
        tmpEvent.singleBooking = true;
        component.event = tmpEvent;
        fixture.detectChanges();
        component.event = tmpEvent;
        component.confirmed('Enter');
        expected = 'Cancel Booking';
        expect(notificationSpy.alert.calls.count()).toBe(1);
        expect(serviceSpy.bookEvent.calls.count()).toBe(0);

        const button = notificationSpy.alert.calls.first().args[0].buttons[0];
        (typeof button == 'string') ? button : button.handler(true);

        expect(serviceSpy.bookEvent.calls.count()).toBe(1);
        // expect(modalSpy.dismiss.calls.count()).toEqual(1);
      });

      it(`should book event directly it is single booking and there is no booking under this activity`, () => {
        tmpEvent.singleBooking = true;
        tmpEvent.activityId = 3;
        component.event = tmpEvent;
        fixture.detectChanges();
        component.confirmed('Enter');
        expected = 'Cancel Booking';
        expect(notificationSpy.alert.calls.count()).toBe(1);
        expect(serviceSpy.bookEvent.calls.count()).toBe(1);
        // expect(modalSpy.dismiss.calls.count()).toEqual(1);
      });

      it(`should book event directly it is not single booking`, () => {
        tmpEvent.singleBooking = false;
        component.event = tmpEvent;
        fixture.detectChanges();
        component.confirmed('Enter');
        expected = 'Cancel Booking';
        expect(notificationSpy.alert.calls.count()).toBe(1);
        expect(serviceSpy.bookEvent.calls.count()).toBe(1);
        // expect(modalSpy.dismiss.calls.count()).toEqual(1);
      });
    });

    it(`should return 'Fully Booked' if the event capacity is full`, () => {
      tmpEvent.isBooked = false;
      tmpEvent.isPast = false;
      tmpEvent.remainingCapacity = 0;
      tmpEvent.canBook = true;
      expected = 'Fully Booked';
    });

    describe(`should return 'Cancel Booking' if the event is booked and is not started`, () => {
      beforeEach(() => {
        tmpEvent.isBooked = true;
        tmpEvent.isPast = false;
        expected = 'Cancel Booking';
      });

      it(`should display 'Cancel Booking' before confirm`, () => { });

      it(`should cancel booking if confirmed`, () => {
        component.event = tmpEvent;
        fixture.detectChanges();
        component.confirmed('Enter');
        expected = 'Book';
        expect(notificationSpy.alert.calls.count()).toBe(1);
        expect(serviceSpy.cancelEvent.calls.count()).toBe(1);
        // expect(modalSpy.dismiss.calls.count()).toEqual(1);
      });
    });

    it(`should return false if the event is attended and there's no check in assessment`, () => {
      tmpEvent.isBooked = true;
      tmpEvent.isPast = true;
      tmpEvent.assessment = null;
      expected = false;
    });

    it(`should return 'View Check In' if the event's check in assessment is done`, () => {
      tmpEvent.isBooked = true;
      tmpEvent.isPast = true;
      tmpEvent.assessment = {
        id: 1,
        contextId: 2,
        isDone: true
      };
      expected = 'View Check In';

      component.event = tmpEvent;
      fixture.detectChanges();
      // make sure this component emit the data to parent component
      component.checkin.subscribe(event =>
        expect(event).toEqual({
          assessmentId: 1,
          contextId: 2
        })
      );
      component.confirmed('Enter');
      // expect(routerSpy.navigate.calls.first().args[0]).toEqual(['assessment', 'event', 2, 1]);
      // expect(modalSpy.dismiss.calls.count()).toEqual(1);
    });

    it(`should return 'Check In' if the event is booked`, () => {
      tmpEvent.isBooked = true;
      tmpEvent.isPast = true;
      tmpEvent.assessment = {
        id: 1,
        contextId: 2,
        isDone: false
      };
      expected = 'Check In';

      component.event = tmpEvent;
      fixture.detectChanges();
      // make sure this component emit the data to parent component
      component.checkin.subscribe(event =>
        expect(event).toEqual({
          assessmentId: 1,
          contextId: 2
        })
      );
      component.confirmed('Enter');
      // expect(routerSpy.navigate.calls.first().args[0]).toEqual(['assessment', 'event', 2, 1]);
      // expect(modalSpy.dismiss.calls.count()).toEqual(1);
    });
  });

  it('when testing close(), it should dismiss the modal controller', () => {
    component.close();
    // expect(modalSpy.dismiss.calls.count()).toEqual(1);
  });

  it('when testing confirmed(), it should not do anything if keyboard event key is not enter or space', () => {
    const keyEvent = new KeyboardEvent('keydown', { code: 'Digit0' });
    component.confirmed(keyEvent);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(notificationSpy.alert).not.toHaveBeenCalled();
  });

  describe(`getEventDate()`, () => {
    let tmpEvent;
    let expected;
    beforeEach(() => {
      tmpEvent = JSON.parse(JSON.stringify(mockEvent));
    });
    it(`should return date and 'All Day' as time`, () => {
      tmpEvent.startTime = testUtils.getDateString(-2, 0);
      tmpEvent.endTime = testUtils.getDateString(-2, 0);
      tmpEvent.allDay = true;
      component.event = tmpEvent;
      fixture.detectChanges();
      expected = `${utils.utcToLocal(tmpEvent.startTime, 'date')}, All Day`;
      const result = component.getEventDate();
      expect(result).toBe(expected);
    });

    it(`should return date with start and end time`, () => {
      tmpEvent.startTime = testUtils.getDateString(-2, 0);
      tmpEvent.endTime = testUtils.getDateString(-2, 0);
      tmpEvent.allDay = false;
      component.event = tmpEvent;
      fixture.detectChanges();
      expected = `${utils.utcToLocal(tmpEvent.startTime, 'date')}, ${utils.utcToLocal(tmpEvent.startTime, 'time')} - ${utils.utcToLocal(tmpEvent.endTime, 'time')}`;
      const result = component.getEventDate();
      expect(result).toBe(expected);
    });

    it(`should return start and end date with start and end time`, () => {
      tmpEvent.startTime = testUtils.getDateString(-2, 0);
      tmpEvent.endTime = testUtils.getDateString(-4, 0);
      tmpEvent.allDay = false;
      component.event = tmpEvent;
      const startDayTime = `${utils.utcToLocal(tmpEvent.startTime, 'date')}, ${utils.utcToLocal(tmpEvent.startTime, 'time')}`;
      const endDayTime = `${utils.utcToLocal(tmpEvent.endTime, 'date')}, ${utils.utcToLocal(tmpEvent.endTime, 'time')}`;
      expected = `${startDayTime} - ${endDayTime}`;
      fixture.detectChanges();
      const result = component.getEventDate();
      expect(result).toBe(expected);
    });
  });

});

