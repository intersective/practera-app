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
    service = TestBed.inject(ChatService);
    requestSpy = TestBed.inject(RequestService) as jasmine.SpyObj<RequestService>;
    utils = TestBed.inject(UtilsService);
    pusherSpy = TestBed.inject(PusherService) as jasmine.SpyObj<PusherService>;
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
        size: 15
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
        size: 15
        };
      delete tmpRes.data[0].sender_name;
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getMessageList(chatData, false).subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should get correct message list data for team chat', () => {
      const chatData = {
        team_id: 1,
        page: 1,
        size: 15,
        participants_only: false
        };
      requestSpy.get.and.returnValue(of(requestResponseTeamChat));
      service.getMessageList(chatData, true).subscribe(
        chatList => {
          expect(chatList).toEqual(expectedTeamChat);
        }
      );
      expect(requestSpy.get.calls.count()).toBe(1);
    });

    it('should get correct message list data for one 2 one chat', () => {
      const chatData = {
        team_id: 1,
        team_member_id: 1,
        page: 1,
        size: 15,
        };
      requestSpy.get.and.returnValue(of(requestResponseOneToOneChat));
      service.getMessageList(chatData, true).subscribe(
        chatList => {
          expect(chatList).toEqual(expectedOneToOneChat);
        }
      );
      expect(requestSpy.get.calls.count()).toBe(1);
    });

  });

  describe('when testing markMessagesAsSeen()', () => {
    let requestResponse;
    let expectedPram;
    beforeEach(() => {
      requestResponse = {
        success: true,
        data: {
          msg: 'Messages successfuly mark as seen.'
        }
      };
      expectedPram = {
        team_id: 1,
        id: 1,
        action: 'mark_seen'
      };
    });

    it('should call with correct data', () => {
      const pram = {
        team_id: 1,
        id: 1
      };
      requestSpy.post.and.returnValue(of(requestResponse));
      service.markMessagesAsSeen(pram);
      expect(requestSpy.post.calls.count()).toBe(1);
      expect(requestSpy.post.calls.first().args[1]).toEqual(expectedPram);
    });

  });

  describe('when testing postNewMessage()', () => {
    let requestResponseTextMessage;
    let requestResponseMediaMessage;
    let expectedTextMessage;
    let expectedMediaMessage;
    beforeEach(() => {
      requestResponseTextMessage = {
        success: true,
        data : {
          message: 'test message',
          file: null,
          id: 10,
          sender_name: 'User_1',
          sent_time: '2020-03-13 03:38:28',
          is_sender: true,
          team_id: 13,
          team_name: 'Team 1'
        }
      };
      requestResponseMediaMessage = {
        success: true,
        data : {
          message: null,
          file: {
            filename: 'unnamed.jpg',
            mimetype: 'image/jpeg',
            url: 'https://cdn.filestackcontent.com/X8Cj0Y4QS2AmDUZX6LSq',
            status: 'Stored'
          },
          id: 10,
          sender_name: 'User_1',
          sent_time: '2020-03-13 03:38:28',
          is_sender: true,
          team_id: 13,
          team_name: 'Team 1'
        }
      };
      expectedTextMessage = {
        message: 'test message',
        file: null,
        id: 10,
        sender_name: 'User_1',
        sent_time: '2020-03-13 03:38:28',
        is_sender: true,
        team_id: 13,
        team_name: 'Team 1'
      };
      expectedMediaMessage = {
        message: null,
        file: {
          filename: 'unnamed.jpg',
          mimetype: 'image/jpeg',
          url: 'https://cdn.filestackcontent.com/X8Cj0Y4QS2AmDUZX6LSq',
          status: 'Stored'
        },
        id: 10,
        sender_name: 'User_1',
        sent_time: '2020-03-13 03:38:28',
        is_sender: true,
        team_id: 13,
        team_name: 'Team 1'
      };
    });
    it('should call with correct data, to post new text message to one 2 one chat', () => {
      const param = {
        to: 1,
        message: 'test message',
        team_id: 10,
        env: environment.env
      };
      requestSpy.post.and.returnValue(of(requestResponseTextMessage));
      service.postNewMessage(param).subscribe(
        message => {
          expect(message.data).toEqual(jasmine.objectContaining(expectedTextMessage));
        }
      );
      expect(requestSpy.post.calls.count()).toBe(1);
      expect(requestSpy.post.calls.first().args[1]).toEqual(jasmine.objectContaining(
        {
          to: 1,
          message: 'test message',
          team_id: 10,
          env: environment.env
        }
      ));
    });

    it('should call with correct data, to post new text message to team chat', () => {
      const param = {
        to: 'team',
        message: 'test message',
        team_id: 10,
        env: environment.env
      };
      requestSpy.post.and.returnValue(of(requestResponseTextMessage));
      service.postNewMessage(param).subscribe(
        message => {
          expect(message.data).toEqual(jasmine.objectContaining(expectedTextMessage));
        }
      );
      expect(requestSpy.post.calls.count()).toBe(1);
      expect(requestSpy.post.calls.first().args[1]).toEqual(jasmine.objectContaining(
        {
          to: 'team',
          message: 'test message',
          team_id: 10,
          env: environment.env
        }
      ));
    });

    it('should call with correct data, to post new media message to one 2 one chat', () => {
      const param = {
        to: 1,
        message: 'test message',
        team_id: 10,
        env: environment.env,
        file : {
          filename: 'unnamed.jpg',
          mimetype: 'image/jpeg',
          url: 'https://cdn.filestackcontent.com/X8Cj0Y4QS2AmDUZX6LSq',
          status: 'Stored'
        }
      };
      requestSpy.post.and.returnValue(of(requestResponseMediaMessage));
      service.postNewMessage(param).subscribe(
        message => {
          expect(message.data).toEqual(expectedMediaMessage);
        }
      );
      expect(requestSpy.post.calls.count()).toBe(1);
      expect(requestSpy.post.calls.first().args[1]).toEqual(
        {
          to: 1,
          message: 'test message',
          team_id: 10,
          env: environment.env,
          file : {
            filename: 'unnamed.jpg',
            mimetype: 'image/jpeg',
            url: 'https://cdn.filestackcontent.com/X8Cj0Y4QS2AmDUZX6LSq',
            status: 'Stored'
          }
        }
      );
    });

    it('should call with correct data, to post new media message to team chat', () => {
      const param = {
        to: 'team',
        message: 'test message',
        team_id: 10,
        env: environment.env,
        file : {
          filename: 'unnamed.jpg',
          mimetype: 'image/jpeg',
          url: 'https://cdn.filestackcontent.com/X8Cj0Y4QS2AmDUZX6LSq',
          status: 'Stored'
        }
      };
      requestSpy.post.and.returnValue(of(requestResponseMediaMessage));
      service.postNewMessage(param).subscribe(
        message => {
          expect(message.data).toEqual(expectedMediaMessage);
        }
      );
      expect(requestSpy.post.calls.count()).toBe(1);
      expect(requestSpy.post.calls.first().args[1]).toEqual(
        {
          to: 'team',
          message: 'test message',
          team_id: 10,
          env: environment.env,
          file : {
            filename: 'unnamed.jpg',
            mimetype: 'image/jpeg',
            url: 'https://cdn.filestackcontent.com/X8Cj0Y4QS2AmDUZX6LSq',
            status: 'Stored'
          }
        }
      );
    });
  });

  describe('when testing postAttachmentMessage()', () => {
    let expected;
    beforeEach(() => {
      expected = {
        message: null,
        file: {
          filename: 'unnamed.jpg',
          mimetype: 'image/jpeg',
          url: 'https://cdn.filestackcontent.com/X8Cj0Y4QS2AmDUZX6LSq',
          status: 'Stored'
        },
        id: 10,
        sender_name: 'User_1',
        sent_time: '2020-03-13 03:38:28',
        is_sender: true,
        team_id: 13,
        team_name: 'Team 1'
      };
      spyOn(service, 'postNewMessage').and.returnValue(expected);
    });
    it('should get error, when file not found', () => {
      const param = {
        to: 1,
        message: 'test message',
        team_id: 10,
        env: environment.env
      };
      expect(
        function() {
          service.postAttachmentMessage(param);
        }).toThrow(new Error('Fatal: File value must not be empty.'));
    });

    it('should call postNewMessage, when got correct data', () => {
      const param = {
        to: 1,
        message: 'test message',
        team_id: 10,
        env: environment.env,
        file : {
          filename: 'unnamed.jpg',
          mimetype: 'image/jpeg',
          url: 'https://cdn.filestackcontent.com/X8Cj0Y4QS2AmDUZX6LSq',
          status: 'Stored'
        }
      };
      service.postAttachmentMessage(param);
      expect(service.postNewMessage).toHaveBeenCalled();
    });
  });

  describe('when testing unreadMessageCout()', () => {
    let requestResponse;
    let expectedPram;
    beforeEach(() => {
      requestResponse = {
        success: true,
        data: {
          unread_message_count: 5
        }
      };
      expectedPram = {
        unread_count_for: 'all',
      };
    });

    it('should call with correct data', () => {
      const pram = {
        filter: 'all'
      };
      requestSpy.get.and.returnValue(of(requestResponse));
      service.unreadMessageCout(pram);
      expect(requestSpy.get.calls.count()).toBe(1);
      expect(requestSpy.get.calls.first().args[1]).toEqual(expectedPram);
    });
  });

  describe('when testing getTeamName()', () => {
    let requestResponse;
    let expected;
    beforeEach(() => {
      requestResponse = {
        success: true,
        data: {
          Team : {
            name: 'Team 1',
            id: 12
          },
          TeamMember: []
        }
      };
      expected = 'Team 1';
    });

    it('should call with correct data', () => {
      requestSpy.get.and.returnValue(of(requestResponse));
      service.getTeamName(12).subscribe(
        response => {
          expect(response).toEqual(expected);
        }
      );
      expect(requestSpy.get.calls.count()).toBe(1);
    });
  });

  describe('when testing getMessageFromEvent()', () => {
    let data;
    beforeEach(() => {
      data = {
        event: {
          id: 120,
          from: 10,
          to: 20,
          is_sender: false,
          message: 'test message',
          sender_name: 'user_1',
          sent_time: '9:40',
          file: null,
          sender_image: '',
          participants_only: false
        },
        isTeam: false,
        participants_only: false,
        chatName: ''
      };
    });
    it('should return null, if presence channel equal to from', () => {
      pusherSpy.getMyPresenceChannelId.and.returnValue(10);
      expect(service.getMessageFromEvent(data)).toEqual(null);
    });

    it('should return null, if presence channel equal to this user', () => {
      pusherSpy.getMyPresenceChannelId.and.returnValue(20);
      expect(service.getMessageFromEvent(data)).toEqual(null);
    });

    it('should return null, if presence channel equal to team', () => {
      data.event.to = 'team';
      pusherSpy.getMyPresenceChannelId.and.returnValue('team');
      expect(service.getMessageFromEvent(data)).toEqual(null);
    });

    it('should return null, if not current user team or individual chat info', () => {
      data.event.to = 20;
      data.isTeam = true;
      data.participants_only = true;
      data.chatName = 'User_04';
      pusherSpy.getMyPresenceChannelId.and.returnValue(20);
      expect(service.getMessageFromEvent(data)).toEqual(null);
    });

    it('should return message object, if all data correct', () => {
      data.event.to = 20;
      data.chatName = 'user_1';
      pusherSpy.getMyPresenceChannelId.and.returnValue(20);
      expect(service.getMessageFromEvent(data)).toEqual(
        {
          id: 120,
          is_sender: false,
          message: 'test message',
          sender_name: 'user_1',
          sent_time: '9:40',
          file: null,
          sender_image: ''
        }
      );
    });
  });

});
