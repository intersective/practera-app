import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Apollo } from 'apollo-angular';
import { ChatRoomComponent } from './chat-room.component';
import { ChatService } from '../chat.service';
import { of } from 'rxjs';
import { BrowserStorageService } from '@services/storage.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { UtilsService } from '@services/utils.service';
import { PusherService } from '@shared/pusher/pusher.service';
import { FilestackService } from '@shared/filestack/filestack.service';
import { MockRouter } from '@testing/mocked.service';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { IonContent, ModalController } from '@ionic/angular';

describe('ChatRoomComponent', () => {
  // let component: ChatRoomComponent;
  // let fixture: ComponentFixture<ChatRoomComponent>;
  // let chatSeviceSpy: jasmine.SpyObj<ChatService>;
  // let utils: UtilsService;
  // let storageSpy: jasmine.SpyObj<BrowserStorageService>;
  // let pusherSpy: jasmine.SpyObj<PusherService>;
  // let filestackSpy: jasmine.SpyObj<FilestackService>;
  // let routerSpy: jasmine.SpyObj<Router>;
  // let routeStub: Partial<ActivatedRoute>;
  // let ModalControllerSpy: Partial<ModalController>;

  beforeEach(async(() => {
    // TestBed.configureTestingModule({
    //   imports: [ RouterTestingModule ],
    //   declarations: [ ChatRoomComponent ],
    //   schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
    //   providers: [
    //     Apollo,
    //     UtilsService,
    //     NewRelicService,
    //     {
    //       provide: ChatService,
    //       useValue: jasmine.createSpyObj('ChatService', ['getChatMembers', 'getMessageList', 'postNewMessage', 'markMessagesAsSeen', 'postAttachmentMessage'])
    //     },
    //     {
    //       provide: BrowserStorageService,
    //       useValue: jasmine.createSpyObj('BrowserStorageService', ['getCurrentChatChannel', 'getUser'])
    //     },
    //     {
    //       provide: PusherService,
    //       useValue: jasmine.createSpyObj('PusherService', ['triggerSendMessage', 'triggerTyping'])
    //     },
    //     {
    //       provide: FilestackService,
    //       useValue: jasmine.createSpyObj('FilestackService', ['getFileTypes', 'getS3Config', 'open', 'previewFile'])
    //     },
    //     {
    //       provide: Router,
    //       useClass: MockRouter,
    //       /*useValue: {
    //         navigate: jasmine.createSpy('navigate'),
    //         events: of()
    //       }*/
    //     },
    //     {
    //       provide: ActivatedRoute,
    //       useValue: {
    //         snapshot: {
    //           paramMap: convertToParamMap({ id: 1 })
    //         }
    //       }
    //     },
    //     {
    //       provide: ModalController,
    //       useValue: jasmine.createSpyObj('ModalController', ['create'])
    //     }
    //   ]
    // })
    // .compileComponents();
  }));

  beforeEach(() => {
    // fixture = TestBed.createComponent(ChatRoomComponent);
    // component = fixture.componentInstance;
    // routeStub = TestBed.inject(ActivatedRoute);
    // routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    // chatSeviceSpy = TestBed.inject(ChatService) as jasmine.SpyObj<ChatService>;
    // utils = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;
    // storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    // pusherSpy = TestBed.inject(PusherService) as jasmine.SpyObj<PusherService>;
    // filestackSpy = TestBed.inject(FilestackService) as jasmine.SpyObj<FilestackService>;
    // ModalControllerSpy = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    // fixture.detectChanges();
  });

  // const mockMembers = {
  //   data: {
  //     channel: {
  //       members: [
  //         {
  //           uuid: '8bee29d0-bf45',
  //           name: 'student+02',
  //           role: 'participant',
  //           avatar: 'https://www.gravatar.com/avatar/db30b12260b2c589b1394b26390eab50?d=https://sandbox.practera.com/img/user-512.png&s=50'
  //         },
  //         {
  //           uuid: '8d1f3cdf-d697',
  //           name: 'student+01',
  //           role: 'participant',
  //           avatar: 'https://www.gravatar.com/avatar/21b7427270a606e8a3c4413a13bb47c6?d=https://sandbox.practera.com/img/user-512.png&s=50'
  //         }
  //       ]
  //     }
  //   }
  // };

  it('should create', () => {
    // expect(component).toBeTruthy();
  });

  // describe('when testing constructor()', () => {
  //   it(`should call getChatMembers once more if an 'chat:new-message' event triggered`, () => {
  //     chatSeviceSpy.getChatMembers.and.returnValue(of(mockMembers));
  //     utils.broadcastEvent('chat:new-message', {
  //       uuid: 'ass38-efoj',
  //       senderUuid: '8bee29d0-bf45',
  //       isSender: false,
  //       message: 'test',
  //       created: '2020-10-15',
  //       file: null,
  //       channelUuid: 'assw035-e3r'
  //     });
  //     component.onEnter();
  //     expect(chatSeviceSpy.getChatMembers.calls.count()).toBe(1);
  //     // expect(component.events.length).toBeGreaterThan(0);
  //   });
  // });

  /*it('should load messages with loadMessage', () => {
    spyOn(ChatService, 'getMessageList').and.returnValue(true);
    expect(component.loadMessages).toBeDefined();
    component.loadMessages();
    expect(component.loadMessages).toBeDefined;
  });*/

});
