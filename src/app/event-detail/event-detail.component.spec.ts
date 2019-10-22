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
import { ModalController } from '@ionic/angular';

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

describe('EventDetailComponent', () => {
  let component: EventDetailComponent;
  let fixture: ComponentFixture<EventDetailComponent>;
  let page: Page;
  let serviceSpy: jasmine.SpyObj<EventDetailService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let utils: UtilsService;
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  let modalSpy: jasmine.SpyObj<ModalController>;
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
    serviceSpy = TestBed.get(EventDetailService);
    routerSpy = TestBed.get(Router);
    utils = TestBed.get(UtilsService);
    notificationSpy = TestBed.get(NotificationService);
    modalSpy = TestBed.get(ModalController);
  });

  beforeEach(() => {
    serviceSpy.bookEvent.and.returnValue(of({}));
    serviceSpy.cancelEvent.and.returnValue(of({success: true}));
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
    assessment: null
  };

  it('should create', () => {
    expect(component).toBeDefined();
  });

  describe('when testing buttonText() and confirmed()', () => {
    let tmpEvent;
    let expected;
    const confirmedExpectedArray = [];
    beforeEach(() => {
      tmpEvent = JSON.parse(JSON.stringify(mockEvent));
    });
    afterEach(() => {
      component.event = tmpEvent;
      fixture.detectChanges();
      expect(component.buttonText()).toEqual(expected);
      expect(page.eventName.innerHTML).toEqual(tmpEvent.name);
      expect(page.activityName.innerHTML).toEqual(tmpEvent.activityName);
      if (expected === 'Expired') {
        expect(page.expired).toBeTruthy();
      } else {
        expect(page.expired).toBeFalsy();
      }
      expect(page.date.innerHTML).toEqual(utils.utcToLocal(tmpEvent.startTime, 'date'));
      expect(page.time.innerHTML).toEqual(`${utils.utcToLocal(tmpEvent.startTime, 'time')} - ${utils.utcToLocal(tmpEvent.endTime, 'time')}`);
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

    describe(`should return 'Booked' if the event is not booked and is past`, () => {
      beforeEach(() => {
        tmpEvent.isBooked = false;
        tmpEvent.isPast = false;
        tmpEvent.remainingCapacity = 1;
        tmpEvent.canBook = true;
        expected = 'Book';
      });

      it(`should pop up alert if it is single booking`, () => {
        tmpEvent.singleBooking = true;
        component.event = tmpEvent;
        fixture.detectChanges();
        component.confirmed();
        expect(notificationSpy.alert.calls.count()).toBe(1);
        expect(serviceSpy.bookEvent.calls.count()).toBe(0);
        notificationSpy.alert.calls.first().args[0].buttons[0].handler();
        expect(serviceSpy.bookEvent.calls.count()).toBe(1);
        expect(modalSpy.dismiss.calls.count()).toEqual(1);
      });

      it(`should book event directly it is not single booking`, () => {
        tmpEvent.singleBooking = false;
        component.event = tmpEvent;
        fixture.detectChanges();
        component.confirmed();
        expect(notificationSpy.alert.calls.count()).toBe(1);
        expect(serviceSpy.bookEvent.calls.count()).toBe(1);
        expect(modalSpy.dismiss.calls.count()).toEqual(1);
      });
    });

    it(`should return false if the event capacity is full`, () => {
      tmpEvent.isBooked = false;
      tmpEvent.isPast = false;
      tmpEvent.remainingCapacity = 0;
      tmpEvent.canBook = true;
      expected = false;
    });

    describe(`should return 'Cancel Booking' if the event is booked and is not started`, () => {
      beforeEach(() => {
        tmpEvent.isBooked = true;
        tmpEvent.isPast = false;
        expected = 'Cancel Booking';
      });

      it(`should cancel booking if confirmed`, () => {
        component.event = tmpEvent;
        fixture.detectChanges();
        component.confirmed();
        expect(notificationSpy.alert.calls.count()).toBe(1);
        expect(serviceSpy.cancelEvent.calls.count()).toBe(1);
        expect(modalSpy.dismiss.calls.count()).toEqual(1);
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
      component.confirmed();
      expect(routerSpy.navigate.calls.first().args[0]).toEqual(['assessment', 'event', 2, 1]);
      expect(modalSpy.dismiss.calls.count()).toEqual(1);
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
      component.confirmed();
      expect(routerSpy.navigate.calls.first().args[0]).toEqual(['assessment', 'event', 2, 1]);
      expect(modalSpy.dismiss.calls.count()).toEqual(1);
    });
  });

  it('when testing close(), it should dismiss the modal controller', () => {
    component.close();
    expect(modalSpy.dismiss.calls.count()).toEqual(1);
  });

});

