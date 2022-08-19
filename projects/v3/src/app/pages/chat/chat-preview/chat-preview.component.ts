import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-chat-preview',
  templateUrl: 'chat-preview.component.html',
  styleUrls: ['chat-preview.component.scss']
})
export class ChatPreviewComponent {
  file: any = {};

  constructor(
    public modalController: ModalController,
    public sanitizer: DomSanitizer
  ) {}

  download(keyboardEvent?: KeyboardEvent) {
    if (keyboardEvent && (keyboardEvent?.code === 'Space' || keyboardEvent?.code === 'Enter')) {
      keyboardEvent.preventDefault();
    } else if (keyboardEvent) {
      return;
    }

    return window.open(this.file.url, '_system');
  }

  close(keyboardEvent?: KeyboardEvent) {
    if (keyboardEvent && (keyboardEvent?.code === 'Space' || keyboardEvent?.code === 'Enter')) {
      keyboardEvent.preventDefault();
    } else if (keyboardEvent) {
      return;
    }

    this.modalController.dismiss();
  }
}
