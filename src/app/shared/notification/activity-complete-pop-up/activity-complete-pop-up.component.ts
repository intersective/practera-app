import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UtilsService } from '@services/utils.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-activity-complete-pop-up',
  templateUrl: 'activity-complete-pop-up.component.html',
  styleUrls: ['activity-complete-pop-up.component.scss']
})
export class ActivityCompletePopUpComponent {
  activityId: number;
  activityCompleted: boolean;

  constructor(
    public modalController: ModalController,
    public utils: UtilsService,
    private router: Router,
  ) {}

  confirmed(continueToActivity: boolean) {
    this.modalController.dismiss();
    if (!continueToActivity) {
      this.router.navigate(['app', 'activity', this.activityId]);
    } else {
      if (this.activityCompleted) {
        this.router.navigate(['app', 'home'], { queryParams: { activityId: this.activityId, activityCompleted: this.activityCompleted } });
      } else {
        this.router.navigate(['app', 'home'], { queryParams: { activityId: this.activityId } });
      }
    }
  }
}
