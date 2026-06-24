import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  standalone: false,
  selector: 'app-file-preview',
  templateUrl: './file-preview.component.html',
  styleUrls: ['file-preview.component.scss']
})
export class FilePreviewComponent {
  url = '';
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
