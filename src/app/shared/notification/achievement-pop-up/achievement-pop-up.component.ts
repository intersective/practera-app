import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Achievement } from '@app/achievements/achievements.service';
import { UtilsService } from '@services/utils.service';

@Component({
  selector: 'app-achievement-pop-up',
  templateUrl: 'achievement-pop-up.component.html',
  styleUrls: ['achievement-pop-up.component.scss']
})
export class AchievementPopUpComponent {
  type = '';
  achievement: Achievement;

  constructor(
    public modalController: ModalController,
    public utils: UtilsService
  ) {}

  confirmed() {
    this.modalController.dismiss();
  }
}
