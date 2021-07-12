import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { NotificationService } from '../../shared/notification/notification.service';
import { AuthService } from '../auth.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';

@Component({
  selector: 'app-auth-reset-password',
  templateUrl: './auth-reset-password.component.html',
  styleUrls: ['./auth-reset-password.component.scss']
})
export class AuthResetPasswordComponent implements OnInit {
  apikey: string;

  isResetting = false;
  showPassword = false;

  resetPasswordForm = new FormGroup(
    {
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
    private newRelic: NewRelicService
  ) { }

  ngOnInit() {
    this.apikey = this.route.snapshot.paramMap.get('apikey');
    if (!this.apikey) {
      return this._notifyAndRedirect('Invalid reset password link');
    }
  }

  resetPassword() {
    const nrResetPasswordTracer = this.newRelic.createTracer('reset password');

    this.authService.resetPassword(
      {
        password: this.resetPasswordForm.controls.password.value
      },
      {
        apikey: this.apikey
      }).subscribe(
      res => {
        nrResetPasswordTracer();
        return this._notifyAndRedirect('Password successfully changed! Please login with the new password.');
      },
      err => {
        nrResetPasswordTracer();
        this.newRelic.noticeError('reset password failed', JSON.stringify(err));
        if (err.status === 400 && err.error.passwordCompromised) {
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
