import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';
import { ChatService } from '@v3/services/chat.service';
import { of, throwError } from 'rxjs';
import { EditMessagePopupComponent } from './edit-message-popup.component';
import { FormsModule } from '@angular/forms';

describe('EditMessagePopupComponent', () => {
  let component: EditMessagePopupComponent;
  let fixture: ComponentFixture<EditMessagePopupComponent>;
  let chatServiceSpy: jasmine.SpyObj<ChatService>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [EditMessagePopupComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: ChatService,
          useValue: jasmine.createSpyObj('ChatService', ['editChatMessage']),
        },
        {
          provide: ModalController,
          useValue: jasmine.createSpyObj('ModalController', ['dismiss']),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMessagePopupComponent);
    component = fixture.componentInstance;
    chatServiceSpy = TestBed.inject(ChatService) as jasmine.SpyObj<ChatService>;
    modalCtrlSpy = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    it('should populate message and uuid from chatMessage input', () => {
      component.chatMessage = {
        uuid: 'msg-uuid-1',
        sender: null,
        isSender: true,
        message: '<p>hello world</p>',
        file: null,
        created: '2025-01-01',
        scheduled: null,
        sentAt: '2025-01-01',
      };
      component.ngOnInit();
      expect(component.message).toEqual('<p>hello world</p>');
      expect(component.messageUuid).toEqual('msg-uuid-1');
    });

    it('should handle null chatMessage gracefully', () => {
      component.chatMessage = null;
      component.ngOnInit();
      expect(component.message).toEqual('');
      expect(component.messageUuid).toEqual('');
    });
  });

  describe('editMessage()', () => {
    beforeEach(() => {
      component.messageUuid = 'msg-uuid-1';
      component.message = '<p>updated text</p>';
    });

    it('should call chatService.editChatMessage and set updateSuccess on success', () => {
      chatServiceSpy.editChatMessage.and.returnValue(of({ data: { editChatLog: { success: true } } }));
      component.editMessage();
      expect(chatServiceSpy.editChatMessage).toHaveBeenCalledWith({
        uuid: 'msg-uuid-1',
        message: '<p>updated text</p>',
      });
      expect(component.updateSuccess).toBeTrue();
      expect(component.sending).toBeFalse();
    });

    it('should set sending to false on error', () => {
      chatServiceSpy.editChatMessage.and.returnValue(throwError(() => new Error('api error')));
      component.editMessage();
      expect(component.sending).toBeFalse();
      expect(component.updateSuccess).toBeFalse();
    });

    it('should not call api if messageUuid is empty', () => {
      component.messageUuid = '';
      component.editMessage();
      expect(chatServiceSpy.editChatMessage).not.toHaveBeenCalled();
    });

    it('should not call api if already sending', () => {
      component.sending = true;
      component.editMessage();
      expect(chatServiceSpy.editChatMessage).not.toHaveBeenCalled();
    });
  });

  describe('close()', () => {
    it('should dismiss with updateSuccess and newMessageData on success', async () => {
      component.updateSuccess = true;
      component.message = '<p>edited</p>';
      modalCtrlSpy.dismiss.and.returnValue(Promise.resolve(true));
      await component.close();
      expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith({
        updateSuccess: true,
        newMessageData: '<p>edited</p>',
      });
    });

    it('should dismiss with null newMessageData when not updated', async () => {
      component.updateSuccess = false;
      component.message = '<p>draft</p>';
      modalCtrlSpy.dismiss.and.returnValue(Promise.resolve(true));
      await component.close();
      expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith({
        updateSuccess: false,
        newMessageData: null,
      });
    });
  });
});
