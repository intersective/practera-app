import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
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
});
