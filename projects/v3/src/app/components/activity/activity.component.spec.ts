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

  describe('leadIcon()', () => {
    it('should generate task label according to type (Locked/Topic/Assessment)', () => {
      expect(component.leadIcon({ type: 'Locked' } as any)).toEqual('lock-closed');
      expect(component.leadIcon({ type: 'Topic' } as any)).toEqual('reader');
      expect(component.leadIcon({ type: 'Assessment' } as any)).toEqual('eye');
    });
  });

  describe('subtitle()', () => {
    it('should generate subtitle for Assessment task', () => {
      const result = component.subtitle({
        type: 'Assessment',
        isForTeam: false,
        dueDate: 'dummy/date',
        isOverdue: false,
      } as any);
      expect(result).toContain('<strong>Due Date</strong>:');
    });

    it('should be null when not an assessment task', () => {
      const result = component.subtitle({
        type: 'Topic'
      } as any);
      expect(result).toEqual('');
    });

    it('should show awaiting other team member working on a task', () => {
      const result = component.subtitle({
        type: 'Assessment',
        isForTeam: true,
        isLocked: true,
        submitter: {
          name: 'unit tester'
        },
      } as any);
      expect(result).toEqual('unit tester is working on this');
    });
  });
});
