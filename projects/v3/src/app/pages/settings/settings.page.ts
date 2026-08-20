import { UppyUploaderService } from './../../components/uppy-uploader/uppy-uploader.service';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@v3/services/auth.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { Subject, firstValueFrom } from 'rxjs';
import { AlertOptions, ModalController } from '@ionic/angular';
import { RequestService } from 'request';

import { environment } from '@v3/environments/environment';
import { first, takeUntil } from 'rxjs/operators';
import { SupportPopupComponent } from '../../components/support-popup/support-popup.component';

@Component({
  standalone: false,
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit, OnDestroy {
  @Input() mode?: string; // indicate parents element: modal
  window; // document window

  profile = {
    contactNumber: '',
    email: '',
    avatar: '',
    name: ''
  };
  hasMultipleStacks = false;
  currentProgramName = '';
  currentProgramImage = '';

  returnLtiUrl = '';

  helpline = environment.helpline;

  termsUrl = 'https://images.practera.com/terms_and_conditions/practera_terms_conditions.pdf';
  // controll profile image updating
  imageUpdating = false;
  acceptFileTypes = ['image/*'];

  // hubspot form
  hubspotActivated: boolean = false;
  unsubscribe$ = new Subject();

  constructor(
    public router: Router,
    private readonly route: ActivatedRoute,
    private authService: AuthService,
    private storage: BrowserStorageService,
    readonly utils: UtilsService,
    private notificationsService: NotificationsService,
    private modalController: ModalController,
    private uppyUploaderService: UppyUploaderService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private request: RequestService,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.window = this.document.defaultView;
    this.route.queryParams.pipe(takeUntil(this.unsubscribe$))
    .subscribe(_params => {
      this._retrieveUserInfo();
    });
  }

  private async _retrieveUserInfo(): Promise<void> {
    try {
      await firstValueFrom(this.authService.getMyInfo());
      const user = this.storage.getUser();
      const {
        email,
        contactNumber,
        avatar,
        name,
        programName,
        LtiReturnUrl,
        programImage
      } = user;
      this.ngZone.run(() => {
        this.profile.email = email;
        this.profile.contactNumber = contactNumber;
        this.profile.avatar = avatar ? avatar : 'https://my.practera.com/img/user-512.png';
        this.profile.name = name;
        this.currentProgramName = programName;
        this.returnLtiUrl = LtiReturnUrl;
        this.currentProgramImage = programImage;
        this.cdr.markForCheck();
      });
    } catch (error) {
      this.notificationsService.alert({
        message: $localize`Failed to retrieve user information`,
        buttons: [
          {
            text: $localize`OK`,
            role: 'cancel'
          }
        ]
      });
    }
  }

  ngOnInit() {
    this.utils.setPageTitle('Settings - Practera');
    this._retrieveUserInfo();
    this.utils.getEvent('support-email-checked')
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(event => {
      this.ngZone.run(() => {
        this.hubspotActivated = event;
        this.cdr.markForCheck();
      });
    });
    this.utils.checkIsPracteraSupportEmail();
  }

  get isMobile() {
    return this.utils.isMobile();
  }

  dismiss() {
    this.modalController.dismiss({
      'dismissed': true
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
  }

  get isAdminOrCoordinator(): boolean {
    const role = this.storage.getUser()?.role;
    return role === 'admin' || role === 'coordinator' || role === 'inst_admin';
  }

  async openAdminConsole(event): Promise<void> {
    if (event instanceof KeyboardEvent && event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    try {
      const response = await firstValueFrom(this.request.get('api/auth/admin_link.json'));
      const url = response?.data?.url || response?.data?.link;
      if (!url) {
        throw new Error('Admin console link unavailable');
      }
      window.open(url, '_blank');
    } catch {
      await this.notificationsService.presentToast(
        $localize`Unable to open Admin Console. Please try again later.`,
        { color: 'danger' },
      );
    }
  }

  openLink(event) {
    if (event instanceof KeyboardEvent && event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    window.open(this.termsUrl, '_system');
  }

  switchProgram(event) {
    if (event instanceof KeyboardEvent && event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    if (this.returnLtiUrl) {
      this.utils.redirectToUrl(this.returnLtiUrl);
    } else {
      this.router.navigate(['switcher', 'switcher-program']);
    }
  }

  isInMultiplePrograms() {
    return this.storage.get('programs').length > 1;
  }

  // send email to Help request
  mailTo(event) {
    if (event instanceof KeyboardEvent && event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    let mailto = `mailto:${this.helpline}?subject=${this.currentProgramName}`;
    const supportEmail = this.utils.getSupportEmail();

    // check if support email is not practera one and have support email
    // then send message to that email
    if (!this.utils.checkIsPracteraSupportEmail() && !this.utils.isEmpty(supportEmail)) {
      mailto = `mailto:${supportEmail}?subject=${this.currentProgramName}`;
    }
    window.open(mailto, '_self');
  }

  logout(event) {
    if (event instanceof KeyboardEvent && event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    this.dismiss();
    return this.authService.logout({}, true);
  }

  async profileImage() {
    try {
      const modal = await this.uppyUploaderService.open('user-profile');
      const res = await modal.onDidDismiss();

      // eslint-disable-next-line no-console
      console.log('file-upload res', res);

      if (!res?.data) {
        return;
      }

      const file = res.data;
      if (file) {
        this.imageUpdating = true;
        await firstValueFrom(this.authService.updateUserProfile({
          url: file.tus.uploadUrl,
          name: file.name,
          extension: file.extension,
          type: file.type,
          size: file.size,
          bucket: file.bucket,
          path: file.path,
        }));

        this.imageUpdating = false;
        this.profile.avatar = file.preview;
        this.storage.setUser({ image: file.preview });

        return this.notificationsService.alert({
          message: $localize`Profile picture successfully updated!`,
          buttons: [
            {
              text: $localize`OK`,
              role: 'cancel'
            }
          ]
        });
      }
    } catch (error) {
      this.imageUpdating = false;

      // eslint-disable-next-line no-console
      console.error('profile image error', error);

      const alertOpts: AlertOptions = {
        message: $localize`File upload failed, please try again later.`,
        buttons: [
          {
            text: $localize`OK`,
            role: 'cancel'
          }
        ]
      };

      // Actual error message from server
      if (error?.error?.message || error?.error?.msg) {
        alertOpts.subHeader = error?.error?.message || error?.error?.msg;
      }
      return this.notificationsService.alert(alertOpts);
    }
  }

  goBack(): void {
    return this.window.history.back();
  }

  /**
   * Open hubspot support popup or activate browser default mailto function
   * @param event click event (keyboard/mouse/touch event)
   * @returns void
   */
  async openSupportPopup(event): Promise<void> {
    if (event instanceof KeyboardEvent && event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    if (this.hubspotActivated === true) {
      const componentProps = {
        mode: 'modal',
        isShowFormOnly: true,
      };

      const modal = await this.modalController.create({
        componentProps,
        component: SupportPopupComponent,
        cssClass: 'support-popup',
        backdropDismiss: false,
      });

      return modal.present();
    }

    return this.mailTo(event);
  }

  openBadgeApp(event) {
    if (event instanceof KeyboardEvent && event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    this.router.navigate(['v3', 'badges-certificates']);
  }
}
