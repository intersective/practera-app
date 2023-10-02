import { Component, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { AuthService } from '@v3/services/auth.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { UtilsService } from '@v3/services/utils.service';
import { ExperienceService } from '@v3/services/experience.service';
import { environment } from '@v3/environments/environment';

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
  readonly developmentOnly = isDevMode();
  readonly globalLoginLink = environment.globalLoginUrl;

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
        message: $localize`Your email or password is empty, please fill them in.`,
        buttons: [
          {
            text: $localize`OK`,
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

    return this.authService.deprecatingLogin({
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    }).subscribe(
      async res => {
        this.loginForm.reset();
        try {
          await this.experienceService.switchProgram(res);
          this.isLoggingIn = false;
          return this.router.navigate(['v3', 'home']);
        } catch (err) {
          console.error(err); // @TODO: please report issues to API
          return this.notificationsService.alert({
            message: $localize`We're experiencing difficulties in fetching your program data. Could you please attempt to log in again.`,
            buttons: [
              {
                text: $localize`OK`,
                role: 'cancel'
              }
            ],
          });
        }
      },
      err => {
        // notify user about weak password
        if (this.utils.has(err, 'data.type')) {
          if (err.data.type === 'password_compromised') {
            this.isLoggingIn = false;
            return this.notificationsService.alert({
              message: $localize`We’ve checked this password against a global database of insecure passwords and your password was on it.<br>We have sent you an email with a link to reset your password.<br>You can learn more about how we check that <a href="https://haveibeenpwned.com/Passwords">database</a>`,
              buttons: [
                {
                  text: $localize`OK`,
                  role: 'cancel'
                }
              ],
            });
          }
        }

        // credential issue
        this.notificationsService.alert({
          message: $localize`Your email or password is incorrect, please try again.`,
          buttons: [
            {
              text: $localize`OK`,
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
