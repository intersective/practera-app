import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { UtilsService } from '@v3/services/utils.service';
import { IonicModule } from '@ionic/angular';

import { EventsPage } from './events.page';
import { ActivatedRouteStub } from '@testingv3/activated-route-stub';
import { TestUtils } from '@testingv3/utils';

describe('EventsPage', () => {
  let component: EventsPage;
  let fixture: ComponentFixture<EventsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EventsPage ],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: new ActivatedRouteStub({
            activity_id: 1,
            event_id: 1,
          }),
        },
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.eventList = {
      onEnter: jasmine.createSpy(),
    };
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('goto()', () => {
    it('should display selected event', () => {
      const spy = spyOn<any>(component['document'], 'getElementById').and.returnValue({ focus: jasmine.createSpy() });
      const curEvent = {
        id: 1,
        isMultiDay: false,
        multiDayInfo: {
          id: 1
        },
      };
      component.goto(curEvent);
      expect(component.currentEvent).toEqual(jasmine.objectContaining(curEvent));
      expect(component.eventId).toEqual(curEvent.id);
      expect(spy).toHaveBeenCalledWith('eventDetail');
    });
  });

  describe('checkin()', () => {
    it('should check-in an event', fakeAsync(() => {
      component.assessment = {
        onEnter: () => true,
      };
      const spy = spyOn(component.assessment, 'onEnter');
      component.checkin({
        assessmentId: 1,
        contextId: 2,
      });

      expect(component.assessmentId).toEqual(1);
      expect(component.contextId).toEqual(2);
      tick(500);
      expect(spy).toHaveBeenCalled();
    }));

    it('should return void when id not provided', () => {
      expect(component.checkin({
        assessmentId: null,
        contextId: 2,
      })).toEqual(undefined);

      expect(component.checkin({
        assessmentId: 1,
        contextId: null,
      })).toEqual(undefined);

      expect(component.checkin({
        assessmentId: null,
        contextId: null,
      })).toEqual(undefined);
    });
  });
});
