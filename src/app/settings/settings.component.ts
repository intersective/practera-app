import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { SettingService } from './setting.service';
import { BrowserStorageService } from '@services/storage.service';
import { UtilsService } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { environment } from '../../environments/environment.prod';
import { RouterEnter } from '@services/router-enter.service';
import { FastFeedbackService } from '../fast-feedback/fast-feedback.service';
import { FilestackService } from '@shared/filestack/filestack.service';


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

  helpline = 'help@practera.com';

  termsUrl = 'https://images.practera.com/terms_and_conditions/practera_terms_conditions.pdf';
  // controll profile image updating
  imageUpdating = false;
  acceptFileTypes;

  constructor (
    public router: Router,
    private authService: AuthService,
    private settingService: SettingService,
    public storage: BrowserStorageService,
    public utils: UtilsService,
    private notificationService: NotificationService,
    private filestackService: FilestackService,
    public fastFeedbackService: FastFeedbackService
  ) {
    super(router);
  }

  onEnter() {
    // get contact number and email from local storage
    this.profile.email = this.storage.getUser().email;
    this.profile.contactNumber = this.storage.getUser().contactNumber;
    this.profile.image = this.storage.getUser().image ? this.storage.getUser().image : 'https://my.practera.com/img/user-512.png';
    this.profile.name = this.storage.getUser().name;
    this.acceptFileTypes = this.filestackService.getFileTypes('image');
    // also get program name
    this.currentProgramName = this.storage.getUser().programName;
    this.fastFeedbackService.pullFastFeedback().subscribe();
  }

  openLink() {
     window.open(this.termsUrl, '_system');
  }

  switchProgram() {
    this.router.navigate(['/switcher']);
  }

  // send email to Help request
  mailTo() {
    const mailto = 'mailto:' + this.helpline + '?subject=' + this.currentProgramName;
    window.open(mailto, '_self');
  }

  logout() {
    return this.authService.logout();
  }

  async uploadProfileImage(file, type = null) {
    if (file.success) {
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
