import { Component, ViewChild } from '@angular/core';
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
  @ViewChild('achievementBadgePopup') achievementBadgePopup;
  @ViewChild('badgeImage') badgeImage;
  @ViewChild('achievementName') achievementName;
  @ViewChild('dismissButton') dismissButton;

  constructor(
    public modalController: ModalController,
    public utils: UtilsService
  ) {}

  ionViewDidEnter() {
    const interactiveEl = [
      this.badgeImage.nativeElement,
      this.achievementName.nativeElement,
      this.dismissButton.el,
    ];

    let focusPosition = 0;
    interactiveEl[focusPosition].focus();
    if (this.achievementBadgePopup && this.achievementBadgePopup.el) {
      this.achievementBadgePopup.el.addEventListener('keydown', event => {
        if (event.defaultPrevented) {
          return;
        }

        const key = event.key || event.keyCode;
        if (event.key === '9') {
          event.preventDefault();
          if (focusPosition < interactiveEl.length - 1) {
            focusPosition += 1;
          } else {
            focusPosition = 0;
          }
          interactiveEl[focusPosition].focus();
        }
        return;
      });
    }
  }

  confirmed(event) {
    if (event instanceof KeyboardEvent && event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    this.modalController.dismiss();
  }
}
