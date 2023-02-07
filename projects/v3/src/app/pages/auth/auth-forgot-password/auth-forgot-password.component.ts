import { Component } from '@angular/core';
import { NotificationsService } from '@v3/services/notifications.service';
import { UtilsService } from '@v3/services/utils.service';
import { AuthService } from '@v3/services/auth.service';

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
    private notificationsService: NotificationsService,
    private authService: AuthService,
    private utils: UtilsService
  ) {}

  async send(keyboardEvent?: KeyboardEvent) {
    if (keyboardEvent && (keyboardEvent?.code === 'Space' || keyboardEvent?.code === 'Enter')) {
      keyboardEvent.preventDefault();
    } else if (keyboardEvent) {
      return;
    }

    // basic validation
    if (this.email.length < 0 || !this.email) {
      return this.notificationsService.presentToast($localize`Please enter email`);
    }
    this.isSending = true;

    // call API to do forgot password logic
    this.authService.forgotPassword(this.email).subscribe(
      res => {
        this.isSending = false;
        // show pop up message for confirmation
        return this.notificationsService.popUp(
          'forgotPasswordConfirmation', {
            email: this.email
          },
          ['auth', 'login']
        );
      },
      err => {
        this.isSending = false;
        if (this.utils.has(err, 'data.type')) {
          // pop up if trying to reset password too frequently
          if (err.data.type === 'reset_too_frequently') {
            return this.notificationsService.alert({
              message: $localize`Please wait 2 minutes before attempting to reset your password again`,
              buttons: [
                {
                  text: $localize`OK`,
                  role: 'cancel'
                }
              ],
            });
          }
        }
        return this.notificationsService.presentToast($localize`Issue occured. Please try again`);
      }
    );
  }

}
