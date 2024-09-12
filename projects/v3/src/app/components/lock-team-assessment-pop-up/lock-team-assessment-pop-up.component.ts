import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UtilsService } from '@v3/services/utils.service';

@Component({
  selector: 'app-lock-team-assessment-pop-up',
  templateUrl: 'lock-team-assessment-pop-up.component.html',
  styleUrls: ['lock-team-assessment-pop-up.component.scss']
})
export class LockTeamAssessmentPopUpComponent {
  name = '';
  image = '';
  isMobile: boolean;

  constructor(
    public modalController: ModalController,
    private utils: UtilsService
  ) {
    this.isMobile = this.utils.isMobile();
  }

  confirmed() {
    this.modalController.dismiss(true);
  }
}
