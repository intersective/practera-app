import { CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core';
import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ChatRoomComponent } from './chat-room.component';
import { ChannelMembers, ChatService } from '@v3/services/chat.service';
import { of } from 'rxjs';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { PusherService } from '@v3/services/pusher.service';
import { FilestackService } from '@v3/services/filestack.service';
import { MockRouter } from '@testingv3/mocked.service';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { IonContent, ModalController } from '@ionic/angular';
import { TestUtils } from '@testingv3/utils';
import { mockMembers } from '@testingv3/fixtures';

export class MockElementRef extends ElementRef {
  constructor() { super(null); }
  nativeElement: {};
}

describe('ChatRoomComponent', () => {
  let component: ChatRoomComponent;
  let fixture: ComponentFixture<ChatRoomComponent>;
  let chatServiceSpy: jasmine.SpyObj<ChatService>;
  let utils: UtilsService;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;
  let pusherSpy: jasmine.SpyObj<PusherService>;
  let filestackSpy: jasmine.SpyObj<FilestackService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routeStub: Partial<ActivatedRoute>;
  let MockIoncontent: IonContent;
  const modalSpy = jasmine.createSpyObj('Modal', ['present', 'onDidDismiss']);
  modalSpy.onDidDismiss.and.returnValue(new Promise(() => { }));
  const modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
  modalCtrlSpy.create.and.returnValue(modalSpy);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ChatRoomComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: ElementRef,
          useClass: MockElementRef
        },
        {
          provide: IonContent,
          useValue: jasmine.createSpyObj('IonContent', ['scrollToBottom'])
        },
        {
          provide: ChatService,
          useValue: jasmine.createSpyObj('ChatService', ['getChatMembers', 'getMessageList', 'postNewMessage', 'markMessagesAsSeen', 'postAttachmentMessage'])
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['getCurrentChatChannel', 'getUser'])
        },
        {
          provide: PusherService,
          useValue: jasmine.createSpyObj('PusherService', ['triggerSendMessage', 'triggerTyping'])
        },
        {
          provide: FilestackService,
          useValue: jasmine.createSpyObj('FilestackService', ['getFileTypes', 'getS3Config', 'open', 'previewFile'])
        },
        {
          provide: Router,
          useClass: MockRouter,
          /*useValue: {
            navigate: jasmine.createSpy('navigate'),
            events: of()
          }*/
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: 1 })
            }
          }
        },
        {
          provide: ModalController,
          useValue: modalCtrlSpy
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatRoomComponent);
    component = fixture.componentInstance;
    routeStub = TestBed.inject(ActivatedRoute);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    chatServiceSpy = TestBed.inject(ChatService) as jasmine.SpyObj<ChatService>;
    utils = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    pusherSpy = TestBed.inject(PusherService) as jasmine.SpyObj<PusherService>;
    filestackSpy = TestBed.inject(FilestackService) as jasmine.SpyObj<FilestackService>;
    MockIoncontent = TestBed.inject(IonContent) as jasmine.SpyObj<IonContent>;
    fixture.detectChanges();
    component.content = MockIoncontent;
  });

  const mockChatMessages = {
    cursor: '32as4d654asd',
    messages: [
      {
        uuid: '5d71c830',
        senderUuid: '8bee29d0-bf45',
        isSender: false,
        message: '1',
        file: null,
        created: '2020-08-28 05:45:52'
      },
      {
        uuid: '0403b4d9',
        senderUuid: '8bee29d0-bf45',
        isSender: false,
        message: '2',
        file: null,
        created: '2020-08-28 05:45:50'
      }
    ]
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when testing onEnter()', () => {
    it('should call with correct data', () => {
      component.chatChannel = {
        uuid: '35326928',
        name: 'Team 1',
        avatar: 'https://sandbox.practera.com/img/team-white.png',
        pusherChannel: 'sdb746-93r7dc-5f44eb4f',
        isAnnouncement: false,
        isDirectMessage: false,
        readonly: false,
        roles: [
          'participant',
          'coordinator',
          'admin'
        ],
        unreadMessageCount: 0,
        lastMessage: null,
        lastMessageCreated: null,
        canEdit: false
      };
      component.loadingChatMessages = false;
      chatServiceSpy.getMessageList.and.returnValue(of(mockChatMessages));
      chatServiceSpy.getChatMembers.and.returnValue(of(mockMembers));
      chatServiceSpy.markMessagesAsSeen.and.returnValue(of({}));
      component.ngOnInit();
      expect(chatServiceSpy.getMessageList.calls.count()).toBe(1);
      expect(chatServiceSpy.getChatMembers.calls.count()).toBe(1);
    });

    it('should stop loading if no response got', () => {
      component.chatChannel = {
        uuid: '35326928',
        name: 'Team 1',
        avatar: 'https://sandbox.practera.com/img/team-white.png',
        pusherChannel: 'sdb746-93r7dc-5f44eb4f',
        isAnnouncement: false,
        isDirectMessage: false,
        readonly: false,
        roles: [
          'participant',
          'coordinator',
          'admin'
        ],
        unreadMessageCount: 0,
        lastMessage: null,
        lastMessageCreated: null,
        canEdit: false
      };
      component.loadingChatMessages = false;
      chatServiceSpy.getMessageList.and.returnValue(of(null));
      chatServiceSpy.getChatMembers.and.returnValue(of(mockMembers));
      chatServiceSpy.markMessagesAsSeen.and.returnValue(of({}));
      component.ngOnInit();
      expect(chatServiceSpy.getMessageList.calls.count()).toBe(1);
      expect(component.messagePageCursor).toEqual('');
      expect(component.loadingChatMessages).toEqual(false);
    });

    it('should stop loading if no messages got', () => {
      component.chatChannel = {
        uuid: '35326928',
        name: 'Team 1',
        avatar: 'https://sandbox.practera.com/img/team-white.png',
        pusherChannel: 'sdb746-93r7dc-5f44eb4f',
        isAnnouncement: false,
        isDirectMessage: false,
        readonly: false,
        roles: [
          'participant',
          'coordinator',
          'admin'
        ],
        unreadMessageCount: 0,
        lastMessage: null,
        lastMessageCreated: null,
        canEdit: false
      };
      component.loadingChatMessages = false;
      chatServiceSpy.getMessageList.and.returnValue(of({
        cursor: '32as4d654asd',
        messages: []
      }));
      chatServiceSpy.getChatMembers.and.returnValue(of(mockMembers));
      chatServiceSpy.markMessagesAsSeen.and.returnValue(of({}));
      component.ngOnInit();
      expect(chatServiceSpy.getMessageList.calls.count()).toBe(1);
      expect(component.messagePageCursor).toEqual('');
      expect(component.loadingChatMessages).toEqual(false);
    });
  });

  describe('when testing getMessageFromEvent()', () => {
    it('should call with correct data', fakeAsync(() => {
      const pusherData = {
        uuid: '5d71c830',
        isSender: false,
        message: '1',
        file: null,
        created: '2020-08-28 05:45:52',
        channelUuid: 'c43vwsvc',
        senderUuid: '8bee29d0-bf45',
        senderName: 'user01',
        senderRole: 'participants',
        senderAvatar: 'http://www.example.com/image.png'
      };
      const receivedMessage = component.getMessageFromEvent(pusherData);
      tick();
      expect(receivedMessage).toEqual({
        uuid: pusherData.uuid,
        senderName: pusherData.senderName,
        senderRole: pusherData.senderRole,
        senderAvatar: pusherData.senderAvatar,
        isSender: pusherData.isSender,
        message: pusherData.message,
        created: pusherData.created,
        file: pusherData.file,
        channelUuid: pusherData.channelUuid
      });
    }));
  });

  describe('when testing sendMessage()', () => {
    it('should call correctly', () => {
      component.typingMessage = 'testing message';
      component.channelUuid = '05';
      const saveMessageRes = {
        uuid: '0403b4d9',
        isSender: false,
        message: '2',
        file: null,
        created: '2020-08-28 05:45:50',
        senderUuid: '8bee29d0-bf45',
        senderName: 'user01',
        senderRole: 'participants',
        senderAvatar: 'http://www.example.com/image.png'
      };
      chatServiceSpy.postNewMessage.and.returnValue(of(saveMessageRes));
      chatServiceSpy.getMessageList.and.returnValue(of(mockChatMessages));
      pusherSpy.triggerSendMessage.and.returnValue();
      component.messageList = mockChatMessages.messages;
      spyOn(component.element.nativeElement, 'querySelector').and.returnValue(
        document.createElement('textarea')
      );
      component.sendMessage();
      expect(component.messageList[2]).toEqual({
        uuid: saveMessageRes.uuid,
        senderName: saveMessageRes.senderName,
        senderRole: saveMessageRes.senderRole,
        senderAvatar: saveMessageRes.senderAvatar,
        isSender: saveMessageRes.isSender,
        message: saveMessageRes.message,
        created: saveMessageRes.created,
        file: saveMessageRes.file,
        senderUuid: saveMessageRes.senderUuid
      });
    });
  });

  describe('when testing getAvatarClass()', () => {
    it('should return empty string as response', () => {
      component.messageList = mockChatMessages.messages;
      spyOn(component, 'checkToShowMessageTime').and.returnValue(true);
      const message = {
        uuid: '5d71c830',
        senderUuid: '8bee29d0-bf45',
        isSender: false,
        message: '1',
        file: null,
        created: '2020-08-28 05:45:52'
      };
      const isLast = component.getAvatarClass(message);
      expect(isLast).toEqual('');
    });
  });

  describe('when testing getClassForMessageBubble()', () => {
    it(`should return 'send-messages' string to send message`, () => {
      const message = {
        uuid: '5d71c830',
        senderUuid: '8bee29d0-bf45',
        isSender: true,
        message: '1',
        file: null,
        created: '2020-08-28 05:45:52'
      };
      const isLast = component.getClassForMessageBubble(message);
      expect(isLast).toEqual('send-messages');
    });
    it(`should return 'received-messages' string to received message`, () => {
      const message = {
        uuid: '5d71c830',
        senderUuid: '8bee29d0-bf45',
        isSender: false,
        message: '1',
        file: null,
        created: '2020-08-28 05:45:52'
      };
      const isLast = component.getClassForMessageBubble(message);
      expect(isLast).toEqual('received-messages');
    });
  });

  describe('when testing checkToShowMessageTime()', () => {
    it(`should return 'send-messages' string to send message`, () => {
      const message = {
        uuid: '0403b4d9',
        senderUuid: '8bee29d0-bf45',
        isSender: false,
        message: '2',
        file: null,
        created: '2020-08-28 05:45:50'
      };
      component.messageList = mockChatMessages.messages;
      const isLast = component.checkToShowMessageTime(message);
      expect(isLast).toEqual(false);
    });
  });

  describe('when testing typing()', () => {
    it(`should trigger Typing of pusher service with correst channel name`, () => {
      spyOn(utils, 'isEmpty').and.returnValue(true);
      component.chatChannel.pusherChannel = '123';
      pusherSpy.triggerTyping.and.returnValue();
      component.typing();
      expect(pusherSpy.triggerTyping.calls.count()).toBe(1);
      expect(pusherSpy.triggerTyping.calls.first().args[0]).toEqual('123');
    });
  });

  describe('when testing preview()', () => {
    it(`should call file stack previewFile if file didn't have mimetype`, () => {
      const file = {
        filename: 'unnamed.jpg',
        mimetype: null,
        url: 'https://cdn.filestackcontent.com/X8Cj0Y4QS2AmDUZX6LSq',
        status: 'Stored'
      };
      filestackSpy.previewFile.and.returnValue(Promise.resolve({}));
      component.preview(file);
      expect(filestackSpy.previewFile.calls.count()).toBe(1);
    });
    it(`should call modal controller if file have mimetype`, () => {
      const file = {
        filename: 'unnamed.jpg',
        mimetype: 'image/jpeg',
        url: 'https://cdn.filestackcontent.com/X8Cj0Y4QS2AmDUZX6LSq',
        status: 'Stored'
      };
      component.preview(file);
      expect(modalCtrlSpy.create.calls.count()).toBe(1);
    });
  });

  describe('when testing getTypeByMime()', () => {
    it(`should return 'File' if mimetype not found`, () => {
      const fileType = component.getTypeByMime(null);
      expect(fileType).toEqual('File');
    });
    it(`should return 'Zip' if mimetype contains compressed type`, () => {
      const fileType = component.getTypeByMime('application/x-compressed');
      expect(fileType).toEqual('Zip');
    });
    it(`should return 'Audio' if mimetype contains audio type`, () => {
      const fileType = component.getTypeByMime('audio/mp3');
      expect(fileType).toEqual('Audio');
    });
    it(`should return 'Image' if mimetype contains image type`, () => {
      const fileType = component.getTypeByMime('image/png');
      expect(fileType).toEqual('Image');
    });
    it(`should return 'Text' if mimetype contains text type`, () => {
      const fileType = component.getTypeByMime('text/Text');
      expect(fileType).toEqual('Text');
    });
    it(`should return 'Video' if mimetype contains viode type`, () => {
      const fileType = component.getTypeByMime('video/mp4');
      expect(fileType).toEqual('Video');
    });
    it(`should return 'PDF' if mimetype contains pdf type`, () => {
      const fileType = component.getTypeByMime('application/pdf');
      expect(fileType).toEqual('PDF');
    });
    it(`should return 'Word' if mimetype contains word type`, () => {
      const fileType = component.getTypeByMime('application/msword');
      expect(fileType).toEqual('Word');
    });
    it(`should return 'Excel' if mimetype contains excel type`, () => {
      const fileType = component.getTypeByMime('application/excel');
      expect(fileType).toEqual('Excel');
    });
    it(`should return 'Powerpoint' if mimetype contains powerpoint type`, () => {
      const fileType = component.getTypeByMime('application/mspowerpoint');
      expect(fileType).toEqual('Powerpoint');
    });
  });

  describe('when testing getIconByMime()', () => {
    it(`should return 'document' if mimetype not found`, () => {
      const fileType = component.getIconByMime(null);
      expect(fileType).toEqual('document');
    });
    it(`should return 'document' if mimetype contains compressed type`, () => {
      const fileType = component.getIconByMime('application/x-compressed');
      expect(fileType).toEqual('document');
    });
    it(`should return 'volume-mute' if mimetype contains audio type`, () => {
      const fileType = component.getIconByMime('audio/mp3');
      expect(fileType).toEqual('volume-mute');
    });
    it(`should return 'photos' if mimetype contains image type`, () => {
      const fileType = component.getIconByMime('image/png');
      expect(fileType).toEqual('photos');
    });
    it(`should return 'clipboard-outline' if mimetype contains text type`, () => {
      const fileType = component.getIconByMime('text/Text');
      expect(fileType).toEqual('clipboard-outline');
    });
    it(`should return 'videocam' if mimetype contains viode type`, () => {
      const fileType = component.getIconByMime('video/mp4');
      expect(fileType).toEqual('videocam');
    });
    it(`should return 'document' if mimetype contains pdf type`, () => {
      const fileType = component.getIconByMime('application/pdf');
      expect(fileType).toEqual('document');
    });
    it(`should return 'document' if mimetype contains word type`, () => {
      const fileType = component.getIconByMime('application/msword');
      expect(fileType).toEqual('document');
    });
    it(`should return 'document' if mimetype contains excel type`, () => {
      const fileType = component.getIconByMime('application/excel');
      expect(fileType).toEqual('document');
    });
    it(`should return 'document' if mimetype contains powerpoint type`, () => {
      const fileType = component.getIconByMime('application/mspowerpoint');
      expect(fileType).toEqual('document');
    });
  });

  describe('when testing openChatInfo()', () => {
    it(`should call modal controller if app in mobile view`, () => {
      utils.isMobile = jasmine.createSpy('utils.isMobile').and.returnValue(true);
      component.openChatInfo();
      expect(modalCtrlSpy.create.calls.count()).toBe(2);
    });
  });

  describe('when testing back()', () => {
    it(`should navigate to 'chat' page`, () => {
      component.back();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['app', 'chat']);
    });
  });

  describe('when testing loadMoreMessages()', () => {
    it(`should call loadMessages if scroll position in 0`, () => {
      component.chatChannel = {
        uuid: '35326928',
        name: 'Team 1',
        avatar: 'https://sandbox.practera.com/img/team-white.png',
        pusherChannel: 'sdb746-93r7dc-5f44eb4f',
        isAnnouncement: false,
        isDirectMessage: false,
        readonly: false,
        roles: [
          'participant',
          'coordinator',
          'admin'
        ],
        unreadMessageCount: 0,
        lastMessage: null,
        lastMessageCreated: null,
        canEdit: false
      };
      component.loadingChatMessages = false;
      chatServiceSpy.getMessageList.and.returnValue(of(mockChatMessages));
      chatServiceSpy.getChatMembers.and.returnValue(of(mockMembers));
      chatServiceSpy.markMessagesAsSeen.and.returnValue(of({}));
      component.loadMoreMessages({ detail: { scrollTop: 0 } });
      expect(chatServiceSpy.getMessageList.calls.count()).toBe(1);
    });
  });

  describe('when testing isLastMessage()', () => {
    it(`should assign correct value for 'noAvatar' variable`, () => {
      component.messageList = mockChatMessages.messages;
      component.isLastMessage(mockChatMessages.messages[1]);
      expect(component.messageList[1].noAvatar).toEqual(false);
    });
  });

});
