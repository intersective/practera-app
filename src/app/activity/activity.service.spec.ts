import { TestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { ActivityService } from './activity.service';
import { of } from 'rxjs';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { Router } from '@angular/router';
import { MockRouter } from '@testing/mocked.service';

fdescribe('ActivityService', () => {
  let service: ActivityService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ActivityService,
        UtilsService,
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', [
            'get',
            'post',
            'postGraphQL'
          ])
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', ['activityCompletePopUp'])
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
      ]
    });
    service = TestBed.get(ActivityService);
    requestSpy = TestBed.get(RequestService);
    notificationSpy = TestBed.get(NotificationService);
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
          tasks: [
            {
              id: 1,
              type: 'topic',
              name: 'topic 1',
              is_locked: true
            },
            {
              id: 11,
              type: 'topic',
              name: 'topic 2',
              is_locked: false,
              status: {
                status: 'done'
              }
            },
            {
              id: 21,
              type: 'assessment',
              name: 'asmt 21',
              is_team: false,
              is_locked: false,
              deadline: '2019-02-02',
              context_id: 211,
              status: {
                status: 'in progress',
                is_locked: false,
                submitter_name: 'sub name',
                submitter_image: 'sub image'
              }
            },
            {
              id: 22,
              type: 'assessment',
              name: 'asmt 22',
              is_team: false,
              is_locked: false,
              deadline: '2039-02-02',
              context_id: 211,
              status: {
                status: 'pending approval',
                is_locked: false,
                submitter_name: 'sub name',
                submitter_image: 'sub image'
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
          isForTeam: assessment1.is_team,
          dueDate: assessment1.deadline,
          isOverdue: true,
          isDueToday: false,
          status: assessment1.status.status,
          isLocked: assessment1.status.is_locked,
          submitter: {
            name: assessment1.status.submitter_name,
            image: assessment1.status.submitter_image
          }
        },
        {
          id: assessment2.id,
          type: 'Assessment',
          name: assessment2.name,
          contextId: assessment2.context_id,
          isForTeam: assessment2.is_team,
          dueDate: assessment2.deadline,
          isOverdue: false,
          isDueToday: false,
          status: 'pending review',
          isLocked: assessment2.status.is_locked,
          submitter: {
            name: assessment2.status.submitter_name,
            image: assessment2.status.submitter_image
          }
        }
      ]
    };
    requestSpy.postGraphQL.and.returnValue(of(requestResponse));
    service.getActivity(1).subscribe(res => expect(res).toEqual(expected));
  });


});
