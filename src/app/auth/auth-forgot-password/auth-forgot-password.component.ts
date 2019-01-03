import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UtilsService } from '@services/utils.service';
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
    private router: Router,
    private utils: UtilsService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  async send() {   
    // basic validation
    if (this.email.length < 0 || !this.email) {
      return this.notificationService.presentToast('Please enter email.', false);       
    }
    this.isSending = true;
    // call API to do forgot password logic
    this.authService.forgotPassword(this.email).subscribe(res => {
      this.isSending = false;
      if (res) {
        // show pop up message for confirmation
        return this.notificationService.popUp('forgotPasswordConfirmation', {
          email: this.email
        }, ['login']);
      } else {
        return this.notificationService.presentToast('Issue occured. Please try again.', false);       
      }
    });
        
  }

}