import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EventsComponent } from './events.component';
import { ActivityModule } from '../activity/activity.module';
import { TopicModule } from '../topic/topic.module';
import { AssessmentModule } from '../assessment/assessment.module';
import { Observable, of, pipe } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { ActivatedRouteStub } from '@testing/activated-route-stub';
import { MockRouter } from '@testing/mocked.service';
import { BrowserStorageService } from '@services/storage.service';

describe('EventsComponent', () => {
  let component: EventsComponent;
  let fixture: ComponentFixture<EventsComponent>;
  let routeStub: ActivatedRouteStub;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;

  // beforeEach(async(() => {
  //   TestBed.configureTestingModule({
  //     imports: [ ActivityModule, TopicModule, AssessmentModule ],
  //     declarations: [ EventsComponent ],
  //     providers: [
  //       {
  //         provide: Router,
  //         useClass: MockRouter
  //       },
  //       {
  //         provide: ActivatedRoute,
  //         useValue: new ActivatedRouteStub({ id: 1 })
  //       },
  //       {
  //         provide: BrowserStorageService,
  //         useValue: jasmine.createSpyObj('BrowserStorageService', ['getUser'])
  //       },
  //     ]
  //   })
  //   .compileComponents();
  // }));

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(EventsComponent);
  //   component = fixture.componentInstance;
  //   routeStub = TestBed.get(ActivatedRoute);
  //   storageSpy = TestBed.get(BrowserStorageService);
  //   // mock the activity object
  //   component.eventList = { onEnter() {} };
  //   // mock the event detail object
  //   component.eventDetail = { onEnter() {} };
  //   // mock the assessment object
  //   component.assessment = { onEnter() {} };
  // });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });

});
