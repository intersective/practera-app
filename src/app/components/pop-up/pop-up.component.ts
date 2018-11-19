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
  redirect = '/';
  data = {};

  constructor(
    private router: Router,
    public modalController: ModalController
  ) {}

  confirmed() {
    this.modalController.dismiss();
    this.router.navigate([this.redirect]);
  }
}