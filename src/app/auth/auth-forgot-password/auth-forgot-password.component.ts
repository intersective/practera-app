import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { PopUpComponent } from '../../components/pop-up/pop-up.component';

@Component({
  selector: 'app-auth-forgot-password',
  templateUrl: 'auth-forgot-password.component.html',
  styleUrls: ['auth-forgot-password.component.scss']
})
export class AuthForgotPasswordComponent {
  email = '';

  constructor(
    private router: Router,
    public modalController: ModalController
  ) {}

	async send() {
    // -- todo
    // call API to do forgot password logic
    const modal = await this.modalController.create({
      component: PopUpComponent,
      componentProps: { 
        type: 'forgotPasswordConfirmation',
        data: {
          email: this.email
        },
        redirect: "/login"
      }
    });
    return await modal.present();
	}

}