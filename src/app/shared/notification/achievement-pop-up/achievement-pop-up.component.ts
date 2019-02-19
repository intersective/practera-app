import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Achievement, AchievementsService } from "@app/achievements/achievements.service";

@Component({
  selector: 'app-achievement-pop-up',
  templateUrl: 'achievement-pop-up.component.html',
  styleUrls: ['achievement-pop-up.component.scss']
})
export class AchievementPopUpComponent {
  type: string = '';
  achievement: Achievement;

  constructor(
    public modalController: ModalController,
    public achievementService: AchievementsService
  ) {}

  confirmed() {
    this.modalController.dismiss();
  }
}
