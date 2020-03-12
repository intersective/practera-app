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
    let expected;
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
            name: 'user_1',
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
      expected = [
        {
          team_id: 1,
          team_name: 'Team 1',
          team_member_id: null,
          name: 'Team 1 + Mentor',
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
          name: 'Team 1',
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
          name: 'user_1',
          role: 'participant',
          unread_messages: 0,
          last_message_created: '2020-01-30 04:45:08',
          last_message: 'test 1',
          is_team: false,
          participants_only: false,
          team_member_image: 'https://cdn.filestackcontent.com/uYQuauwNRdD43PfCQ4iW'
        }
      ];
    });
    it('should throw Chat format error, if data format not match', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      tmpRes.data = {};
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getchatList().subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should throw Chat object format error, if team id not found', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      delete tmpRes.data[0].team_id;
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getchatList().subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should throw Chat object format error, if is_team not found', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      delete tmpRes.data[0].is_team;
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getchatList().subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should throw Chat object format error, if participants only not found', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      delete tmpRes.data[0].participants_only;
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getchatList().subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should throw Chat object format error, if name not found', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      delete tmpRes.data[0].name;
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getchatList().subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should throw Chat object format error, if team name not found', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      delete tmpRes.data[0].team_name;
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getchatList().subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should get correct chat list data', () => {
      requestSpy.get.and.returnValue(of(requestResponse));
      service.getchatList().subscribe(
        chatList => {
          expect(chatList).toEqual(expected);
        }
      );
      expect(requestSpy.get.calls.count()).toBe(1);
    });
  });

  describe('when testing getMessageList()', () => {
    let requestResponseTeamChat;
    let requestResponseOneToOneChat;
    let expectedTeamChat;
    let expectedOneToOneChat;
    beforeEach(() => {
      requestResponseTeamChat = {
        success: true,
        data: [
          {
            id: 1,
            sender_name: 'user_1',
            sender_image: 'https://www.gravatar.com/avatar/3ee6ef0c6f1ec24418680ce71e8b06f1?d=https%3A%2F%2Fmy.practera.com%2Fimg%2Fuser-512.png&s=50',
            message: 'test message 01',
            file: null,
            sent_time: '2020-02-27 01:48:28',
            receiver_name: '',
            receiver_image: '',
            is_sender: true
          },
          {
            id: 2,
            sender_name: 'admin_1',
            sender_image: 'https://www.gravatar.com/avatar/3ee6ef0c6f1ec24418680ce71e8b06f1?d=https%3A%2F%2Fmy.practera.com%2Fimg%2Fuser-512.png&s=50',
            message: 'test admin message 01',
            file: {
              filename: 'Screen_Shot_2019-09-30_at_6.55.30_AM.png',
              url: 'https://cdn.filestackcontent.com/hZh76R6TmmKr1qqFAd9C',
              mimetype: 'image/png'
            },
            sent_time: '2020-01-30 06:18:45',
            receiver_name: '',
            receiver_image: '',
            is_sender: false
          },
          {
            id: 3,
            sender_name: 'user_2',
            sender_image: 'https://www.gravatar.com/avatar/3ee6ef0c6f1ec24418680ce71e8b06f1?d=https%3A%2F%2Fmy.practera.com%2Fimg%2Fuser-512.png&s=50',
            message: 'test message 02',
            file: null,
            sent_time: '2019-11-27 02:21:21',
            receiver_name: '',
            receiver_image: '',
            is_sender: false
          }
        ]
      };

      requestResponseOneToOneChat = {
        success: true,
        data: [
          {
            id: 1,
            sender_name: 'user_1',
            sender_image: 'https://www.gravatar.com/avatar/5d838f937ce3f0d470120b5c2a182830?d=https%3A%2F%2Fmy.practera.com%2Fimg%2Fuser-512.png&s=50',
            message: 'test 1',
            file: null,
            sent_time: '2020-01-30 04:45:08',
            receiver_name: 'user_2',
            receiver_image: 'https://www.gravatar.com/avatar/3ee6ef0c6f1ec24418680ce71e8b06f1?d=https%3A%2F%2Fmy.practera.com%2Fimg%2Fuser-512.png&s=50',
            is_sender: false
          },
          {
            id: 2,
            sender_name: 'user_2',
            sender_image: 'https://www.gravatar.com/avatar/3ee6ef0c6f1ec24418680ce71e8b06f1?d=https%3A%2F%2Fmy.practera.com%2Fimg%2Fuser-512.png&s=50',
            message: 'test 2',
            file: null,
            sent_time: '2019-11-26 07:08:35',
            receiver_name: 'user_1',
            receiver_image: 'https://www.gravatar.com/avatar/5d838f937ce3f0d470120b5c2a182830?d=https%3A%2F%2Fmy.practera.com%2Fimg%2Fuser-512.png&s=50',
            is_sender: true
          },
          {
            id: 3,
            sender_name: 'user_2',
            sender_image: 'https://www.gravatar.com/avatar/3ee6ef0c6f1ec24418680ce71e8b06f1?d=https%3A%2F%2Fmy.practera.com%2Fimg%2Fuser-512.png&s=50',
            message: 'test 3',
            file: {
              filename: 'Screen_Shot_2019-09-30_at_6.55.30_AM.png',
              url: 'https://cdn.filestackcontent.com/hZh76R6TmmKr1qqFAd9C',
              mimetype: 'image/png'
            },
            sent_time: '2019-11-26 07:08:35',
            receiver_name: 'user_1',
            receiver_image: 'https://www.gravatar.com/avatar/5d838f937ce3f0d470120b5c2a182830?d=https%3A%2F%2Fmy.practera.com%2Fimg%2Fuser-512.png&s=50',
            is_sender: true
          }
        ]
      };

      expectedTeamChat = [
        {
          id: 1,
          sender_name: 'user_1',
          sender_image: 'https://www.gravatar.com/avatar/3ee6ef0c6f1ec24418680ce71e8b06f1?d=https%3A%2F%2Fmy.practera.com%2Fimg%2Fuser-512.png&s=50',
          message: 'test message 01',
          file: null,
          sent_time: '2020-02-27 01:48:28',
          receiver_name: '',
          receiver_image: '',
          is_sender: true
        },
        {
          id: 2,
          sender_name: 'admin_1',
          sender_image: 'https://www.gravatar.com/avatar/3ee6ef0c6f1ec24418680ce71e8b06f1?d=https%3A%2F%2Fmy.practera.com%2Fimg%2Fuser-512.png&s=50',
          message: 'test admin message 01',
          file: {
            filename: 'Screen_Shot_2019-09-30_at_6.55.30_AM.png',
            url: 'https://cdn.filestackcontent.com/hZh76R6TmmKr1qqFAd9C',
            mimetype: 'image/png'
          },
          sent_time: '2020-01-30 06:18:45',
          receiver_name: '',
          receiver_image: '',
          is_sender: false
        },
        {
          id: 3,
          sender_name: 'user_2',
          sender_image: 'https://www.gravatar.com/avatar/3ee6ef0c6f1ec24418680ce71e8b06f1?d=https%3A%2F%2Fmy.practera.com%2Fimg%2Fuser-512.png&s=50',
          message: 'test message 02',
          file: null,
          sent_time: '2019-11-27 02:21:21',
          receiver_name: '',
          receiver_image: '',
          is_sender: false
        }
      ];

      expectedOneToOneChat = [
        {
          id: 1,
          sender_name: 'user_1',
          sender_image: 'https://www.gravatar.com/avatar/5d838f937ce3f0d470120b5c2a182830?d=https%3A%2F%2Fmy.practera.com%2Fimg%2Fuser-512.png&s=50',
          message: 'test 1',
          file: null,
          sent_time: '2020-01-30 04:45:08',
          receiver_name: 'user_2',
          receiver_image: 'https://www.gravatar.com/avatar/3ee6ef0c6f1ec24418680ce71e8b06f1?d=https%3A%2F%2Fmy.practera.com%2Fimg%2Fuser-512.png&s=50',
          is_sender: false
        },
        {
          id: 2,
          sender_name: 'user_2',
          sender_image: 'https://www.gravatar.com/avatar/3ee6ef0c6f1ec24418680ce71e8b06f1?d=https%3A%2F%2Fmy.practera.com%2Fimg%2Fuser-512.png&s=50',
          message: 'test 2',
          file: null,
          sent_time: '2019-11-26 07:08:35',
          receiver_name: 'user_1',
          receiver_image: 'https://www.gravatar.com/avatar/5d838f937ce3f0d470120b5c2a182830?d=https%3A%2F%2Fmy.practera.com%2Fimg%2Fuser-512.png&s=50',
          is_sender: true
        },
        {
          id: 3,
          sender_name: 'user_2',
          sender_image: 'https://www.gravatar.com/avatar/3ee6ef0c6f1ec24418680ce71e8b06f1?d=https%3A%2F%2Fmy.practera.com%2Fimg%2Fuser-512.png&s=50',
          message: 'test 3',
          file: {
            filename: 'Screen_Shot_2019-09-30_at_6.55.30_AM.png',
            url: 'https://cdn.filestackcontent.com/hZh76R6TmmKr1qqFAd9C',
            mimetype: 'image/png'
          },
          sent_time: '2019-11-26 07:08:35',
          receiver_name: 'user_1',
          receiver_image: 'https://www.gravatar.com/avatar/5d838f937ce3f0d470120b5c2a182830?d=https%3A%2F%2Fmy.practera.com%2Fimg%2Fuser-512.png&s=50',
          is_sender: true
        }
      ];
    });

    it('should throw Message array format error, if team chat data format not match', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponseTeamChat));
      const chatData = {
        team_id: 1,
        team_member_id: 1,
        page: 1,
        size: 15,
        participants_only: false
        };
      tmpRes.data = {};
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getMessageList(chatData, true).subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should throw Message array format error, if one 2 one chat data format not match', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponseOneToOneChat));
      const chatData = {
        team_id: 1,
        team_member_id: 1,
        page: 1,
        size: 15,
        participants_only: false
        };
      tmpRes.data = {};
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getMessageList(chatData, false).subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should throw Message format error, if any required data not found', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponseOneToOneChat));
      const chatData = {
        team_id: 1,
        team_member_id: 1,
        page: 1,
        size: 15,
        participants_only: false
        };
      delete tmpRes.data[0].sender_name;
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getMessageList(chatData, false).subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
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
