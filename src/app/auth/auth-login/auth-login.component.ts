import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { NotificationService } from '@shared/notification/notification.service';
import { UtilsService } from '@services/utils.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { BrowserStorageService, Stack } from '@services/storage.service';

@Component({
  selector: 'app-auth-login',
  templateUrl: 'auth-login.component.html',
  styleUrls: ['auth-login.component.scss']
})
export class AuthLoginComponent implements OnInit {
  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });
  isLoggingIn = false;
  showPassword = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    private utils: UtilsService,
    private newRelic: NewRelicService,
    private storage: BrowserStorageService
  ) {}

  ngOnInit() {
    this.newRelic.setPageViewName('login');
  }

  /**
   * This method will log user in to the system.
   * - first it check for validation of username an password. if it invalid will show an alert.
   * - Then it calling 'Login API' through 'authService.login' by passing username and password.
   * - If API call success 'Lgoin API' will return 'apikey' and stack list.
   * - Then save those return values in local storage as 'stacks' and 'loginApiKey'.
   * - Redirect user to the experience switcher page. as experience switcher page we use program swtcher page.
   * to read more about flow check documentation (./docs/workflows/auth-workflows.md)
   */
  login() {
    if (this.utils.isEmpty(this.loginForm.value.username) || this.utils.isEmpty(this.loginForm.value.password)) {
      return this.notificationFormat('Your username or password is empty, please fill them in.');
    }
    this.isLoggingIn = true;

    const nrLoginTracer = this.newRelic.createTracer('login request started', (message) => {
      this.newRelic.setCustomAttribute('login status', message);
    });
    return this.authService.login({
      username: this.loginForm.value.username,
      password: this.loginForm.value.password,
    }).subscribe(
      (res: {
        apikey: string;
        stacks: Stack[];
      }) => {
        if (res.stacks && res.stacks.length === 0) {
          return this.notificationFormat('No stacks available for this user.');
        }

        // this.storage.stackConfig = res.stacks[0] ? res.stacks[0] : null;
        this.storage.stackConfig = {
          "uuid": "9c31655d-fb73-4ea7-8315-aa4c725b367e",
          "name": "Practera Classic App - Sandbox",
          "description": "Participate in an experience as a learner or reviewer - Testing",
          "image": "https://media.intersective.com/img/learners_reviewers.png",
          "url": "https://app.p1-sandbox.practera.com",
          "type": "app",
          "coreApi": "https://admin.p1-sandbox.practera.com",
          "coreGraphQLApi": "https://kixs5acl6j.execute-api.ap-southeast-2.amazonaws.com/sandbox/",
          "chatApi": "https://antkrqcqa6.execute-api.ap-southeast-2.amazonaws.com/dev/graphql",
          "filestack": {
            "s3Config": {
              "paths": {
                "any": "",
                "image": "",
                "video": "",
              },
              "container": "files.p1-sandbox.practera.com",
              "region": "ap-southeast-2"
            }
          },
          "defaultCountryModel": "AUS",
          "lastLogin": 1625542957105
        };

        this.storage.set('isLoggedIn', true);
        this.storage.stacks = res.stacks;
        this.storage.loginApiKey = res.apikey;
        this.isLoggingIn = false;
        return this.router.navigate(['switcher', 'switcher-program']);
      },
      err => {
        nrLoginTracer(JSON.stringify(err));
        this._handleError(err);
      }
    );
  }

  /**
   * reusable format for popup notification
   *
   * @param   {string}  message
   *
   * @return  {Promise<void>}
   */
  private notificationFormat(message): Promise<void> {
    return this.notificationService.alert({
      message: message,
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
          handler: () => {
            this.isLoggingIn = false;
          },
        },
      ],
    });
  }

  private _handleError(err) {
    this.newRelic.noticeError(`${JSON.stringify(err)}`);
    const statusCode = err.status;
    let msg = 'Your username or password is incorrect, please try again.';
    // credential issue
    if (statusCode === 400 && err.error && err.error.passwordCompromised) {
      msg = `We’ve checked this password against a global database of insecure passwords and your password was on it. <br>
      Please try again. <br>
      You can learn more about how we check that <a href="https://haveibeenpwned.com/Passwords">database</a>`;
    }
    this.isLoggingIn = false;
    this.notificationFormat(msg);
  }
}
