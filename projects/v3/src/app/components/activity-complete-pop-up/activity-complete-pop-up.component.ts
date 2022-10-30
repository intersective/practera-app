import { Component, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UtilsService } from '@v3/services/utils.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-activity-complete-pop-up',
  templateUrl: 'activity-complete-pop-up.component.html',
  styleUrls: ['activity-complete-pop-up.component.scss']
})
export class ActivityCompletePopUpComponent {
  activityId: number;
  activityCompleted: boolean;
  @ViewChild('activityComplete') activityComplete;
  @ViewChild('reviewTasks') reviewTasks;
  @ViewChild('continueNextActivity') continueNextActivity;

  constructor(
    public modalController: ModalController,
    public utils: UtilsService,
    private router: Router,
  ) {}

  ionViewDidEnter() {
    const interactiveEl = [
      this.reviewTasks.el,
      this.continueNextActivity.el,
    ];

    let focusPosition = 0;
    interactiveEl[focusPosition].focus();
    this.activityComplete.el.addEventListener('keydown', event => {
      if (event.defaultPrevented) {
        return;
      }

      if (event.key === 'Tab') {
        event.preventDefault();
        if (focusPosition < interactiveEl.length - 1) {
          focusPosition += 1;
        } else {
          focusPosition = 0;
        }
        interactiveEl[focusPosition].focus();
      }
    });
  }

  confirmed(continueToActivity: boolean) {
    this.modalController.dismiss();
    if (!continueToActivity) {
      const route = this.utils.isMobile() ? ['v3', 'activity-mobile', this.activityId] : ['v3', 'activity-desktop', this.activityId];
      this.router.navigate(route);
    } else {
      if (this.activityCompleted) {
        this.router.navigate(['v3', 'home'], { queryParams: { activityId: this.activityId, activityCompleted: this.activityCompleted } });
      } else {
        this.router.navigate(['v3', 'home'], { queryParams: { activityId: this.activityId } });
      }
    }
  }
}
