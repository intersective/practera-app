import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-preview',
  templateUrl: 'preview.component.html',
  styleUrls: ['preview.component.scss']
})
export class PreviewComponent {
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
