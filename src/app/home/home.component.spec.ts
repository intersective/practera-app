import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

import { HomeComponent } from './home.component';
import { Intercom } from 'ng-intercom';
import { HomeService } from './home.service';
import { FastFeedbackService } from '@app/fast-feedback/fast-feedback.service';
import { AchievementsService } from '@app/achievements/achievements.service';
import { EventsService } from '@app/events/events.service';
import { BrowserStorageService } from '@services/storage.service';
import { of } from 'rxjs';

fdescribe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let element: HTMLElement;
  let homeServiceSpy: jasmine.SpyObj<HomeService>;
  let eventsServiceSpy: jasmine.SpyObj<EventsService>;
  let achieventsServiceSpy: jasmine.SpyObj<AchievementsService>;
  let fastFeedbackServiceSpy: jasmine.SpyObj<FastFeedbackService>;
  let storageServiceSpy: jasmine.SpyObj<BrowserStorageService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [HomeComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: HomeService,
          useValue: jasmine.createSpyObj('HomeService', ['getTodoItems', 'getChatMessage', 'getProgress', 'getCurrentActivity', 'getProgramName'])
        },
        {
          provide: EventsService,
          useValue: jasmine.createSpyObj('EventsService', ['getEvents', 'eventDetailPopUp'])
        },
        {
          provide: AchievementsService,
          useValue: jasmine.createSpyObj('AchievementsService', ['getAchievements'])
        },
        {
          provide: FastFeedbackService,
          useValue: jasmine.createSpyObj('FastFeedbackService', ['pullFastFeedback'])
        },
        {
          provide: BrowserStorageService,
          // we've already used BrowserStorageService in the constructor(), so we have to mock the return data when defined
          useValue: jasmine.createSpyObj('BrowserStorageService', {
            'getUser': {
              role: 'participant',
              teamId: 1,
              name: 'Test User',
              email: 'user@test.com',
              id: 1
            }
          })
        },
        {
          provide: Intercom
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    homeServiceSpy = TestBed.get(HomeService);
    eventsServiceSpy = TestBed.get(EventsService);
    achieventsServiceSpy = TestBed.get(AchievementsService);
    fastFeedbackServiceSpy = TestBed.get(FastFeedbackService);
    storageServiceSpy = TestBed.get(BrowserStorageService);
  });

  beforeEach(() => {
    homeServiceSpy.getTodoItems.and.returnValue(of([]));
    homeServiceSpy.getChatMessage.and.returnValue(of([]));
    homeServiceSpy.getCurrentActivity.and.returnValue(of({}));
    homeServiceSpy.getProgramName.and.returnValue(of('Test Program'));
    homeServiceSpy.getProgress.and.returnValue(of(10));
    achieventsServiceSpy.getAchievements.and.returnValue(of([]));
    eventsServiceSpy.getEvents.and.returnValue(of([]));
    fastFeedbackServiceSpy.pullFastFeedback.and.returnValue(of({}));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display no todo card if there\'s no todo item', () => {
    fixture.detectChanges();
    expect(component.todoItems).toEqual([], 'no todo item');
    expect(component.loadingTodoItems).toBe(false, 'todo item loaded');
    expect(homeServiceSpy.getTodoItems.calls.count()).toBe(1, 'one call');
    expect(element.querySelectorAll('app-todo-card').length).toBe(1, 'one todo card');
  });

  it('should display 2 todo cards if there\'re 2 todo items', () => {
    homeServiceSpy.getTodoItems.and.returnValue(of([
      {
        type: 'feedback_available',
        name: 'Test todo item1',
        description: 'Test description',
        time: '2019-03-02'
      },
      {
        type: 'review_submission',
        name: 'Test todo item2',
        description: 'Test description',
        time: '2019-03-03'
      }
    ]));
    fixture.detectChanges();
    expect(component.todoItems.length).toEqual(2, '2 todo items');
    expect(component.loadingTodoItems).toBe(false, 'todo item loaded');
    expect(homeServiceSpy.getTodoItems.calls.count()).toBe(1, 'one call');
    expect(element.querySelectorAll('app-todo-card').length).toBe(2, '2 todo cards');
  });

  it('should display the correct program name', () => {
    fixture.detectChanges();
    expect(component.programName).toEqual('Test Program');
    expect(homeServiceSpy.getProgramName.calls.count()).toBe(1, 'one call');
    expect(element.querySelector('h1').innerHTML).toEqual('Test Program', 'program name match');
  });

  it('should not display event icon if there\'s no event', () => {
    fixture.detectChanges();
    expect(component.haveEvents).toBeFalsy();
    expect(eventsServiceSpy.getEvents.calls.count()).toBe(1, 'one call');
    expect(element.querySelector('ion-icon.calendar')).toBeFalsy();
  });
});
