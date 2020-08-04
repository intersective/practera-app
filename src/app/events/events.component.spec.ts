import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EventsComponent } from './events.component';
import { EventListModule } from '../event-list/event-list.module';
import { EventDetailModule } from '../event-detail/event-detail.module';
import { AssessmentModule } from '../assessment/assessment.module';
import { Observable, of, pipe } from 'rxjs';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { ActivatedRouteStub } from '@testing/activated-route-stub';
import { MockRouter } from '@testing/mocked.service';
import { Apollo } from 'apollo-angular';

describe('EventsComponent', () => {
  let component: EventsComponent;
  let fixture: ComponentFixture<EventsComponent>;
  let routeSpy: ActivatedRoute;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ EventListModule, EventDetailModule, AssessmentModule ],
      declarations: [ EventsComponent ],
      providers: [
        Apollo,
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ activity_id: 1, event_id: 2 })
            }
          }
        },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsComponent);
    component = fixture.componentInstance;
    routeSpy = TestBed.inject(ActivatedRoute);
    // mock the activity object
    component.eventList = { onEnter() {} };
    // spy on the onEnter function
    spyOn(component.eventList, 'onEnter');
    // mock the assessment object
    component.assessment = { onEnter() {} };
    // spy on the onEnter function
    spyOn(component.assessment, 'onEnter');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onEnter() should get correct data', fakeAsync(() => {
    component.onEnter();
    expect(component.activityId).toEqual(1);
    expect(component.eventId).toEqual(2);
    expect(component.assessmentId).toBeNull();
    expect(component.currentEvent).toBeNull();
    tick();
    expect(component.eventList.onEnter).toHaveBeenCalled();
  }));

  it('goto() should get correct data', () => {
    const event = {
      id: 11,
      name: 'event',
      description: 'des',
      location: 'location',
      activityId: 1,
      activityName: 'activity',
      startTime: '',
      endTime: '',
      capacity: 10,
      remainingCapacity: 1,
      isBooked: true,
      singleBooking: true,
      canBook: true,
    };
    component.goto(event);
    expect(component.currentEvent).toEqual(event);
    expect(component.eventId).toEqual(11);
    expect(component.assessmentId).toBeNull();
    expect(component.contextId).toBeNull();
  });

  it('checkin() should get correct data', fakeAsync(() => {
    const params = {
      assessmentId: 1,
      contextId: 2
    };
    component.checkin(params);
    expect(component.assessmentId).toEqual(1);
    expect(component.contextId).toEqual(2);
    tick();
    expect(component.assessment.onEnter).toHaveBeenCalled();
  }));

});
