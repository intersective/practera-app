import { Component, OnInit } from '@angular/core';
import { NotificationService } from '@shared/notification/notification.service';
import { UtilsService } from '@services/utils.service';
import { AuthService } from '../auth.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';

@Component({
  selector: 'app-auth-forgot-password',
  templateUrl: 'auth-forgot-password.component.html',
  styleUrls: ['auth-forgot-password.component.scss']
})
export class AuthForgotPasswordComponent implements OnInit {
  email = '';
  // variable to control the label of the button
  isSending = false;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private utils: UtilsService,
    private newRelic: NewRelicService
  ) {}

  ngOnInit() {
    this.newRelic.setPageViewName('forgotpassword');
  }

  async send() {
    // basic validation
    if (this.email.length < 0 || !this.email) {
      return this.notificationService.presentToast('Please enter email', false);
    }
    this.isSending = true;
    // call API to do forgot password logic
    this.authService.forgotPassword(this.email).subscribe(
      res => {
        this.newRelic.actionText('forgot password request sent');
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
        this.newRelic.noticeError(`Password Reset Error: ${JSON.stringify(err)}`);
        this.isSending = false;
        if (this.utils.has(err, 'data.type')) {
          // pop up if trying to reset password too frequently
          if (err.data.type === 'reset_too_frequently') {
            return this.notificationService.alert({
              message: `Please wait 2 minutes before attempting to reset your password again`,
              buttons: [
                {
                  text: 'OK',
                  role: 'cancel'
                }
              ],
            });
          }
        }
        return this.notificationService.presentToast('Issue occured. Please try again', false);
      }
    );
  }

}
