import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-lock-team-assessment-pop-up',
  templateUrl: 'lock-team-assessment-pop-up.component.html',
  styleUrls: ['lock-team-assessment-pop-up.component.scss']
})
export class LockTeamAssessmentPopUpComponent {
  type = '';
  data = {};

  constructor(
    public modalController: ModalController
  ) {
    console.log('data', this.data);
  }

  confirmed() {
    this.modalController.dismiss();
  }
}
