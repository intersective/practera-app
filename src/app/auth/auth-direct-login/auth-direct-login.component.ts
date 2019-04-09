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

  custom = {
    logo: null,
  };

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
    const authToken = this.route.snapshot.paramMap.get('authToken');
    if (!authToken) {
      return this._error();
    }
    this.authService.directLogin({
      authToken: authToken
    }).subscribe(
      res => {
        this._redirect();
      },
      err => {
        this._error();
      }
    );
  }

  /**
   * Redirect user to a specific page if data is passed in, otherwise redirect to program switcher page
   */
  private async _redirect() {
    const redirect = this.route.snapshot.paramMap.get('redirect');
    const timelineId = +this.route.snapshot.paramMap.get('tl');
    const activityId = +this.route.snapshot.paramMap.get('act');
    const contextId = +this.route.snapshot.paramMap.get('ctxt');
    const assessmentId = +this.route.snapshot.paramMap.get('asmt');
    const submissionId = +this.route.snapshot.paramMap.get('sm');
    if (!redirect || !timelineId) {
      // if there's no redirection or timeline id
      return this.router.navigate(['switcher']);
    }
    const program = this.utils.find(this.storage.get('programs'), value => {
      return value.timeline.id === timelineId;
    });
    if (this.utils.isEmpty(program)) {
      // if the timeline id is not found
      return this.router.navigate(['switcher']);
    }
    // switch to the program
    await this.switcherService.switchProgram(program);

    switch (redirect) {
      case 'home':
        return this.router.navigate(['app', 'home']);
      case 'project':
        return this.router.navigate(['app', 'project']);
      case 'activity':
        if (!activityId) {
          return this.router.navigate(['app', 'home']);
        }
        return this.router.navigate(['app', 'activity', activityId]);
      case 'assessment':
        if (!activityId || !contextId || !assessmentId) {
          return this.router.navigate(['app', 'home']);
        }
        return this.router.navigate(['assessment', 'assessment', activityId, contextId, assessmentId]);
      case 'reviews':
        return this.router.navigate(['app', 'reviews']);
      case 'review':
        if (!contextId || !assessmentId || !submissionId) {
          return this.router.navigate(['app', 'home']);
        }
        return this.router.navigate(['assessment', 'review', contextId, assessmentId, submissionId]);
      case 'chat':
        return this.router.navigate(['app', 'chat']);
      case 'settings':
        return this.router.navigate(['app', 'settings']);
      default:
        return this.router.navigate(['app', 'home']);
    }
    return this.router.navigate(['app', 'home']);
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
