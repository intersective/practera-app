import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { SettingService } from './setting.service';
import { BrowserStorageService } from '@services/storage.service';
import { UtilsService } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { RouterEnter } from '@services/router-enter.service';
import { FastFeedbackService } from '../fast-feedback/fast-feedback.service';
import { FilestackService } from '@shared/filestack/filestack.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.component.html',
  styleUrls: ['settings.component.scss']
})

export class SettingsComponent extends RouterEnter {

  routeUrl = '/app/settings';
  profile = {
    contactNumber: '',
    email: '',
    image: '',
    name: ''
  };
  currentProgramName = '';
  currentProgramImage = '';

  returnLtiUrl = '';

  helpline = 'help@practera.com';

  termsUrl = 'https://images.practera.com/terms_and_conditions/practera_terms_conditions.pdf';
  // controll profile image updating
  imageUpdating = false;
  acceptFileTypes;
  // card image CDN
  cdn = 'https://cdn.filestackcontent.com/resize=fit:crop,width:';

  constructor (
    public router: Router,
    private authService: AuthService,
    private settingService: SettingService,
    public storage: BrowserStorageService,
    public utils: UtilsService,
    private notificationService: NotificationService,
    private filestackService: FilestackService,
    public fastFeedbackService: FastFeedbackService,
    private newRelic: NewRelicService,

  ) {
    super(router);
  }

  onEnter() {
    this.newRelic.setPageViewName('Setting');

    // get contact number and email from local storage
    this.profile.email = this.storage.getUser().email;
    this.profile.contactNumber = this.storage.getUser().contactNumber;
    this.profile.image = this.storage.getUser().image ? this.storage.getUser().image : 'https://my.practera.com/img/user-512.png';
    this.profile.name = this.storage.getUser().name;
    this.acceptFileTypes = this.filestackService.getFileTypes('image');
    // also get program name
    this.currentProgramName = this.storage.getUser().programName;
    this.currentProgramImage = this._getCurrentProgramImage();
    this.fastFeedbackService.pullFastFeedback().subscribe();
    this.returnLtiUrl = this.storage.getUser().LtiReturnUrl;
  }

  // loading pragram image to settings page by resizing it depend on device.
  // in mobile we are not showing card with image but in some mobile phones on landscape mode desktop view is loading.
  // because of that we load image also in mobile view.
  private _getCurrentProgramImage () {
    if (!this.utils.isEmpty(this.storage.getUser().programImage)) {
      let imagewidth = 600;
      const imageId = this.storage.getUser().programImage.split('/').pop();
      if (!this.utils.isMobile()) {
        imagewidth = 1024;
      }
      return `${this.cdn}${imagewidth}/${imageId}`;
    }
    return '';
  }

  openLink() {
    this.newRelic.actionText('Open T&C link');
    window.open(this.termsUrl, '_system');
  }
  switchProgram() {
    if (this.returnLtiUrl) {
      this.newRelic.actionText('browse to LTI return link');
      window.location.href = 'https://' + this.returnLtiUrl;
    } else {
      this.newRelic.actionText('browse to program switcher');
      this.router.navigate(['switcher', 'switcher-program']);
    }
  }

  isInMultiplePrograms() {
    return this.storage.get('programs').length > 1;
  }

  // send email to Help request
  mailTo() {
    this.newRelic.actionText('mail to helpline');
    const mailto = 'mailto:' + this.helpline + '?subject=' + this.currentProgramName;
    window.open(mailto, '_self');
  }

  logout() {
    return this.authService.logout();
  }

  async uploadProfileImage(file, type = null) {
    if (file.success) {
      this.newRelic.actionText('Upload profile image');
      this.imageUpdating = true;
      this.settingService.updateProfileImage({
        image: file.data.url
      }).subscribe(
        success => {
          this.imageUpdating = false;
          this.profile.image = file.data.url;
          this.storage.setUser({
            image: file.data.url
          });
          return this.notificationService.alert({
            message: 'Profile picture successfully updated!',
            buttons: [
              {
                text: 'OK',
                role: 'cancel'
              }
            ]
          });
        },
        err => {
          this.newRelic.noticeError(`Image upload failed: ${JSON.stringify(err)}`);
          this.imageUpdating = false;
          return this.notificationService.alert({
            message: 'File upload failed, please try again later.',
            buttons: [
              {
                text: 'OK',
                role: 'cancel'
              }
            ]
          });
        });
    } else {
      return this.notificationService.alert({
        message: 'File upload failed, please try again later.',
        buttons: [
          {
            text: 'OK',
            role: 'cancel'
          }
        ]
      });
    }
  }

}
