import { TestBed } from '@angular/core/testing';
import { ChatService } from './chat.service';
import { ApolloService } from '@v3/services/apollo.service';
import { RequestService } from 'request';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { UtilsService } from '@v3/services/utils.service';
import { PusherService } from '@v3/services/pusher.service';
import { environment } from '@v3/environments/environment';
import { TestUtils } from '@testingv3/utils';

describe('ChatService', () => {
  let service: ChatService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let apolloSpy: jasmine.SpyObj<ApolloService>;
  let utils: UtilsService;
  let pusherSpy: jasmine.SpyObj<PusherService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ChatService,
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: PusherService,
          useValue: jasmine.createSpyObj('PusherService', ['getMyPresenceChannelId'])
        },
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', ['get', 'post', 'apiResponseFormatError'])
        },
        {
          provide: ApolloService,
          useValue: jasmine.createSpyObj('ApolloService', ['chatGraphQLQuery', 'chatGraphQLMutate'])
        }
      ]
    });
    service = TestBed.inject(ChatService);
    requestSpy = TestBed.inject(RequestService) as jasmine.SpyObj<RequestService>;
    apolloSpy = TestBed.inject(ApolloService) as jasmine.SpyObj<ApolloService>;
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
        data: {
          channels: [
            {
              uuid: '1',
              name: 'Team 1',
              avatar: 'https://cdn.filestackcontent.com/uYQuauwNRdD43PfCQ4iW',
              pusherChannel: 'pusher-channel-name',
              roles: ['participant'],
              isAnnouncement: false,
              isDirectMessage: false,
              readonly: false,
              unreadMessageCount: 2,
              lastMessageCreated: '2020-01-25 06:18:45',
              lastMessage: 'test 1',
              canEdit: false
            },
            {
              uuid: '2',
              name: 'Team 2',
              avatar: 'https://cdn.filestackcontent.com/uYQuauwNRdD43PfCQ4iW',
              pusherChannel: 'pusher-channel-name',
              roles: ['participant'],
              isAnnouncement: false,
              isDirectMessage: false,
              readonly: false,
              unreadMessageCount: 2,
              lastMessageCreated: '2020-01-30 04:18:45',
              lastMessage: 'test 2',
              canEdit: false
            },
            {
              uuid: '3',
              name: 'Team 3',
              avatar: 'https://cdn.filestackcontent.com/uYQuauwNRdD43PfCQ4iW',
              pusherChannel: 'pusher-channel-name',
              roles: ['participant'],
              isAnnouncement: false,
              isDirectMessage: false,
              readonly: false,
              unreadMessageCount: 2,
              lastMessageCreated: null,
              lastMessage: null,
              canEdit: false
            },
            {
              uuid: '4',
              name: 'Team 4',
              avatar: 'https://cdn.filestackcontent.com/uYQuauwNRdD43PfCQ4iW',
              pusherChannel: 'pusher-channel-name',
              roles: ['participant'],
              isAnnouncement: false,
              isDirectMessage: false,
              readonly: false,
              unreadMessageCount: 2,
              lastMessageCreated: '2020-05-30 04:18:45',
              lastMessage: 'test 4',
              canEdit: false
            },
          ]
        }
      };
    });
    it('should throw Chat format error, if data format not match', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      tmpRes.data.channels = {};
      apolloSpy.chatGraphQLQuery.and.returnValue(of(tmpRes));
      service.getChatList().subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should get correct chat list data', () => {
      const sortedList = [];
      sortedList.push(requestResponse.data.channels[3]);
      sortedList.push(requestResponse.data.channels[1]);
      sortedList.push(requestResponse.data.channels[0]);
      sortedList.push(requestResponse.data.channels[2]);
      apolloSpy.chatGraphQLQuery.and.returnValue(of(requestResponse));
      service.getChatList().subscribe(
        chatList => {
          chatList.forEach((chat, i) => {
            expect(chat.uuid).toEqual(sortedList[i].uuid);
            expect(chat.name).toEqual(sortedList[i].name);
            expect(chat.avatar).toEqual(sortedList[i].avatar);
            expect(chat.pusherChannel).toEqual(sortedList[i].pusherChannel);
            expect(chat.isAnnouncement).toEqual(sortedList[i].isAnnouncement);
            expect(chat.isDirectMessage).toEqual(sortedList[i].isDirectMessage);
            expect(chat.readonly).toEqual(sortedList[i].readonly);
            expect(chat.roles).toEqual(sortedList[i].roles);
            expect(chat.unreadMessageCount).toEqual(sortedList[i].unreadMessageCount);
            expect(chat.lastMessage).toEqual(sortedList[i].lastMessage);
            expect(chat.lastMessageCreated).toEqual(sortedList[i].lastMessageCreated);
            expect(chat.canEdit).toEqual(sortedList[i].canEdit);
          });
        }
      );
      expect(apolloSpy.chatGraphQLQuery.calls.count()).toBe(1);
    });
  });

  describe('when testing getMessageList()', () => {
    let messageListRequestResponse;
    beforeEach(() => {
      messageListRequestResponse = {
        data: {
          channel: {
            chatLogsConnection: {
              cursor: 'ajnafb83434',
              chatLogs: [
                {
                  uuid: '1',
                  message: 'test message 01',
                  file: null,
                  created: '2020-02-27 01:48:28',
                  isSender: true,
                  sender: {
                    uuid: 'as108',
                    name: 'user 1',
                    role: 'admin',
                    avatar: 'https://cdn.filestackcontent.com/X8Cj0Y4QS2AmDUZX6LSq'
                  }
                },
                {
                  uuid: '2',
                  message: 'test admin message 01',
                  file: JSON.stringify({
                    filename: 'Screen_Shot_2019-09-30_at_6.55.30_AM.png',
                    url: 'https://cdn.filestackcontent.com/hZh76R6TmmKr1qqFAd9C',
                    mimetype: 'image/png'
                  }),
                  created: '2020-01-30 06:18:45',
                  isSender: false,
                  sender: {
                    uuid: 'dvjn867',
                    name: 'user 1',
                    role: 'admin',
                    avatar: 'https://cdn.filestackcontent.com/X8Cj0Y4QS2AmDUZX6LSq'
                  }
                },
                {
                  uuid: '3',
                  message: 'test message 02',
                  file: null,
                  created: '2019-11-27 02:21:21',
                  isSender: false,
                  sender: {
                    uuid: 'dfbjkf3y',
                    name: 'user 1',
                    role: 'admin',
                    avatar: 'https://cdn.filestackcontent.com/X8Cj0Y4QS2AmDUZX6LSq'
                  }
                }
              ]
            }
          }
        }
      };
    });

    it('should get correct message list data for team chat', () => {
      const chatData = {
        channelUuid: '1',
        cursor: '1',
        size: 15,
      };
      apolloSpy.chatGraphQLQuery.and.returnValue(of(messageListRequestResponse));
      const fileJson = {
        filename: 'Screen_Shot_2019-09-30_at_6.55.30_AM.png',
        url: 'https://cdn.filestackcontent.com/hZh76R6TmmKr1qqFAd9C',
        mimetype: 'image/png'
      };
      service.getMessageList(chatData).subscribe(
        MessageListResult => {
          MessageListResult.messages.forEach((message, i) => {
            expect(message.uuid).toEqual(messageListRequestResponse.data.channel.chatLogsConnection.chatLogs[i].uuid);
            expect(message.isSender).toEqual(messageListRequestResponse.data.channel.chatLogsConnection.chatLogs[i].isSender);
            expect(message.message).toEqual(messageListRequestResponse.data.channel.chatLogsConnection.chatLogs[i].message);
            expect(message.created).toEqual(messageListRequestResponse.data.channel.chatLogsConnection.chatLogs[i].created);
            expect(message.file).toEqual(messageListRequestResponse.data.channel.chatLogsConnection.chatLogs[i].file);
            expect(message.fileObject).toBeDefined();
            if ((typeof messageListRequestResponse.data.channel.chatLogsConnection.chatLogs[i].file) === 'string') {
              expect(message.fileObject).toEqual(fileJson);
            } else {
              expect(message.fileObject).toEqual(messageListRequestResponse.data.channel.chatLogsConnection.chatLogs[i].file);
            }
          });
        }
      );
      expect(apolloSpy.chatGraphQLQuery.calls.count()).toBe(1);
    });

  });

  describe('when testing getChatMembers()', () => {
    let requestResponse;
    beforeEach(() => {
      requestResponse = {
        data: {
          channel: {
            members: [
              {
                uuid: '8bee29d0-bf45-af7d-0927-19a73a7e1840',
                name: 'student+02',
                role: 'participant',
                avatar: 'https://www.gravatar.com/avatar/db30b12260b2c589b1394b26390eab50?d=https://sandbox.practera.com/img/user-512.png&s=50'
              },
              {
                uuid: '8d1f3cdf-d697-e957-7120-b5568159a978',
                name: 'student+01',
                role: 'participant',
                avatar: 'https://www.gravatar.com/avatar/21b7427270a606e8a3c4413a13bb47c6?d=https://sandbox.practera.com/img/user-512.png&s=50'
              }
            ]
          }
        }
      };
    });

    it('should get correct member list data of chat channel', () => {
      apolloSpy.chatGraphQLQuery.and.returnValue(of(requestResponse));
      service.getChatMembers('1').subscribe(
        members => {
          members.forEach((member, i) => {
            expect(member.uuid).toEqual(requestResponse.data.channel.members[i].uuid);
            expect(member.name).toEqual(requestResponse.data.channel.members[i].name);
            expect(member.role).toEqual(requestResponse.data.channel.members[i].role);
            expect(member.avatar).toEqual(requestResponse.data.channel.members[i].avatar);
          });
        }
      );
      expect(apolloSpy.chatGraphQLQuery.calls.count()).toBe(1);
    });

  });

  describe('when testing getPusherChannels()', () => {
    let requestResponse;
    beforeEach(() => {
      requestResponse = {
        data: {
          channels: [
            {
              pusherChannel: 'fgv34fg-34-8472354eb'
            },
            {
              pusherChannel: 'k76i865-jyj-5f44eb4f'
            }
          ]
        }
      };
    });

    it('should get correct pusher channels', () => {
      apolloSpy.chatGraphQLQuery.and.returnValue(of(requestResponse));
      service.getPusherChannels().subscribe(
        members => {
          members.forEach((member, i) => {
            expect(member.pusherChannel).toEqual(requestResponse.data.channels[i].pusherChannel);
          });
        }
      );
      expect(apolloSpy.chatGraphQLQuery.calls.count()).toBe(1);
    });

  });

  describe('when testing markMessagesAsSeen()', () => {
    const requestResponse = {
      success: true
    };
    const expectedBody = {
      uuids: ['1', '2']
    };

    it('should call with correct data', () => {
      const pram = ['1', '2'];
      apolloSpy.chatGraphQLMutate.and.returnValue(of(requestResponse));
      service.markMessagesAsSeen(pram).subscribe();
      expect(apolloSpy.chatGraphQLMutate.calls.count()).toBe(1);
      expect(apolloSpy.chatGraphQLMutate.calls.first().args[1]).toEqual(expectedBody);
    });

  });

  describe('when testing postNewMessage(), postAttachmentMessage()', () => {
    it('should call with correct data', () => {
      apolloSpy.chatGraphQLMutate.and.returnValue(of({}));
      service.postNewMessage({
        message: 'test message',
        channelUuid: '10'
      }).subscribe();
      expect(apolloSpy.chatGraphQLMutate.calls.count()).toBe(1);
      expect(apolloSpy.chatGraphQLMutate.calls.first().args[1]).toEqual(jasmine.objectContaining(
        {
          message: 'test message',
          channelUuid: '10',
          file: undefined
        }
      ));
    });

    it('postAttachmentMessage() should call with correct data', () => {
      const attachmentMessageParam = {
        message: 'test message',
        channelUuid: '10',
        file: JSON.stringify({
          filename: 'unnamed.jpg',
          mimetype: 'image/jpeg',
          url: 'https://cdn.filestackcontent.com/X8Cj0Y4QS2AmDUZX6LSq',
          status: 'Stored'
        })
      };
      const newMessageRes = {
        data: {
          createChatLog: {
            uuid: '1',
            isSender: true,
            message: '',
            file: JSON.stringify({
              filename: 'unnamed.jpg',
              mimetype: 'image/jpeg',
              url: 'https://cdn.filestackcontent.com/X8Cj0Y4QS2AmDUZX6LSq',
              status: 'Stored'
            }),
            created: '2020-10-22 12:34:16',
            sender: {
              uuid: '1',
              name: 'user 1',
              role: 'admin',
              avatar: 'https://cdn.filestackcontent.com/X8Cj0Y4QS2AmDUZX6LSq'
            }
          }
        }
      };
      const fileJson = {
        filename: 'unnamed.jpg',
        mimetype: 'image/jpeg',
        url: 'https://cdn.filestackcontent.com/X8Cj0Y4QS2AmDUZX6LSq',
        status: 'Stored'
      };
      apolloSpy.chatGraphQLMutate.and.returnValue(of(newMessageRes));
      service.postAttachmentMessage(attachmentMessageParam).subscribe(
        message => {
          expect(message.uuid).toEqual(newMessageRes.data.createChatLog.uuid);
          expect(message.isSender).toEqual(newMessageRes.data.createChatLog.isSender);
          expect(message.message).toEqual(newMessageRes.data.createChatLog.message);
          expect(message.created).toEqual(newMessageRes.data.createChatLog.created);
          expect(message.file).toEqual(newMessageRes.data.createChatLog.file);
          expect(message.fileObject).toBeDefined();
          if ((typeof newMessageRes.data.createChatLog.file) === 'string') {
            expect(message.fileObject).toEqual(fileJson);
          } else {
            expect(message.fileObject).toEqual(newMessageRes.data.createChatLog.file);
          }
        }
      );
      expect(apolloSpy.chatGraphQLMutate.calls.count()).toBe(1);
      expect(apolloSpy.chatGraphQLMutate.calls.first().args[1]).toEqual(jasmine.objectContaining(
        {
          message: 'test message',
          channelUuid: '10',
          file: JSON.stringify({
            filename: 'unnamed.jpg',
            mimetype: 'image/jpeg',
            url: 'https://cdn.filestackcontent.com/X8Cj0Y4QS2AmDUZX6LSq',
            status: 'Stored'
          })
        }
      ));
    });
  });

});
