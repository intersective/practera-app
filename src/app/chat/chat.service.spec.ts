import { TestBed } from '@angular/core/testing';
import { ChatService } from './chat.service';
import { RequestService } from '@shared/request/request.service';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { UtilsService } from '@services/utils.service';
import { PusherService } from '@shared/pusher/pusher.service';
import { environment } from '@environments/environment';
import { Apollo } from 'apollo-angular';

xdescribe('ChatService', () => {
  let service: ChatService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let utils: UtilsService;
  let pusherSpy: jasmine.SpyObj<PusherService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Apollo,
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

  describe('when testing getChatList()', () => {
    let requestResponse;
    beforeEach(() => {
      requestResponse = {
        success: true,
        data: [
          {
            channel_id: 1,
            channel_name: 'Team 1',
            channel_avatar: 'https://cdn.filestackcontent.com/uYQuauwNRdD43PfCQ4iW',
            pusher_channel_name: 'pusher-channel-name',
            roles: ['participant'],
            readonly: false,
            unread_messages: 2,
            last_message_created: '2020-01-30 06:18:45',
            last_message: 'test 1',
            members: [
              {
                name: 'student1',
                role: 'participant',
                avatar: ''
              },
              {
                name: 'student2',
                role: 'participant',
                avatar: ''
              }
            ]
          },
          {
            channel_id: 2,
            channel_name: 'Team 2',
            channel_avatar: 'https://cdn.filestackcontent.com/uYQuauwNRdD43PfCQ4iW',
            pusher_channel_name: 'pusher-channel-name',
            roles: ['participant'],
            readonly: false,
            unread_messages: 2,
            last_message_created: '2020-01-30 06:18:45',
            last_message: 'test 2',
            members: [
              {
                name: 'student1',
                role: 'participant',
                avatar: ''
              },
              {
                name: 'student2',
                role: 'participant',
                avatar: ''
              }
            ]
          }
        ]
      };
    });
    it('should throw Chat format error, if data format not match', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      tmpRes.data = {};
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getChatList().subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should get correct chat list data', () => {
      requestSpy.get.and.returnValue(of(requestResponse));
      service.getChatList().subscribe(
        chatList => {
          chatList.forEach((chat, i) => {
            expect(chat.channelId).toEqual(requestResponse.data[i].channel_id);
            expect(chat.channelName).toEqual(requestResponse.data[i].channel_name);
            expect(chat.channelAvatar).toEqual(requestResponse.data[i].channel_avatar);
            expect(chat.pusherChannelName).toEqual(requestResponse.data[i].pusher_channel_name);
            expect(chat.readonly).toEqual(requestResponse.data[i].readonly);
            expect(chat.roles).toEqual(requestResponse.data[i].roles);
            expect(chat.members).toEqual(requestResponse.data[i].members);
            expect(chat.unreadMessages).toEqual(requestResponse.data[i].unread_messages);
            expect(chat.lastMessage).toEqual(requestResponse.data[i].last_message);
            expect(chat.lastMessageCreated).toEqual(requestResponse.data[i].last_message_created);
          });
        }
      );
      expect(requestSpy.get.calls.count()).toBe(1);
    });
  });

  describe('when testing getMessageList()', () => {
    let requestResponse;
    beforeEach(() => {
      requestResponse = {
        success: true,
        data: [
          {
            id: 1,
            sender: {
              name: 'user_1',
              avatar: 'https://www.gravatar.com/avatar/3ee6ef0c6f1ec24418680ce71e8b06f1?d=https%3A%2F%2Fmy.practera.com%2Fimg%2Fuser-512.png&s=50',
              role: 'participant'
            },
            message: 'test message 01',
            file: null,
            sent_time: '2020-02-27 01:48:28',
            is_sender: true
          },
          {
            id: 2,
            sender: {
              name: 'admin_1',
              avatar: 'https://www.gravatar.com/avatar/3ee6ef0c6f1ec24418680ce71e8b06f1?d=https%3A%2F%2Fmy.practera.com%2Fimg%2Fuser-512.png&s=50',
              role: 'participant'
            },
            message: 'test admin message 01',
            file: {
              filename: 'Screen_Shot_2019-09-30_at_6.55.30_AM.png',
              url: 'https://cdn.filestackcontent.com/hZh76R6TmmKr1qqFAd9C',
              mimetype: 'image/png'
            },
            sent_time: '2020-01-30 06:18:45',
            is_sender: false
          },
          {
            id: 3,
            sender: {
              name: 'user_2',
              avatar: 'https://www.gravatar.com/avatar/3ee6ef0c6f1ec24418680ce71e8b06f1?d=https%3A%2F%2Fmy.practera.com%2Fimg%2Fuser-512.png&s=50',
              role: 'participant'
            },
            message: 'test message 02',
            file: null,
            sent_time: '2019-11-27 02:21:21',
            is_sender: false
          }
        ]
      };
    });

    it('should get correct message list data for team chat', () => {
      const chatData = {
        channel_id: 1,
        page: 1,
        size: 15,
      };
      requestSpy.get.and.returnValue(of(requestResponse));
      service.getMessageList(chatData).subscribe(
        chatList => {
          chatList.forEach((chat, i) => {
            expect(chat.id).toEqual(requestResponse.data[i].id);
            expect(chat.senderName).toEqual(requestResponse.data[i].sender.name);
            expect(chat.senderRole).toEqual(requestResponse.data[i].sender.role);
            expect(chat.senderAvatar).toEqual(requestResponse.data[i].sender.avatar);
            expect(chat.isSender).toEqual(requestResponse.data[i].is_sender);
            expect(chat.message).toEqual(requestResponse.data[i].message);
            expect(chat.sentTime).toEqual(requestResponse.data[i].sent_time);
            expect(chat.file).toEqual(requestResponse.data[i].file);
          });
        }
      );
      expect(requestSpy.get.calls.count()).toBe(1);
    });

  });

  describe('when testing markMessagesAsSeen()', () => {
    const requestResponse = {
      success: true,
      data: {
        msg: 'Messages successfuly mark as seen.'
      }
    };
    const expectedBody = {
      channel_id: 1,
      id: [1],
      action: 'mark_seen'
    };

    it('should call with correct data', () => {
      const pram = {
        channel_id: 1,
        ids: [1]
      };
      requestSpy.post.and.returnValue(of(requestResponse));
      service.markMessagesAsSeen(pram);
      expect(requestSpy.post.calls.count()).toBe(1);
      expect(requestSpy.post.calls.first().args[1]).toEqual(expectedBody);
    });

  });

  describe('when testing postNewMessage(), postAttachmentMessage()', () => {
    it('should call with correct data', () => {
      requestSpy.post.and.returnValue(of({}));
      service.postNewMessage({
        message: 'test message',
        channelId: 10,
        env: environment.env,
        file : {
          filename: 'unnamed.jpg',
          mimetype: 'image/jpeg',
          url: 'https://cdn.filestackcontent.com/X8Cj0Y4QS2AmDUZX6LSq',
          status: 'Stored'
        }
      }).subscribe();
      expect(requestSpy.post.calls.count()).toBe(1);
      expect(requestSpy.post.calls.first().args[1]).toEqual(jasmine.objectContaining(
        {
          message: 'test message',
          channel_id: 10,
          env: environment.env,
          file : {
            filename: 'unnamed.jpg',
            mimetype: 'image/jpeg',
            url: 'https://cdn.filestackcontent.com/X8Cj0Y4QS2AmDUZX6LSq',
            status: 'Stored'
          }
        }
      ));
    });

    it('postAttachmentMessage() should call with correct data', () => {
      requestSpy.post.and.returnValue(of({}));
      service.postAttachmentMessage({
        message: 'test message',
        channelId: 10,
        env: environment.env,
        file : {
          filename: 'unnamed.jpg',
          mimetype: 'image/jpeg',
          url: 'https://cdn.filestackcontent.com/X8Cj0Y4QS2AmDUZX6LSq',
          status: 'Stored'
        }
      }).subscribe();
      expect(requestSpy.post.calls.count()).toBe(1);
      expect(requestSpy.post.calls.first().args[1]).toEqual(jasmine.objectContaining(
        {
          message: 'test message',
          channel_id: 10,
          env: environment.env,
          file : {
            filename: 'unnamed.jpg',
            mimetype: 'image/jpeg',
            url: 'https://cdn.filestackcontent.com/X8Cj0Y4QS2AmDUZX6LSq',
            status: 'Stored'
          }
        }
      ));
    });
  });

});
