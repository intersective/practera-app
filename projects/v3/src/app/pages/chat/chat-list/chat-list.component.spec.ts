import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ChatListComponent } from './chat-list.component';
import { ChatChannel, ChatService } from '@v3/services/chat.service';
import { of } from 'rxjs';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { PusherService } from '@v3/services/pusher.service';
import { MockRouter } from '@testingv3/mocked.service';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { FastFeedbackServiceMock } from '@testingv3/mocked.service';
import { FastFeedbackService } from '@v3/services/fast-feedback.service';
import { TestUtils } from '@testingv3/utils';
import { mockChats } from '@testingv3/fixtures';

const mockPusherChannels = {
  data: {
    channels: [
      {
        pusherChannel: 'sdb746-93r7dc-5f44eb4f'
      },
      {
        pusherChannel: 'kb5gt-9nfbj-5f45eb4g'
      }
    ]
  }
};

describe('ChatListComponent', () => {
  let component: ChatListComponent;
  let fixture: ComponentFixture<ChatListComponent>;
  let chatSeviceSpy: jasmine.SpyObj<ChatService>;
  let utils: UtilsService;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;
  let pusherSpy: jasmine.SpyObj<PusherService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routeStub: Partial<ActivatedRoute>;
  let fastFeedbackSpy: jasmine.SpyObj<FastFeedbackService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ChatListComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: ChatService,
          useValue: jasmine.createSpyObj('ChatService', {
            'getChatList': of(mockChats.data.channels),
            'getPusherChannels': of(true),
          })
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['setCurrentChatChannel', 'getUser'])
        },
        {
          provide: PusherService,
          useValue: jasmine.createSpyObj('PusherService', ['subscribeChannel'])
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
          provide: FastFeedbackService,
          useClass: FastFeedbackServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatListComponent);
    component = fixture.componentInstance;
    routeStub = TestBed.inject(ActivatedRoute);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    chatSeviceSpy = TestBed.inject(ChatService) as jasmine.SpyObj<ChatService>;
    utils = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    pusherSpy = TestBed.inject(PusherService) as jasmine.SpyObj<PusherService>;
    fastFeedbackSpy = TestBed.inject(FastFeedbackService) as jasmine.SpyObj<FastFeedbackService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when testing constructor()', () => {
    it(`should call getChatList once more if an 'chat:new-message' event triggered`, () => {
      utils.broadcastEvent('chat:new-message', {});
      expect(chatSeviceSpy.getChatList.calls.count()).toBe(1);
    });

    it(`should call getChatList once more if an 'chat:info-update' event triggered`, () => {
      utils.broadcastEvent('chat:info-update', {});
      expect(chatSeviceSpy.getChatList.calls.count()).toBe(1);
    });
  });

  describe('when testing onEnter()', () => {
    it('should get correct chat list and pusher channels', () => {
      chatSeviceSpy.getChatList.and.returnValue(of(mockChats.data.channels));
      chatSeviceSpy.getPusherChannels.and.returnValue(of(mockPusherChannels.data.channels));
      component.onEnter();
      expect(component.chatList).toBeDefined();
      expect(chatSeviceSpy.getChatList.calls.count()).toBe(1);
      expect(chatSeviceSpy.getPusherChannels.calls.count()).toBe(1);
    });
  });

  describe('when testing goToChatRoom()', () => {
    it('should emit the navigate with chat channel', () => {
      spyOn(component.navigate, 'emit');
      utils.isMobile = jasmine.createSpy('utils.isMobile').and.returnValue(false);
      component.goToChatRoom(
        {
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
          canEdit: true
        }
      );
      expect(component.navigate.emit).toHaveBeenCalled();
    });
  });

});
