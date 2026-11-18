import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivityService } from './activity.service';
import { of, throwError } from 'rxjs';
import { RequestService } from 'request';
import { UtilsService } from '@v3/services/utils.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { Router } from '@angular/router';
import { MockRouter } from '@testingv3/mocked.service';
import { TestUtils } from '@testingv3/utils';
import { ApolloService } from './apollo.service';
import { AssessmentService } from './assessment.service';
import { TopicService } from './topic.service';
import { DemoService } from './demo.service';
import { SharedService } from './shared.service';
import { UnlockIndicatorService } from './unlock-indicator.service';

describe('ActivityService', () => {
  let service: ActivityService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let apolloSpy: jasmine.SpyObj<ApolloService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let notificationSpy: jasmine.SpyObj<NotificationsService>;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;
  let utils: UtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ActivityService,
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', [
            'get',
            'post',
          ])
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', ['activityCompletePopUp'])
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['getUser', 'getReferrer', 'get', 'set'])
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: ApolloService,
          useValue: jasmine.createSpyObj('ApolloService', {
            'stop': of(),
            'graphQLWatch': of(),
            'graphQLFetch': of (),
          }),
        },
        {
          provide: TopicService,
          useValue: jasmine.createSpyObj('TopicService', ['getTopic']),
        },
        {
          provide: AssessmentService,
          useValue: jasmine.createSpyObj('AssessmentService', ['getAssessment']),
        },
        {
          provide: DemoService,
          useValue: jasmine.createSpyObj('DemoService', ['normalResponse'])
        },
        {
          provide: SharedService,
          useValue: jasmine.createSpyObj('SharedService', ['getTeamInfo', 'getTeamMembers'])
        },
        {
          provide: UnlockIndicatorService,
          useValue: jasmine.createSpyObj('UnlockIndicatorService', ['loadFromStorage', 'clearAllTasks', 'addTask', 'removeTask'])
        },
      ]
    });
    service = TestBed.inject(ActivityService);
    requestSpy = TestBed.inject(RequestService) as jasmine.SpyObj<RequestService>;
    apolloSpy = TestBed.inject(ApolloService) as jasmine.SpyObj<ApolloService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    notificationSpy = TestBed.inject(NotificationsService) as jasmine.SpyObj<NotificationsService>;
    utils = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('when testing getActivity(), should get the correct data', () => {
    const requestResponse = {
      data: {
        activity: {
          id: 1,
          name: 'activity',
          description: 'des',
          unlockConditions: [],
          tasks: [
            {
              id: 1,
              type: 'topic',
              name: 'topic 1',
              isLocked: true
            },
            {
              id: 11,
              type: 'topic',
              name: 'topic 2',
              isLocked: false,
              status: {
                status: 'done'
              }
            },
            {
              id: 21,
              type: 'assessment',
              name: 'asmt 21',
              isTeam: false,
              isLocked: false,
              deadline: '2019-02-02',
              contextId: 211,
              assessmentType: 'moderated',
              status: {
                status: 'in progress',
                isLocked: false,
                submitterName: 'sub name',
                submitterImage: 'sub image'
              }
            },
            {
              id: 22,
              type: 'assessment',
              name: 'asmt 22',
              isTeam: false,
              isLocked: false,
              deadline: '2039-02-02',
              contextId: 211,
              assessmentType: 'team360',
              status: {
                status: 'pending approval',
                isLocked: false,
                submitterName: 'sub name',
                submitterImage: 'sub image'
              }
            }
          ]
        }
      }
    };
    const activity = requestResponse.data.activity;
    const topic1 = JSON.parse(JSON.stringify(activity.tasks[0]));
    const topic2 = JSON.parse(JSON.stringify(activity.tasks[1]));
    const assessment1 = JSON.parse(JSON.stringify(activity.tasks[2]));
    const assessment2 = JSON.parse(JSON.stringify(activity.tasks[3]));
    const expected = {
      id: activity.id,
      name: activity.name,
      description: activity.description,
      unlockConditions: [],
      tasks: [
        {
          id: 0,
          type: 'Locked',
          name: 'Locked'
        },
        {
          id: topic2.id,
          type: 'Topic',
          name: topic2.name,
          status: topic2.status.status
        },
        {
          id: assessment1.id,
          type: 'Assessment',
          name: assessment1.name,
          contextId: 211,
          isForTeam: assessment1.isTeam,
          dueDate: assessment1.deadline,
          isOverdue: true,
          isDueToday: false,
          status: assessment1.status.status,
          isLocked: assessment1.status.isLocked,
          submitter: {
            name: assessment1.status.submitterName,
            image: assessment1.status.submitterImage
          },
          assessmentType: assessment1.assessmentType
        },
        {
          id: assessment2.id,
          type: 'Assessment',
          name: assessment2.name,
          contextId: assessment2.contextId,
          isForTeam: assessment2.isTeam,
          dueDate: assessment2.deadline,
          isOverdue: false,
          isDueToday: false,
          status: 'pending review',
          isLocked: assessment2.status.isLocked,
          submitter: {
            name: assessment2.status.submitterName,
            image: assessment2.status.submitterImage
          },
          assessmentType: assessment2.assessmentType
        }
      ]
    };
    apolloSpy.graphQLFetch.and.returnValue(of(requestResponse));
    service.getActivity(1);
    service.activity$.subscribe(res => expect(res).toEqual(expected));
  });

  describe('calculateNextTask()', () => {
    const doneTopic = { id: 2, type: 'Topic', name: 'Done topic', status: 'done' };
    const nextAssessment = {
      id: 11,
      type: 'Assessment',
      name: 'Next assessment',
      status: 'in progress',
      contextId: 12,
    };

    it('selects the next unfinished task after the current task', () => {
      const goToTask = spyOn(service, 'goToTask').and.resolveTo();

      service.calculateNextTask([doneTopic, nextAssessment], doneTopic, 1);

      expect(goToTask).toHaveBeenCalledWith(nextAssessment, 1);
    });
  });

  describe('goToNextTask()', () => {
    const doneTask = { id: 2, type: 'Topic', name: 'Done topic', status: 'done' };

    beforeEach(() => {
      service.activity$.subscribe();
      service.refreshActivity({ id: 1, name: 'activity', tasks: [], unlockConditions: [] });
      storageSpy.getReferrer.and.returnValue({});
      storageSpy.getUser.and.returnValue({ teamId: 4 });
      (utils as any).has = (object: Record<string, unknown> | null | undefined, path: string) => {
        return !!object && Object.prototype.hasOwnProperty.call(object, path);
      };
      (utils as any).isMobile.and.returnValue(true);
      const shared = TestBed.inject(SharedService) as jasmine.SpyObj<SharedService>;
      shared.getTeamInfo.and.returnValue(of({ data: { user: { teams: [{ id: 4 }] } } }));
      const unlock = TestBed.inject(UnlockIndicatorService) as any;
      unlock.removeTasks = jasmine.createSpy('removeTasks').and.returnValue([]);
      const assessment = TestBed.inject(AssessmentService) as any;
      assessment.fetchAssessment = jasmine.createSpy('fetchAssessment').and.returnValue(of({}));
    });

    function publishActivity(tasks: any[]) {
      apolloSpy.graphQLFetch.and.returnValue(of({
        data: {
          activity: {
            id: 1,
            name: 'activity',
            description: 'des',
            unlockConditions: [],
            tasks,
          },
        },
      }));
    }

    it('navigates home when no task remains after the current one', fakeAsync(() => {
      publishActivity([
        { id: 2, type: 'topic', name: 'Done topic', isLocked: false, status: { status: 'done' } },
      ]);

      service.goToNextTask(doneTask);
      flushMicrotasks();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['v3', 'home']);
    }));

    it('redirects to the external return url when the activity is complete', fakeAsync(() => {
      storageSpy.getReferrer.and.returnValue({ activityTaskUrl: 'https://return.example/done' });
      publishActivity([
        { id: 2, type: 'topic', name: 'Done topic', isLocked: false, status: { status: 'done' } },
      ]);

      service.goToNextTask(doneTask);
      flushMicrotasks();

      expect(utils.redirectToUrl).toHaveBeenCalledWith('https://return.example/done');
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    }));

    it('opens the activity complete popup when earlier tasks are unfinished', fakeAsync(() => {
      publishActivity([
        { id: 2, type: 'topic', name: 'Open topic', isLocked: false, status: { status: 'in progress' } },
      ]);

      service.goToNextTask({ id: 2, type: 'Topic', name: 'Open topic', status: 'in progress' });
      flushMicrotasks();

      expect(notificationSpy.activityCompletePopUp).toHaveBeenCalledWith(1, false);
    }));

    it('navigates to the next assessment', fakeAsync(() => {
      publishActivity([
        { id: 2, type: 'topic', name: 'Done topic', isLocked: false, status: { status: 'done' } },
        {
          id: 11,
          type: 'assessment',
          name: 'assessment1',
          isLocked: false,
          isTeam: false,
          deadline: null,
          contextId: 12,
          assessmentType: 'moderated',
          status: { status: 'in progress', isLocked: false, submitterName: '', submitterImage: '' },
        },
      ]);

      service.goToNextTask(doneTask);
      flushMicrotasks();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['assessment-mobile', 'assessment', 1, 12, 11]);
    }));

    it('navigates to the next topic', fakeAsync(() => {
      publishActivity([
        { id: 2, type: 'topic', name: 'Done topic', isLocked: false, status: { status: 'done' } },
        { id: 11, type: 'topic', name: 'topic1', isLocked: false, status: { status: 'in progress' } },
      ]);

      service.goToNextTask(doneTask);
      flushMicrotasks();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['topic-mobile', 1, 11]);
    }));
  });

  describe('goToTask() simulation', () => {
    const simulation = { id: 7, type: 'Simulation', name: 'Sim' };

    beforeEach(() => {
      storageSpy.getUser.and.returnValue({ teamId: 4 });
      const shared = TestBed.inject(SharedService) as jasmine.SpyObj<SharedService>;
      shared.getTeamInfo.and.returnValue(of({ data: { user: { teams: [{ id: 4 }] } } }));
      const unlock = TestBed.inject(UnlockIndicatorService) as any;
      unlock.removeTasks = jasmine.createSpy('removeTasks').and.returnValue([]);
      const topic = TestBed.inject(TopicService) as any;
      topic.fetchSimulation = jasmine.createSpy('fetchSimulation').and.returnValue(of({
        simulationType: 'h5p',
        h5p: {
          contentUrl: 'https://example.com/h5p/content/',
          librariesUrl: 'https://example.com/h5p/libraries/',
          frameJs: 'https://example.com/h5p/frame.bundle.js',
          frameCss: 'https://example.com/h5p/frame.css',
        },
        launchUrl: null,
        assessmentId: null,
        activityId: null,
      }));
    });

    it('navigates a mobile learner to the desktop activity route', async () => {
      (utils as any).isMobile.and.returnValue(true);
      (routerSpy as any).url = '/v3/activity-mobile/3';

      await service.goToTask(simulation, 3);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['v3', 'activity-desktop', 3, 7]);
      const topic = TestBed.inject(TopicService) as any;
      expect(topic.fetchSimulation).not.toHaveBeenCalled();
    });

    it('loads the simulation when the desktop route is already open on a phone', async () => {
      (utils as any).isMobile.and.returnValue(true);
      (routerSpy as any).url = '/v3/activity-desktop/3/7';
      const loaded: any[] = [];
      service.currentTask$.subscribe(task => {
        if (task) {
          loaded.push(task);
        }
      });

      await service.goToTask(simulation, 3);

      expect(routerSpy.navigate).not.toHaveBeenCalled();
      expect(loaded[loaded.length - 1].h5p.contentUrl).toBe('https://example.com/h5p/content/');
    });

    it('loads the simulation on desktop without leaving the activity', async () => {
      (utils as any).isMobile.and.returnValue(false);
      (routerSpy as any).url = '/v3/activity-desktop/3';

      await service.goToTask(simulation, 3);

      const topic = TestBed.inject(TopicService) as any;
      expect(topic.fetchSimulation).toHaveBeenCalledWith(7);
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });
});
