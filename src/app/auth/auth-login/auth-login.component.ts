import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Observable, concat } from 'rxjs';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { NotificationService } from '@shared/notification/notification.service';

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
    private notificationService: NotificationService
  ) {}

  login() {
    this.isLoggingIn = true;
    this.authService.login({
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    }).subscribe(res => {
      this.isLoggingIn = false;
      this.router.navigate(['/switcher']);
    }, err => {
      this.notificationService.alert({
        message: 'Your email or password is incorrect, please try again.',
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
    });
  }
}