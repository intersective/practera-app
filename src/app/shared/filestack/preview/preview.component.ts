import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-preview',
  templateUrl: 'preview.component.html',
  styleUrls: ['preview.component.css']
})
export class PreviewComponent {
  url = '';

  constructor(
    public modalController: ModalController,
    public sanitizer: DomSanitizer
  ) {}

  close() {
    this.modalController.dismiss();
  }
}