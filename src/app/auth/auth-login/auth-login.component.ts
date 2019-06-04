import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Observable, concat } from 'rxjs';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { NotificationService } from '@shared/notification/notification.service';
import { UtilsService } from '@services/utils.service';

@Component({
  selector: 'app-auth-login',
  templateUrl: 'auth-login.component.html',
  styleUrls: ['auth-login.component.scss']
})
export class AuthLoginComponent {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });
  isLoggingIn = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    private utils: UtilsService
  ) {}

  login() {
    if (this.utils.isEmpty(this.loginForm.value.email) || this.utils.isEmpty(this.loginForm.value.password)) {
      this.notificationService.alert({
        message: 'Your email or password is empty, please fill them in.',
        buttons: [
          {
            text: 'OK',
            role: 'cancel',
            handler: () => {
              this.isLoggingIn = false;
              return;
            }
          }
        ]
      });
      return;
    }
    this.isLoggingIn = true;
    this.authService.login({
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    }).subscribe(
      res => {
        this.isLoggingIn = false;
        this.router.navigate(['/switcher']);
      },
      err => {
        if (this.utils.has(err, 'data.type')) {
          if (err.data.type === 'password_compromised' &&
            this.utils.has(err, 'data.reset_url') &&
            this.utils.has(err, 'data.directlogin_url')) {
            this.isLoggingIn = false;
            const resetUrl = err.data.reset_url.replace(/.+\?/, '/?');
            const directLoginUrl = err.data.directlogin_url.replace(/.+\?/, '/?');
            return this.notificationService.alert({
              message: 'Sorry, we tested that password and it is not strong enough.',
              buttons: [
                {
                  text: 'Reset Password',
                  handler: () => {
                    window.location.replace(resetUrl);
                    return;
                  },
                },
                {
                  text: 'Continue Login',
                  handler: () => {
                    window.location.replace(directLoginUrl);
                    return;
                  },
                },
              ],
            });
          }
        }
        this.notificationService.alert({
          message: 'Your email or password is incorrect, please try again.',
          buttons: [
            {
              text: 'OK',
              role: 'cancel',
              handler: () => {
                this.isLoggingIn = false;
                return;
              },
            },
          ],
        });
      }
    );
  }
}
