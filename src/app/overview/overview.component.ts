import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';
import { BrowserStorageService } from '@services/storage.service';
import { UtilsService } from '@services/utils.service';
import { combineLatest, Observable, of } from 'rxjs';
import { FastFeedbackService } from '../fast-feedback/fast-feedback.service';
import { PushNotificationService, PermissionTypes } from '@services/push-notification.service';
import { NotificationService } from '@shared/notification/notification.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  isMobile: boolean;
  programName: string;
  initiator$ = this.route.params;

  constructor(
    private storage: BrowserStorageService,
    private utils: UtilsService,
    private route: ActivatedRoute,
    private router: Router,
    private fastFeedbackService: FastFeedbackService,
    private pushNotificationService: PushNotificationService,
    private notificationService: NotificationService
  ) {
    this.isMobile = this.utils.isMobile();
    route.data.subscribe(() => {
      this.checkPNPermission(router.routerState.snapshot);
    });
  }

  ngOnInit() {
    this.pushNotificationService.initiatePushNotification();
    this.initiator$.subscribe(() => {
      this.programName = this.storage.getUser().programName;
      this.fastFeedbackService.pullFastFeedback().subscribe();
    });
  }

  async checkPNPermission(snapshot: RouterStateSnapshot): Promise<void> {
    const showPrompt = await this.pushNotificationService.promptForPermission(PermissionTypes.firstVisit, snapshot);
    if (showPrompt) {
      await this.notificationService.pushNotificationPermissionPopUp('Would you like to be notified when you receive new push notification?');
    }
    return;
  }
}
