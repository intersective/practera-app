import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { AuthService } from '@v3/services/auth.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { UtilsService } from '@v3/services/utils.service';
import { ExperienceService } from '@v3/services/experience.service';

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
  showPassword = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationsService: NotificationsService,
    private utils: UtilsService,
    private experienceService: ExperienceService,
  ) {}

  login(keyboardEvent?: KeyboardEvent) {
    if (keyboardEvent && (keyboardEvent?.code === 'Space' || keyboardEvent?.code === 'Enter')) {
      keyboardEvent.preventDefault();
    } else if (keyboardEvent) {
      return;
    }

    if (this.utils.isEmpty(this.loginForm.value.email) || this.utils.isEmpty(this.loginForm.value.password)) {
      this.notificationsService.alert({
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

    return this.authService.login({
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    }).subscribe(
      res => {
        this.loginForm.reset();
        return this._handleNavigation(res.programs);
      },
      err => {
        // notify user about weak password
        if (this.utils.has(err, 'data.type')) {
          if (err.data.type === 'password_compromised') {
            this.isLoggingIn = false;
            return this.notificationsService.alert({
              message: `We’ve checked this password against a global database of insecure passwords and your password was on it. <br>
                We have sent you an email with a link to reset your password. <br>
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

        // credential issue
        this.notificationsService.alert({
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

  private async _handleNavigation(programs) {
    const route = await this.experienceService.switchProgramAndNavigate(programs);
    this.isLoggingIn = false;
    return this.router.navigate(route);
  }
}
