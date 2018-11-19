import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-pop-up',
  templateUrl: 'pop-up.component.html',
  styleUrls: ['pop-up.component.css']
})
export class PopUpComponent {
  type = '';
  redirect = ['pages', 'tabs'];
  data = {};

  constructor(
    private router: Router,
    public modalController: ModalController
  ) {}

  confirmed() {
    this.modalController.dismiss();
    // if this.redirect == false, don't redirect to another page
    if (this.redirect) {
      this.router.navigate(this.redirect);
    }
  }
}