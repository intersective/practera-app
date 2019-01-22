import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { Observable, concat } from 'rxjs';
import { NotificationService } from '@shared/notification/notification.service';
import { SwitcherService } from '../../switcher/switcher.service';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';

@Component({
  selector: 'app-auth-direct-login',
  templateUrl: 'auth-direct-login.component.html',
  styles: ['']
})
export class AuthDirectLoginComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private notificationService: NotificationService,
    public utils: UtilsService,
    private switcherService: SwitcherService,
    private storage: BrowserStorageService,
  ) {}

  ngOnInit() {
    let authToken = this.route.snapshot.paramMap.get('authToken');
    if (!authToken) {
      return this._error();
    }
    this.authService.directLogin({
      authToken: authToken
    }).subscribe(res => {
      this._redirect();
    }, err => {
      this._error();
    });
  }

  /**
   * Redirect user to a specific page if data is passed in, otherwise redirect to program switcher page
   */
  private _redirect() {
    let searchParams;
    // get the query parameters
    if (window.location.search) {
      searchParams = new URLSearchParams(window.location.search.substring(1));
    }
    if (this.utils.isEmpty(searchParams) || !this.utils.has(searchParams, 'redirect') || !this.utils.has(searchParams, 't')) {
      // if there's no query parameter or required data
      return this.router.navigate(['/switcher']);
    }
    let program = this.utils.find(this.storage.get('programs'), {

    });
    // switch to the program
    this.switcherService.switchProgram(program)
      .subscribe(() => {
        this.router.navigate(['/app/home']);
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
