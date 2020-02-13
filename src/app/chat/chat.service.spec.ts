import { TestBed } from '@angular/core/testing';
import { ChatService } from './chat.service';
import { RequestService } from '@shared/request/request.service';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { UtilsService } from '@services/utils.service';
import { PusherService } from '@shared/pusher/pusher.service';
import { environment } from '@environments/environment';

describe('ChatService', () => {
  let service: ChatService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let utils: UtilsService;
  let pusherSpy: jasmine.SpyObj<PusherService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ChatService,
        UtilsService,
        {
          provide: PusherService,
          useValue: jasmine.createSpyObj('PusherService', ['getMyPresenceChannelId'])
        },
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', ['get', 'post', 'apiResponseFormatError'])
        },
      ]
    });
    service = TestBed.get(ChatService);
    requestSpy = TestBed.get(RequestService);
    utils = TestBed.get(UtilsService);
    pusherSpy = TestBed.get(PusherService);
    pusherSpy = TestBed.get(PusherService);

  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when testing getchatList()', () => {
    let requestResponse;
    beforeEach(() => {
      requestResponse = {
        success: true,
        data: [
          {
            team_id: 1,
            team_name: 'Team 1',
            team_member_id: null,
            name: 'Team',
            role: null,
            unread_messages: 2,
            last_message_created: '2020-01-30 06:18:45',
            last_message: 'test 1',
            is_team: true,
            participants_only: false
          },
          {
            team_id: 1,
            team_name: 'Team 1',
            team_member_id: null,
            name: 'Team',
            role: null,
            unread_messages: 5,
            last_message_created: '2020-01-30 06:18:45',
            last_message: 'test 1',
            is_team: true,
            participants_only: true
          },
          {
            team_id: 1,
            team_name: 'Team 1',
            team_member_id: 25,
            name: 'sanjaya_1',
            role: 'participant',
            unread_messages: 0,
            last_message_created: '2020-01-30 04:45:08',
            last_message: 'test 1',
            is_team: false,
            participants_only: false,
            team_member_image: 'https://cdn.filestackcontent.com/uYQuauwNRdD43PfCQ4iW'
          }
        ]
      };
    });
    it('should throw Chat format error, if data format not match', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      tmpRes.data = {};
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getchatList().subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(2);
    });
  });

  // it('should instantiated with variables', () => {
  //   expect(service['chatList']).toBeTruthy();
  //   expect(service['messageList']).toBeTruthy();
  // });

  // it('#getchatList should', () => {
  //   expect(service.getchatList).toBeTruthy();
  // });

  // it('#getMessageList should', () => {
  //   expect(service.getMessageList).toBeTruthy();
  // });

  // it('#markMessagesAsSeen should', () => {
  //   expect(service.markMessagesAsSeen).toBeTruthy();
  // });

  // it('#postNewMessage should', () => {
  //   expect(service.postNewMessage).toBeTruthy();
  // });

});
