import { Component } from '@angular/core';
import { NotificationService } from '@shared/notification/notification.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-auth-forgot-password',
  templateUrl: 'auth-forgot-password.component.html',
  styleUrls: ['auth-forgot-password.component.scss']
})
export class AuthForgotPasswordComponent {
  email = '';
  // variable to control the label of the button
  isSending = false;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  async send() {
    // basic validation
    if (this.email.length < 0 || !this.email) {
      return this.notificationService.presentToast('Please enter email', false);
    }
    this.isSending = true;
    // call API to do forgot password logic
    this.authService.forgotPassword(this.email).subscribe(
      res => {
        this.isSending = false;
        // show pop up message for confirmation
        return this.notificationService.popUp(
          'forgotPasswordConfirmation', {
            email: this.email
          },
          ['/login']
        );
      },
      err => {
        this.isSending = false;
        return this.notificationService.presentToast('Issue occured. Please try again', false);
      }
    );
  }

}
