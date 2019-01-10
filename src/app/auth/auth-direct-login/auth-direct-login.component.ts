import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { Observable, concat } from 'rxjs';
import { NotificationService } from '@shared/notification/notification.service';

@Component({
  selector: 'app-auth-direct-login',
  template: '',
  styles: ['']
})
export class AuthDirectLoginComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    let authToken = this.route.snapshot.paramMap.get('authToken');
    if (!authToken) {
      return this._error();
    }
    this.authService.directLogin({
      authToken: authToken
    }).subscribe(res => {
      this.router.navigate(['/switcher']);
    }, err => {
      this._error();
    });
  }

  private _error() {
    this.notificationService.alert({
      message: 'Your link is invalid or expired.',
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
          handler: () => {
            this.router.navigate(['/login']);
          }
        }
      ]
    });
  }

}