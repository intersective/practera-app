import { Component, OnInit, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { Observable, concat } from 'rxjs';
import { NotificationService } from '@shared/notification/notification.service';
import { SwitcherService } from '../../switcher/switcher.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { async } from '../../../../node_modules/@types/q';

@Component({
  selector: 'app-auth-global-login',
  templateUrl: 'auth-global-login.component.html'
})
export class AuthGlobalLoginComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private notificationService: NotificationService,
    private switcherService: SwitcherService,
    private ngZone: NgZone,
    private newRelic: NewRelicService
  ) {}

  async ngOnInit() {
    this.newRelic.setPageViewName('global-login');
    const apikey = this.route.snapshot.paramMap.get('apikey');
    if (!apikey) {
      return this._error();
    }

    const nrGlobalLoginTracer = this.newRelic.createTracer('Processing global login');
    // move try catch inside to timeout, because if try catch is outside it not catch errors happen inside timeout.
    setTimeout(
      async () => {
        try {
          await this.authService.globalLogin({ apikey }).toPromise();
          await this.switcherService.getMyInfo().toPromise();
          nrGlobalLoginTracer();
          return this.navigate(['switcher', 'switcher-program']);
        } catch (err) {
          this._error(err);
        }
        // tslint:disable-next-line:align
      }, 50
    );
  }

  // force every navigation happen under radar of angular
  private navigate(direction): Promise<boolean> {
    return this.ngZone.run(() => {
      this.newRelic.setCustomAttribute('redirection', direction);
      return this.router.navigate(direction);
    });
  }

  private _error(res?): Promise<any> {
    this.newRelic.noticeError('failed global login', res ? JSON.stringify(res) : undefined);
    return this.notificationService.alert({
      message: 'Your link is invalid or expired.',
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
          handler: () => {
            this.navigate(['login']);
          }
        }
      ]
    });
  }

}
