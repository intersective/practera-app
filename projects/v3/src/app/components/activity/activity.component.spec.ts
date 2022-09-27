import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TestUtils } from '@testingv3/utils';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { UtilsService } from '@v3/app/services/utils.service';

import { ActivityComponent } from './activity.component';

class Page {
  get activityName() {
    return this.query<HTMLElement>('h1');
  }
  get activityDescription() {
    return this.query<HTMLElement>('app-description');
  }
  get taskItems() {
    return this.queryAll<HTMLElement>('#tasks-card clickable-item');
  }
  get taskNames() {
    return this.queryAll<HTMLElement>('#tasks-card clickable-item h4');
  }
  get eventItems() {
    return this.queryAll<HTMLElement>('#events-card clickable-item');
  }
  fixture: ComponentFixture<ActivityComponent>;

  constructor(fixture: ComponentFixture<ActivityComponent>) {
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

describe('ActivityComponent', () => {
  let component: ActivityComponent;
  let fixture: ComponentFixture<ActivityComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityComponent ],
      providers: [
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', ['alert']),
        },
      ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
