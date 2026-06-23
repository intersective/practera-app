import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ChatService, EditMessageParam, Message } from '@v3/services/chat.service';
import { QuillModules } from 'ngx-quill';

/**
 * popup component for editing a sent chat message.
 * displays a quill editor pre-populated with the message text.
 */
@Component({
  selector: 'app-edit-message-popup',
  standalone: false,
  templateUrl: './edit-message-popup.component.html',
  styleUrls: ['./edit-message-popup.component.scss'],
})
export class EditMessagePopupComponent implements OnInit {
  @Input() chatMessage: Message;

  message: string = '';
  messageUuid: string = '';
  updateSuccess = false;
  sending = false;

  editorModules: QuillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
    ],
  };

  constructor(
    private modalController: ModalController,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    if (this.chatMessage) {
      this.message = this.chatMessage.message || '';
      this.messageUuid = this.chatMessage.uuid || '';
    }
  }

  /**
   * submit edit to the api.
   */
  editMessage() {
    if (!this.messageUuid || this.sending) {
      return;
    }

    this.sending = true;
    const editParam: EditMessageParam = {
      uuid: this.messageUuid,
      message: this.message,
    };

    this.chatService.editChatMessage(editParam).subscribe({
      next: () => {
        this.updateSuccess = true;
        this.sending = false;
      },
      error: (error) => {
        this.sending = false;
        console.error('error editing message', error);
      },
    });
  }

  /**
   * dismiss the modal, returning update status and new message data.
   */
  async close() {
    const returnData = {
      updateSuccess: this.updateSuccess || false,
      newMessageData: this.updateSuccess ? this.message : null,
    };
    await this.modalController.dismiss(returnData);
  }
}
