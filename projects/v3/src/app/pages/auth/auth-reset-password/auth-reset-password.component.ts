import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { NotificationsService } from '@v3/services/notifications.service';
import { AuthService } from '@v3/services/auth.service';
import { UtilsService } from '@v3/services/utils.service';

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

  resetPasswordForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notificationsService: NotificationsService,
    private authService: AuthService,
    private utils: UtilsService
  ) {
    this.resetPasswordForm = new FormGroup(
      {
        email: new FormControl(
          {
            value: this.email,
            disabled: true,
          },
          [Validators.email]
        ),
        password: new FormControl('', [Validators.required]),
        confirmPassword: new FormControl(''),
      },
      { validators: this.checkPasswordMatching }
    );
  }

  ngOnInit() {
    this.key = this.route.snapshot.paramMap.get('key');
    this.email = this.route.snapshot.paramMap.get('email');

    if (!this.key || !this.email) {
      return this._notifyAndRedirect($localize`Invalid reset password link`);
    }

    // Call API to verify that key and email parameters from reset password URL are valid
    this.authService.verifyResetPassword({ key: this.key, email: this.email }).subscribe(
      res => {
        // verification of key and email is successfuly.
        this.verifySuccess = true;
      },
      err => {
        return this._notifyAndRedirect($localize`Invalid reset password link`);
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

    this.authService.resetPassword(data).subscribe(
      res => {
        this.resetPasswordForm.reset();
        return this._notifyAndRedirect($localize`Password successfully changed! Please login with the new password.`);
      },
      err => {
        if (this.utils.has(err, 'data.type')) {
          if (err.data.type === 'password_compromised') {
            return this.notificationsService.alert({
              message: $localize`We’ve checked this password against a global database of insecure passwords and your password was on it.<br>Please try again.<br>You can learn more about how we check that <a href="https://haveibeenpwned.com/Passwords">database</a>`,
              buttons: [
                {
                  text: $localize`OK`,
                  role: 'cancel'
                }
              ],
            });
          }
        }
        return this.notificationsService.presentToast($localize`Error updating password. Please try again.`);
      }
    );
  }

  checkPasswordMatching(resetPasswordForm: FormGroup) {
    const password = resetPasswordForm.controls.password.value;
    const confirmPassword = resetPasswordForm.controls.confirmPassword.value;

    return password === confirmPassword ? null : { notMatching : true };
  }

  private _notifyAndRedirect(msg: string) {
    this.notificationsService.alert({
      message: msg,
      buttons: [
        {
          text: $localize`OK`,
          role: 'cancel',
          handler: () => {
            this.router.navigate(['auth', 'login']);
          }
        }
      ]
    });
  }

}
