import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TestUtils } from '@testingv3/utils';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { SharedService } from '@v3/app/services/shared.service';
import { BrowserStorageService } from '@v3/app/services/storage.service';
import { UtilsService } from '@v3/app/services/utils.service';

import { ActivityComponent } from './activity.component';

const mockSubmission = {
  id: 1,
  status: 'in progress',
  answers: [],
  submitterName: 'name',
  modified: '2019-02-02',
  completed: false,
  isLocked: false,
  submitterImage: '',
  reviewerName: 'name'
};

describe('ActivityComponent', () => {
  let component: ActivityComponent;
  let fixture: ComponentFixture<ActivityComponent>;
  let notificationsSpy: NotificationsService;
  let utilsSpy: UtilsService;
  let sharedSpy: SharedService;
  let storageSpy: BrowserStorageService;

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
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', {
            'getUser': {
              teamId: undefined
            },
          }),
        },
        {
          provide: SharedService,
          useValue: jasmine.createSpyObj('SharedService', {
            'getTeamInfo': {
              toPromise: () => Promise.resolve({})
            },
          }),
        }
      ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityComponent);
    component = fixture.componentInstance;
    notificationsSpy = TestBed.inject(NotificationsService) as jasmine.SpyObj<NotificationsService>;
    utilsSpy = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    sharedSpy = TestBed.inject(SharedService) as jasmine.SpyObj<SharedService>;
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

    it('should empty when task is not due', () => {
      const result = component.subtitle({
        type: 'Assessment',
        dueDate: null,
        submitter: {
          name: 'unit tester'
        },
      } as any);
      expect(result).toEqual('');
    });

    it('should empty when task is overdue', () => {
      const result = component.subtitle({
        type: 'Assessment',
        dueDate: 'dummy/date',
        isOverdue: true,
        submitter: {
          name: 'unit tester'
        },
      } as any);
      expect(result).toEqual('');
    });
  });


  describe('label()', () => {
    it('should return "in progress"', () => {
      component.submission = mockSubmission;
      component.submission.status = 'in progress';
      component.submission.isLocked = true;
      expect(component.label({
        type: 'Assessment',
        isForTeam: true,
        isLocked: true,
      } as any)).toEqual('in progress');
    });

    it('should return "overdue"', () => {
      component.submission = mockSubmission;
      component.submission.status = 'in progress';

      expect(component.label({
        type: 'Assessment',
        status: 'in progress',
        isOverdue: true
      } as any)).toEqual('overdue');
    });

    it('should return ""', () => {
      component.submission = mockSubmission;
      component.submission.status = 'in progress';

      expect(component.label({
        type: 'Assessment',
        status: 'in progress',
        isOverdue: false
      } as any)).toEqual('');
    });

    it('should return empty string ("")', () => {
      component.submission = mockSubmission;
      component.submission.isLocked = false;
      component.submission.status = 'published';
      expect(component.label({
        type: 'Assessment',
        status: 'done',
      } as any)).toEqual('');
    });

    it('should return any status', () => {
      component.submission = mockSubmission;
      component.submission.isLocked = false;
      component.submission.status = 'published';
      expect(component.label({
        type: 'Assessment',
        status: 'dummy',
      } as any)).toEqual('dummy');
    });
  });

  describe('labelColor()', () => {
    it('should empty if not assessment or it\'s completed', () => {
      const result = component.labelColor({
        type: 'Assessment',
        status: 'done',
      } as any)
      expect(result).toEqual('');
    });

    it('should return "dark-blue"', () => {
      const result = component.labelColor({
        type: 'Assessment',
        isForTeam: true,
        isLocked: true,
        status: '',
      } as any)
      expect(result).toEqual('dark-blue');
    });

    it('should return "warning black"', () => {
      const result = component.labelColor({
        type: 'Assessment',
        isForTeam: false,
        isLocked: false,
        status: 'pending review',
      } as any)
      expect(result).toEqual('warning black');
    });

    it('should return "success"', () => {
      const result = component.labelColor({
        type: 'Assessment',
        isForTeam: false,
        isLocked: false,
        status: 'feedback available',
      } as any)
      expect(result).toEqual('success');
    });

    it('should return "danger"', () => {
      const result = component.labelColor({
        type: 'Assessment',
        isForTeam: false,
        isLocked: false,
        status: 'in progress',
        isOverdue: true,
      } as any)
      expect(result).toEqual('danger');
    });

    it('should return void', () => {
      const result = component.labelColor({
        type: 'Assessment',
        isForTeam: false,
        isLocked: false,
        status: '',
      } as any)
      expect(result).toEqual('');
    });
  });

  describe('endingIcon()', () => {
    it('should return lock-closed', () => {
      const result = component.endingIcon({
        type: 'Locked',
      } as any);
      expect(result).toEqual('lock-closed');
    });

    it('should return lock-closed when task isLocked = true', () => {
      const result = component.endingIcon({
        isLocked: true,
      } as any);
      expect(result).toEqual('lock-closed');
    });

    it('should return checkmark-circle', () => {
      const result = component.endingIcon({
        isLocked: false,
        status: 'done',
      } as any);
      expect(result).toEqual('checkmark-circle');
    });

    it('should return chevron-forward', () => {
      const result = component.endingIcon({
        isLocked: false,
        status: 'in progress',
      } as any);
      expect(result).toEqual('chevron-forward');
    });
  });

  describe('endingIconColor()', () => {
    it('should return "success"', () => {
      const result = component.endingIconColor({ status: 'done' } as any);
      expect(result).toEqual('success');
    });
    it('should return "grey-75"', () => {
      const result = component.endingIconColor({ status: 'anything not done' } as any);
      expect(result).toEqual('grey-75');
    });
  });

  describe('assessmentNotSubmitted()', () => {
    it('should be truthy', () => {
      expect(component.assessmentNotSubmitted({
        type: 'Assessment',
        status: undefined,
      } as any)).toBeTrue();

      expect(component.assessmentNotSubmitted({
        type: 'Assessment',
        status: '',
      } as any)).toBeTrue();

      expect(component.assessmentNotSubmitted({
        type: 'Assessment',
        status: 'in progress',
      } as any)).toBeTrue();
    });

    it('should be falsy', () => {
      expect(component.assessmentNotSubmitted({
        type: 'Assessment',
        status: 'anyhing other than truthy',
      } as any)).toBeFalse();
    });
  });

  describe('goto()', () => {
    it('should warn when user not in a team if "_validateTeamAssessment" return {type: "Locked"}', fakeAsync(() => {
      utilsSpy.isEmpty = jasmine.createSpy('isEmpty').and.returnValue(true);
      storageSpy.getUser = jasmine.createSpy('getUser').and.returnValue({ teamId: 1 });

      component.goto({
        isForTeam: true,
        type: 'Locked',
      } as any);
      tick();

      expect(notificationsSpy.alert).toHaveBeenCalled();
      expect(sharedSpy.getTeamInfo).toHaveBeenCalled();
    }));

    it('should warn activity is locked', () => {
      utilsSpy.isEmpty = jasmine.createSpy('isEmpty').and.returnValue(true);
      const spy = spyOn(component.navigate, 'emit');
      component.goto({
        isForTeam: false,
        type: 'Locked',
      } as any);
      expect(notificationsSpy.alert).toHaveBeenCalled();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should emit "navigate" event', () => {
      utilsSpy.isEmpty = jasmine.createSpy('isEmpty').and.returnValue(true);
      const spy = spyOn(component.navigate, 'emit');
      component.goto({
        isForTeam: false,
        type: 'in progress',
      } as any);
      expect(notificationsSpy.alert).not.toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });

    it('should emit "navigate" event through keyboardEvent', () => {
      utilsSpy.isEmpty = jasmine.createSpy('isEmpty').and.returnValue(true);
      const spy = spyOn(component.navigate, 'emit');
      component.goto({
        isForTeam: false,
        type: 'in progress',
      } as any, new KeyboardEvent('keydown', {
        code: 'Enter',
        key: 'Enter',
      }));
      expect(notificationsSpy.alert).not.toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });
  });
});
