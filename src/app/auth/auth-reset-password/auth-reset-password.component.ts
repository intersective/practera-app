import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { NotificationService } from '../../shared/notification/notification.service';
import { AuthService } from '../auth.service';
import { UtilsService } from '@services/utils.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';

@Component({
  selector: 'app-auth-reset-password',
  templateUrl: './auth-reset-password.component.html',
  styleUrls: ['./auth-reset-password.component.scss']
})
export class AuthResetPasswordComponent implements OnInit {
  email: string;
  key: string;

  verifySuccess = false;
  isResetting = false;
  showPassword = false;

  resetPasswordForm = new FormGroup(
    {
      email: new FormControl(
        {
          value: this.email,
          disabled: true,
        },
        [ Validators.email ]
      ),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl(''),
    },
    { validators: this.checkPasswordMatching }
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private authService: AuthService,
    private utils: UtilsService,
    private newRelic: NewRelicService
  ) { }

  ngOnInit() {
    this.key = this.route.snapshot.paramMap.get('key');
    this.email = this.route.snapshot.paramMap.get('email');

    if (!this.key || !this.email) {
      return this._notifyAndRedirect('Invalid reset password link');
    }

    const nrVerifyResetTracer = this.newRelic.createTracer('verify reset password');

    // Call API to verify that key and email parameters from reset password URL are valid
    this.authService.verifyResetPassword({ key: this.key, email: this.email }).subscribe(
      res => {
        nrVerifyResetTracer();
        // verification of key and email is successfuly.
        this.verifySuccess = true;
      },
      err => {
        nrVerifyResetTracer();
        this.newRelic.noticeError('verify reset', JSON.stringify(err));
        return this._notifyAndRedirect('Invalid reset password link');
      }
    );
  }

  resetPassword() {
    const data = {
      key: this.key,
      email: this.email,
      password: this.resetPasswordForm.controls.password.value,
      verify_password: this.resetPasswordForm.controls.confirmPassword.value
    };

    const nrResetPasswordTracer = this.newRelic.createTracer('reset password');

    this.authService.resetPassword(data).subscribe(
      res => {
        nrResetPasswordTracer();
        return this._notifyAndRedirect('Password successfully changed! Please login with the new password.');
      },
      err => {
        nrResetPasswordTracer();
        this.newRelic.noticeError('reset password failed', JSON.stringify(err));
        if (this.utils.has(err, 'data.type')) {
          if (err.data.type === 'password_compromised') {
            return this.notificationService.alert({
              message: `We’ve checked this password against a global database of insecure passwords and your password was on it. <br>
                Please try again. <br>
                You can learn more about how we check that <a href="https://haveibeenpwned.com/Passwords">database</a>`,
              buttons: [
                {
                  text: 'OK',
                  role: 'cancel'
                }
              ],
            });
          }
        }
        return this.notificationService.presentToast('Error updating password.Try again');
      }
    );
  }

  checkPasswordMatching(resetPasswordForm: FormGroup) {
    const password = resetPasswordForm.controls.password.value;
    const confirmPassword = resetPasswordForm.controls.confirmPassword.value;

    return password === confirmPassword ? null : { notMatching : true };
  }

  private _notifyAndRedirect(msg) {
    this.notificationService.alert({
      message: msg,
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
          handler: () => {
            this.router.navigate(['login']);
          }
        }
      ]
    });
  }

}
