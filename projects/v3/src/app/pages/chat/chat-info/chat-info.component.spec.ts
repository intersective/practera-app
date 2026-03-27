import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, Directive } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ChatInfoComponent } from './chat-info.component';
import { UtilsService } from '@v3/services/utils.service';
import { MockRouter } from '@testingv3/mocked.service';
import { ModalController } from '@ionic/angular';
import { BrowserStorageService } from '@v3/services/storage.service';
import { ChatService } from '@v3/services/chat.service';
import { of } from 'rxjs';
import { TestUtils } from '@testingv3/utils';
import { mockMembers } from '@testingv3/fixtures';
import { ActivatedRouteStub } from '@testingv3/activated-route-stub';

describe('ChatInfoComponent', () => {
  let component: ChatInfoComponent;
  let fixture: ComponentFixture<ChatInfoComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let chatServiceSpy: jasmine.SpyObj<ChatService>;
  let utils: UtilsService;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;
  const modalSpy = jasmine.createSpyObj('Modal', ['present', 'onDidDismiss']);
  modalSpy.onDidDismiss.and.returnValue(new Promise(() => { }));
  const modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
  modalCtrlSpy.create.and.returnValue(modalSpy);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChatInfoComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: new ActivatedRouteStub({}),
        },
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: ModalController,
          useValue: jasmine.createSpyObj('ModalController', ['dismiss'])
        },
        {
          provide: ChatService,
          useValue: jasmine.createSpyObj('ChatService', {
            'getChatMembers': of(mockMembers)
          })
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['getCurrentChatChannel', 'getUser'])
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatInfoComponent);
    component = fixture.componentInstance;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    chatServiceSpy = TestBed.inject(ChatService) as jasmine.SpyObj<ChatService>;
    utils = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when testing ngOnInit()', () => {
    it(`should call chat service to get memeber list`, () => {
      component.selectedChat = {
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
        canEdit: false,
      };
      component.ngOnInit();
      expect(chatServiceSpy.getChatMembers.calls.count()).toBe(1);
    });
  });

  describe('close()', () => {
    /* it('should call router navigate if keybord event enter', () => {
      component.selectedChat = {
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
      const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      spyOn(component.navigate, 'emit');
      utils.isMobile = jasmine.createSpy('utils.isMobile').and.returnValue(false);
      component.close(keyEvent);
      expect(component.navigate.emit).toHaveBeenCalled();
    }); */
    xit('should not do anything if keybord event not enter or space', () => {
      const keyEvent = new KeyboardEvent('keydown', { key: 'A' });
      spyOn(component.navigate, 'emit');
      utils.isMobile = jasmine.createSpy('utils.isMobile').and.returnValue(false);
      component.close(keyEvent);
      expect(component.navigate.emit).not.toHaveBeenCalled();
    });
  });

});
