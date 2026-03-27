import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

export interface PopUpData {
  email: string;
  message: string;
  logo: string;
  routes?: { label: string; path: string; }[]; // guidelines
}

@Component({
  selector: 'app-pop-up',
  templateUrl: 'pop-up.component.html',
  styleUrls: ['pop-up.component.scss']
})
export class PopUpComponent {
  type = '';
  redirect = ['/'];
  @Input() data: PopUpData = {
    email: '',
    message: '',
    logo: '',
    routes: [],
  };

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

  goTo(route: string) {
    this.modalController.dismiss();
    this.router.navigate([route]);
  }
}
