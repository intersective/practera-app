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
    let redirect = this.route.snapshot.paramMap.get('redirect');
    let timelineId = +this.route.snapshot.paramMap.get('tl');
    let activityId = +this.route.snapshot.paramMap.get('act');
    let contextId = +this.route.snapshot.paramMap.get('ctxt');
    let assessmentId = +this.route.snapshot.paramMap.get('asmt');
    let submissionId = +this.route.snapshot.paramMap.get('sm');
    if (!redirect || !timelineId) {
      // if there's no redirection or timeline id
      return this.router.navigate(['switcher']);
    }
    let program = this.utils.find(this.storage.get('programs'), value => {
      return value.timeline.id === timelineId;
    });
    if (this.utils.isEmpty(program)) {
      // if the timeline id is not found
      return this.router.navigate(['switcher']);
    }
    // switch to the program
    this.switcherService.switchProgram(program)
      .subscribe(() => {
        switch (redirect) {
          case "home":
            return this.router.navigate(['app', 'home']);
          case "project":
            return this.router.navigate(['app', 'project']);
          case "activity":
            if (!activityId) {
              return this.router.navigate(['app', 'home']);
            }
            return this.router.navigate(['app', 'activity', activityId]);
          case "assessment":
            if (!activityId || !contextId || !assessmentId) {
              return this.router.navigate(['app', 'home']);
            }
            return this.router.navigate(['assessment', 'assessment', activityId, contextId, assessmentId]);
          case "reviews":
            return this.router.navigate(['app', 'reviews']);
          case "review":
            if (!contextId || !assessmentId || !submissionId) {
              return this.router.navigate(['app', 'home']);
            }
            return this.router.navigate(['assessment', 'review', contextId, assessmentId, submissionId]);
          case "chat":
            return this.router.navigate(['app', 'chat']);
          case "settings":
            return this.router.navigate(['app', 'settings']);
          default:
            return this.router.navigate(['app', 'home']);
        }
        this.router.navigate(['app', 'home']);
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
