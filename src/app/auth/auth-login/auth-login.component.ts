import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
export class AuthLoginComponent implements OnInit {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });
  isLoggingIn = false;
  custom = {
    logo: null,
    background: null,
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    private utils: UtilsService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.data
      .subscribe((response: any) => {
        try {
          const expConfig = (response.config || {}).data;
          if (expConfig.length > 0) {
            this.custom.logo = expConfig[0].logo;
            if (expConfig[0].config.theme_color) {
              this.utils.changeThemeColor(expConfig[0].config.theme_color);
            }
          }
        } catch (err) {
          console.log('Inconsistent Experince config.');
          throw err;
        }
      });
  }

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
