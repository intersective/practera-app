import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-filestack-preview',
  templateUrl: './filestack-preview.component.html',
  styleUrls: ['filestack-preview.component.scss']
})
export class FilestackPreviewComponent {
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
