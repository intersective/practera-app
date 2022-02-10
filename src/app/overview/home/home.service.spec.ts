import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RequestService } from '@shared/request/request.service';
import { BrowserStorageService } from '@services/storage.service';
import { UtilsService } from '@services/utils.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HomeService } from './home.service';
import { NotificationService } from '@shared/notification/notification.service';
import { EventListService } from '@app/event-list/event-list.service';
import * as moment from 'moment';
import { Apollo } from 'apollo-angular';

describe('HomeService', () => {
  let service: HomeService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  let eventsSpy: jasmine.SpyObj<EventListService>;
  let utils: UtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        Apollo,
        HomeService,
        UtilsService,
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', ['achievementPopUp'])
        },
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', ['get', 'post', 'apiResponseFormatError', 'chatGraphQLQuery'])
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', {
            getUser: {
              programName: 'Test Program',
              projectId: 1
            }
          })
        },
        {
          provide: EventListService,
          useValue: jasmine.createSpyObj('EventListService', ['normaliseEvents'])
        },
      ]
    });
    service = TestBed.inject(HomeService);
    requestSpy = TestBed.inject(RequestService) as jasmine.SpyObj<RequestService>;
    notificationSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    eventsSpy = TestBed.inject(EventListService) as jasmine.SpyObj<EventListService>;
    utils = TestBed.inject(UtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when testing getTodoItems()', () => {
    it('should get correct todoItems', async() => {
      const requestResponse = {
        success: true,
        data: [
          // 0
          {
            // feedback_available type todo item
            identifier: 'AssessmentSubmission-1',
            is_done: false,
            meta: {
              assessment_name: 'assessment name',
              reviewer_name: 'reviewer name'
            },
            created: '2019-02-02'
          },
          // 1
          {
            identifier: 'AssessmentSubmission-2',
            // is done already, shouldn't return
            is_done: true,
            meta: {
              assessment_name: 'assessment name',
              reviewer_name: 'reviewer name'
            },
            created: '2019-02-02'
          },
          // 2
          {
            // review_submission type todo item
            identifier: 'AssessmentReview-1',
            is_done: false,
            meta: {
              assessment_name: 'assessment name'
            },
            created: '2019-02-02'
          },
          // 3
          {
            // trigger achievement pop up
            identifier: 'Achievement-1',
            is_done: false,
            meta: {
              id: 1,
              name: 'achievement name',
              description: '',
              points: 100,
              image: ''
            }
          },
          // 4
          {
            // trigger achievement pop up
            identifier: 'EventReminder-1',
            is_done: false,
            meta: {
              name: 'event reminder'
            }
          },
          // 5
          {
            // assessment_submission_reminder type todo item
            identifier: 'AssessmentSubmissionReminder-1',
            is_done: false,
            meta: {
              assessment_name: 'assessment name',
              context_id: 1,
              activity_id: 2,
              assessment_id: 3,
              due_date: '2019-02-03 08:00:00'
            },
            created: '2019-02-02'
          }
        ]
      };
      const expected = [
        {
          type: 'feedback_available',
          name: requestResponse.data[0].meta.assessment_name,
          description: requestResponse.data[0].meta.reviewer_name + ' has provided feedback',
          time: '2 Feb',
          meta: requestResponse.data[0].meta
        },
        {
          type: 'review_submission',
          name: requestResponse.data[2].meta.assessment_name,
          description: 'Please review the assessment',
          time: '2 Feb',
          meta: requestResponse.data[2].meta
        },
        {
          type: 'assessment_submission_reminder',
          name: requestResponse.data[5].meta.assessment_name,
          description: `Overdue 3 Feb 2019 ${moment(new Date(requestResponse.data[5].meta.due_date + ' GMT+0000')).format('h:mm A')}`,
          time: '2 Feb',
          meta: requestResponse.data[5].meta
        }
      ];
      requestSpy.get.and.returnValue(of(requestResponse));

      utils.getEvent('event-reminder').subscribe(
        event => expect(event).toEqual({meta: requestResponse.data[4].meta})
      );
      service.getTodoItems().subscribe(
        todoItems => expect(todoItems).toEqual(expected)
      );
      expect(requestSpy.get.calls.count()).toBe(1);
      expect(notificationSpy.achievementPopUp.calls.count()).toBe(1);
    });
  });

  describe('when testing getChatMessage()', () => {
    it('should get correct 1 chat message', async() => {
      const requestResponse = {
        data: {
          channels: [
            {
                name: 'Team 1',
                unreadMessageCount: 1,
                lastMessage: 'last',
                lastMessageCreated: '2019-02-02'
            }
          ]
        }
      };
      const expected = {
        type: 'chat',
        name: requestResponse.data.channels[0].name,
        description: requestResponse.data.channels[0].lastMessage,
        time: '2 Feb'
      };
      requestSpy.chatGraphQLQuery.and.returnValue(of(requestResponse));
      service.getChatMessage().subscribe(
        todoItem => expect(todoItem).toEqual(expected)
      );
      expect(requestSpy.chatGraphQLQuery.calls.count()).toBe(1);
    });

    it('should get correct multiple chat messages', async() => {
      const requestResponse = {
        data: {
          channels: [
            {
              unreadMessageCount: 1,
              name: 'name',
              lastMessage: 'last 1',
              lastMessageCreated: '2019-02-02',
            },
            {
              unreadMessageCount: 2,
              name: 'name',
              lastMessage: 'last 2',
              lastMessageCreated: '2019-02-02',
            }
          ]
        }
      };
      const expected = {
        type: 'chat',
        name: '3 messages from 2 chats',
        description: requestResponse.data.channels[1].lastMessage,
        time: '2 Feb',
        meta: {}
      };
      requestSpy.chatGraphQLQuery.and.returnValue(of(requestResponse));
      service.getChatMessage().subscribe(
        todoItem => expect(todoItem).toEqual(expected)
      );
      expect(requestSpy.chatGraphQLQuery.calls.count()).toBe(1);
    });
  });

  describe('when testing getTodoItemFromEvent()', () => {
    it('should get correct todo item from event #1', async() => {
      const event = {};
      const expected = {};
      expect(service.getTodoItemFromEvent(event)).toEqual(expected);
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should get correct todo item from event #2', async() => {
      const event = {
        type: 'assessment_review_published',
        meta: {
          AssessmentReview: {}
        }
      };
      const expected = {};
      expect(service.getTodoItemFromEvent(event)).toEqual(expected);
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should get correct todo item from event #3', async() => {
      const event = {
        type: 'assessment_review_published',
        meta: {
          AssessmentReview: {
            assessment_name: 'asssessment name',
            reviewer_name: 'reviewer name',
            published_date: '2019-02-02',
            assessment_id: 1,
            activity_id: 2,
            context_id: 3
          }
        }
      };
      const expected = {
        type: 'feedback_available',
        name: event.meta.AssessmentReview.assessment_name,
        description: event.meta.AssessmentReview.reviewer_name + ' has provided feedback',
        time: '2 Feb',
        meta: {
          activity_id: event.meta.AssessmentReview.activity_id,
          context_id: event.meta.AssessmentReview.context_id,
          assessment_id: event.meta.AssessmentReview.assessment_id,
          assessment_name: event.meta.AssessmentReview.assessment_name,
          reviewer_name: event.meta.AssessmentReview.reviewer_name,
        }
      };
      expect(service.getTodoItemFromEvent(event)).toEqual(expected);
    });

    it('should get correct todo item from event #4', async() => {
      const event = {
        type: 'assessment_review_assigned',
        meta: {
          AssessmentReview: {}
        }
      };
      const expected = {};
      expect(service.getTodoItemFromEvent(event)).toEqual(expected);
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should get correct todo item from event #5', async() => {
      const event = {
        type: 'assessment_review_assigned',
        meta: {
          AssessmentReview: {
            assessment_name: 'asssessment name',
            assigned_date: '2019-02-02',
            assessment_id: 1,
            assessment_submission_id: 2,
            context_id: 3
          }
        }
      };
      const expected = {
        type: 'review_submission',
        name: event.meta.AssessmentReview.assessment_name,
        description: 'Please review the assessment',
        time: '2 Feb',
        meta: {
          context_id: event.meta.AssessmentReview.context_id,
          assessment_id: event.meta.AssessmentReview.assessment_id,
          assessment_name: event.meta.AssessmentReview.assessment_name,
          assessment_submission_id: event.meta.AssessmentReview.assessment_submission_id,
        }
      };
      expect(service.getTodoItemFromEvent(event)).toEqual(expected);
    });

    it('should get correct todo item from event #6', async() => {
      const event = {
        type: 'assessment_submission_reminder',
        meta: {
          AssessmentSubmissionReminder: {}
        }
      };
      const expected = {};
      expect(service.getTodoItemFromEvent(event)).toEqual(expected);
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should get correct todo item from event #7', async() => {
      const event = {
        type: 'assessment_submission_reminder',
        meta: {
          AssessmentSubmissionReminder: {
            assessment_name: 'asssessment name',
            due_date: '2019-02-02',
            reminded_date: '2019-02-03',
            assessment_id: 1,
            activity_id: 2,
            context_id: 3
          }
        }
      };
      const expected = {
        type: 'assessment_submission_reminder',
        name: event.meta.AssessmentSubmissionReminder.assessment_name,
        description: 'Overdue 2 Feb 2019 ' + new Intl.DateTimeFormat('en-US', {
            hour12: true,
            hour: 'numeric',
            minute: 'numeric'
          }).format(new Date(event.meta.AssessmentSubmissionReminder.due_date + 'Z')),
        time: '3 Feb',
        meta: {
          context_id: event.meta.AssessmentSubmissionReminder.context_id,
          assessment_id: event.meta.AssessmentSubmissionReminder.assessment_id,
          assessment_name: event.meta.AssessmentSubmissionReminder.assessment_name,
          activity_id: event.meta.AssessmentSubmissionReminder.activity_id,
          due_date: event.meta.AssessmentSubmissionReminder.due_date
        }
      };
      expect(service.getTodoItemFromEvent(event)).toEqual(expected);
    });
  });

  describe('when testing getReminderEvent()', () => {
    it('should get correct reminder event #1', async() => {
      const data = {
        meta: {}
      };
      service.getReminderEvent(data).subscribe(res => expect(res).toEqual(null));
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should get correct reminder event #2', async() => {
      const data = {
        meta: {id: 1}
      };
      const requestResponse = {
        data: {
          name: 'name'
        }
      };
      const eventResponse = [
        {
          // should call postEventReminder()
          isPast: true
        }
      ];
      requestSpy.get.and.returnValue(of(requestResponse));
      requestSpy.post.and.returnValue(of());
      eventsSpy.normaliseEvents.and.returnValue(eventResponse);
      service.getReminderEvent(data).subscribe(res => expect(res).toEqual(null));
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(0);
      expect(eventsSpy.normaliseEvents.calls.count()).toBe(1);
      expect(requestSpy.post.calls.count()).toBe(1);
    });

    it('should get correct reminder event #3', async() => {
      const data = {
        meta: {id: 1}
      };
      const requestResponse = {
        data: {
          name: 'name'
        }
      };
      const eventResponse = [
        {
          isPast: false,
          name: 'name'
        }
      ];
      requestSpy.get.and.returnValue(of(requestResponse));
      eventsSpy.normaliseEvents.and.returnValue(eventResponse);
      service.getReminderEvent(data).subscribe(res => expect(res).toEqual(eventResponse[0]));
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(0);
      expect(eventsSpy.normaliseEvents.calls.count()).toBe(1);
      expect(requestSpy.post.calls.count()).toBe(0);
    });
  });

});
