import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-achievement-pop-up',
  templateUrl: 'achievement-pop-up.component.html',
  styleUrls: ['achievement-pop-up.component.scss']
})
export class AchievementPopUpComponent {
  type = '';
  data = {};

  constructor(
    public modalController: ModalController
  ) {}

  confirmed() {
    this.modalController.dismiss();
  }
}