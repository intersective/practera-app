import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UtilsService } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';

@Component({
  selector: 'app-auth-forgot-password',
  templateUrl: 'auth-forgot-password.component.html',
  styleUrls: ['auth-forgot-password.component.scss']
})
export class AuthForgotPasswordComponent {
  email = '';

  constructor(
    private router: Router,
    private utils: UtilsService,
    private notificationService: NotificationService
  ) {}

  async send() {
    // -- todo
    // call API to do forgot password logic
    
    // show pop up message for confirmation
    return this.notificationService.popUp('forgotPasswordConfirmation', {
      email: this.email
    }, ['login']);
  }

}