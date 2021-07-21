import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Apollo } from 'apollo-angular';
import { ChatListComponent } from './chat-list.component';
import { ChatService } from '../chat.service';
import { of } from 'rxjs';
import { BrowserStorageService } from '@services/storage.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { UtilsService } from '@services/utils.service';
import { PusherService } from '@shared/pusher/pusher.service';
import { MockRouter } from '@testing/mocked.service';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { FastFeedbackServiceMock } from '@testing/mocked.service';
import { FastFeedbackService } from '@app/fast-feedback/fast-feedback.service';
import { TestUtils } from '@testing/utils';

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
        NewRelicService,
        {
          provide: ChatService,
          useValue: jasmine.createSpyObj('ChatService', ['getChatList', 'getPusherChannels'])
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

  const mockChats = {
    data: {
      channels: [
        {
          uuid: '35326928',
          name: 'Team 1',
          avatar: 'https://sandbox.practera.com/img/team-white.png',
          pusherChannel: 'sdb746-93r7dc-5f44eb4f',
          isAnnouncement: false,
          isDirectMessag: false,
          readonly: false,
          roles: [
            'participant',
            'coordinator',
            'admin'
          ],
          unreadMessageCount: 0,
          lastMessage: null,
          lastMessageCreated: null
        },
        {
          uuid: 'ced963c1',
          name: 'Team 1 + Mentor',
          avatar: 'https://sandbox.practera.com/img/team-white.png',
          pusherChannel: 'kb5gt-9nfbj-5f45eb4g',
          isAnnouncement: false,
          isDirectMessage: false,
          readonly: false,
          roles: [
            'participant',
            'mentor',
            'coordinator',
            'admin'
          ],
          unreadMessageCount: 0,
          lastMessage: null,
          lastMessageCreated: null
        }
      ]
    }
  };

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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when testing constructor()', () => {
    it(`should call getChatList once more if an 'chat:new-message' event triggered`, () => {
      chatSeviceSpy.getChatList.and.returnValue(of(mockChats.data.channels));
      utils.broadcastEvent('chat:new-message', {});
      expect(chatSeviceSpy.getChatList.calls.count()).toBe(1);
    });
    it(`should call getChatList once more if an 'chat:info-update' event triggered`, () => {
      chatSeviceSpy.getChatList.and.returnValue(of(mockChats.data.channels));
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
