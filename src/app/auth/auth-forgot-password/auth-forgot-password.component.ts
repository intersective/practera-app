import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { NotificationComponent } from '../../components/notification/notification.component';

@Component({
  selector: 'app-auth-forgot-password',
  templateUrl: 'auth-forgot-password.component.html',
  styleUrls: ['auth-forgot-password.component.css']
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
      component: NotificationComponent,
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