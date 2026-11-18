import { CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IonContent, ModalController, PopoverController } from '@ionic/angular/lazy';
import { of, Subject } from 'rxjs';
import { MockRouter } from '@testingv3/mocked.service';
import { TestUtils } from '@testingv3/utils';
import { ChatService } from '@v3/services/chat.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { PusherService } from '@v3/services/pusher.service';
import { ModalService } from '@v3/services/modal.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { ChatRoomComponent } from './chat-room.component';

describe('ChatRoomComponent attachment previews', () => {
  let component: ChatRoomComponent;
  let fixture: ComponentFixture<ChatRoomComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [ChatRoomComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: UtilsService, useClass: TestUtils },
        { provide: ElementRef, useValue: new ElementRef(null) },
        {
          provide: IonContent,
          useValue: {
            scrollToBottom: jasmine.createSpy('scrollToBottom'),
            ionScrollEnd: new Subject(),
          },
        },
        {
          provide: ChatService,
          useValue: jasmine.createSpyObj('ChatService', {
            getChatMembers: of({ data: { channelMembers: [] } }),
            getMessageList: of({ messages: [], cursor: null }),
            postNewMessage: of(true),
            markMessagesAsSeen: of(true),
            postAttachmentMessage: of(true),
            deleteChatMessage: of(true),
            editChatMessage: of(true),
          }),
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['getCurrentChatChannel', 'getUser']),
        },
        {
          provide: PusherService,
          useValue: jasmine.createSpyObj('PusherService', ['triggerSendMessage', 'triggerTyping', 'triggerDeleteMessage', 'triggerEditMessage']),
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', ['alert', 'presentToast', 'loading', 'dismiss']),
        },
        {
          provide: ModalService,
          useValue: jasmine.createSpyObj('ModalService', ['addModal', 'openUppyModal']),
        },
        {
          provide: PopoverController,
          useValue: jasmine.createSpyObj('PopoverController', ['create', 'dismiss']),
        },
        { provide: Router, useClass: MockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: 1 }) },
            params: of({}),
          },
        },
        {
          provide: ModalController,
          useValue: jasmine.createSpyObj('ModalController', ['create', 'dismiss']),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    spyOn(ChatRoomComponent.prototype, 'ngAfterViewInit').and.callFake(() => undefined);
    fixture = TestBed.createComponent(ChatRoomComponent);
    component = fixture.componentInstance;
    component.content = TestBed.inject(IonContent);
    fixture.detectChanges();
  });

  function messageWith(file: { name: string; type: string; url: string }, preview: string) {
    return {
      uuid: 'preview-1',
      isSender: false,
      message: '',
      file,
      preview,
      created: '2020-08-28 05:45:52',
      sentAt: '2020-08-28 05:45:52',
      scheduled: null,
      senderName: 'Test',
      senderRole: 'participant',
    } as any;
  }

  it('stores a sanitised video url instead of a component tag', () => {
    const preview = (component as any).attachmentPreview({
      name: 'clip.mp4',
      type: 'video/mp4',
      url: 'https://cdn.example.com/clip.mp4?token=1',
    });

    expect(preview).toBe('https://cdn.example.com/clip.mp4?token=1');
    expect(preview).not.toContain('app-file-display');
    expect(component.isPlayableVideo('video/mp4')).toBeTrue();
    expect(component.isImagePreview({ type: 'video/mp4' }, preview)).toBeFalse();
  });

  it('stores a sanitised image url', () => {
    const preview = (component as any).attachmentPreview({
      name: 'shot.png',
      type: 'image/png',
      url: 'https://cdn.example.com/shot.png',
    });

    expect(preview).toBe('https://cdn.example.com/shot.png');
    expect(component.isImagePreview({ type: 'image/png' }, preview)).toBeTrue();
  });

  it('treats an image url on a video message as an image preview', () => {
    const preview = (component as any).attachmentPreview({
      name: 'poster',
      type: 'video/quicktime',
      url: 'https://cdn.example.com/poster.jpg',
    });

    expect(preview).toBe('https://cdn.example.com/poster.jpg');
    expect(component.isImagePreview({ type: 'video/quicktime' }, preview)).toBeTrue();
    expect(component.isPlayableVideo('video/quicktime')).toBeFalse();
  });

  it('drops a javascript url', () => {
    const preview = (component as any).attachmentPreview({
      name: 'bad.mp4',
      type: 'video/mp4',
      url: 'javascript:alert(1)',
    });

    expect(preview).toBe('Uploaded bad.mp4');
    expect(component.sanitisedMediaUrl(preview)).toBeNull();
    expect(preview).not.toContain('<video');
    expect(preview).not.toContain('app-file-display');
  });

  function renderWith(file: { name: string; type: string; url: string }, preview: string): HTMLElement {
    const proto = ChatRoomComponent.prototype as any;
    if (!jasmine.isSpy(proto.ngOnInit)) {
      spyOn(proto, 'ngOnInit').and.callFake(() => undefined);
    }
    fixture.destroy();
    fixture = TestBed.createComponent(ChatRoomComponent);
    component = fixture.componentInstance;
    component.content = TestBed.inject(IonContent);
    component.messageList = [messageWith(file, preview)];
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  it('renders a video element for a playable attachment', () => {
    const root = renderWith(
      { name: 'clip.mp4', type: 'video/mp4', url: 'https://cdn.example.com/clip.mp4' },
      'https://cdn.example.com/clip.mp4',
    );

    const video: HTMLVideoElement = root.querySelector('.file-attach video');
    expect(video).toBeTruthy();
    expect(video.getAttribute('src') || video.src).toContain('https://cdn.example.com/clip.mp4');
    expect(root.innerHTML).not.toContain('app-file-display');
  });

  it('renders an image element for an image attachment url', () => {
    const root = renderWith(
      { name: 'shot.png', type: 'image/png', url: 'https://cdn.example.com/shot.png' },
      'https://cdn.example.com/shot.png',
    );

    const image: HTMLImageElement = root.querySelector('.file-attach img');
    expect(image).toBeTruthy();
    expect(image.getAttribute('src') || image.src).toContain('https://cdn.example.com/shot.png');
    expect(root.innerHTML).not.toContain('app-file-display');
  });
});
