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

  download() {
    return window.open(this.file.url, '_system');
  }

  close() {
    this.modalController.dismiss();
  }
}
