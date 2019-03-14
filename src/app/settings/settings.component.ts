import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { SettingService } from './setting.service';
import { BrowserStorageService } from '@services/storage.service';
import { UtilsService, ContactNumberFormat } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { environment } from '../../environments/environment.prod';
import { RouterEnter } from '@services/router-enter.service';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.component.html',
  styleUrls: ['settings.component.scss']
})

export class SettingsComponent extends RouterEnter {

  routeUrl = '/app/settings';
  profile = {
    contactNumber: '',
    email: ''
  };
  currentProgramName = '';
  contactNumber = '';
  // default country model
  countryModel = 'AUS';
  selectedCountryCode = '';
  activeContactPlaceholder = '';
  activeContactPattern = '';
  // variable to control the update button
  updating = false;

  helpline = 'help@practera.com';

  termsUrl = 'https://images.practera.com/terms_and_conditions/practera_terms_conditions.pdf';

  constructor (
    public router: Router,
    private authService: AuthService,
    private settingService: SettingService,
    public storage: BrowserStorageService,
    public utils: UtilsService,
    private notificationService: NotificationService,
    public contact: ContactNumberFormat,
  ) {
    super(router);
  }

  onEnter() {
    // get contact number and email from local storage
    this.profile.email = this.storage.getUser().email;
    // also get program name
    this.currentProgramName = this.storage.getUser().programName;
    // if user has the contact number
    if (this.storage.getUser().contactNumber && this.storage.getUser().contactNumber != null) {
      this.checkCurrentContactNumberOrigin();
    } else if (environment.APIEndpoint.indexOf('us') !== -1) {
      // check which the server which the APP talks to, i.e if the APP is consuming APIs from 'us.practera.com' then, it is APP V2 in US.
      // But if APP consumes APIs from 'api.practera.com' then it is APP V2 in AUS.
      this.countryModel = 'US';
      this.selectedCountryCode = this.contact.masks[this.countryModel].format;
      this.activeContactPlaceholder = this.contact.masks[this.countryModel].placeholder;
      this.activeContactPattern = this.contact.masks[this.countryModel].pattern;
    } else {
      this.selectedCountryCode = this.contact.masks[this.countryModel].format;
      this.activeContactPlaceholder = this.contact.masks[this.countryModel].placeholder;
      this.activeContactPattern = this.contact.masks[this.countryModel].pattern;
    }
  }

  private checkCurrentContactNumberOrigin() {
    const contactNum = this.storage.getUser().contactNumber;
    let prefix = contactNum.substring(0, 3);
    let number = contactNum.substring(3);
    this.contactNumber = this._separeteContactNumber(number);

    if (prefix === '+61') {
        this.countryModel = 'AUS';
        this.selectedCountryCode = this.contact.masks[this.countryModel].format;
        this.activeContactPlaceholder = this.contact.masks[this.countryModel].placeholder;
        this.activeContactPattern = this.contact.masks[this.countryModel].pattern;
        return;
    }

    prefix = contactNum.substring(0, 2);
    number = contactNum.substring(2);
    this.contactNumber = this._separeteContactNumber(number);
    if (prefix === '61') {
        this.countryModel = 'AUS';
        this.selectedCountryCode = this.contact.masks[this.countryModel].format;
        this.activeContactPlaceholder = this.contact.masks[this.countryModel].placeholder;
        this.activeContactPattern = this.contact.masks[this.countryModel].pattern;
        return;
    }

    if (prefix === '04') {
        this.countryModel = 'AUS';
        this.selectedCountryCode = this.contact.masks[this.countryModel].format;
        this.activeContactPlaceholder = this.contact.masks[this.countryModel].placeholder;
        this.activeContactPattern = this.contact.masks[this.countryModel].pattern;
        return;
     }

    if (prefix === '+1') {
        this.countryModel = 'US';
        this.selectedCountryCode = this.contact.masks[this.countryModel].format;
        this.activeContactPlaceholder = this.contact.masks[this.countryModel].placeholder;
        this.activeContactPattern = this.contact.masks[this.countryModel].pattern;
        return;
    }

    prefix = contactNum.substring(0, 1);
    number = contactNum.substring(1);
    this.contactNumber = this._separeteContactNumber(number);
    if (prefix === '1') {
        this.countryModel = 'US';
        this.selectedCountryCode = this.contact.masks[this.countryModel].format;
        this.activeContactPlaceholder = this.contact.masks[this.countryModel].placeholder;
        this.activeContactPattern = this.contact.masks[this.countryModel].pattern;
        return;
    }

    if (prefix === '0') {
        this.countryModel = 'AUS';
        this.selectedCountryCode = this.contact.masks[this.countryModel].format;
        this.activeContactPlaceholder = this.contact.masks[this.countryModel].placeholder;
        this.activeContactPattern = this.contact.masks[this.countryModel].pattern;
        return;
    }
  }

  updateContactNumber() {
    this.profile.contactNumber = this.selectedCountryCode + this.contactNumber;
    // strip out white spaces and underscores
    this.profile.contactNumber = this.profile.contactNumber.replace(/[^0-9+]+/ig, '');
    // check if newly input number is valid or not.
    if (!this.validateContactNumber(this.profile.contactNumber)) {
      return this.notificationService.presentToast('Invalid contact number', false);
    }
    this.updating = true;
    this.notificationService.alert({
      header: 'Update Profile',
      message: 'Are you sure to update your profile?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.updating = false;
            return;
          }
        },
        {
          text: 'Okay',
          handler: () => {
            this.settingService.updateProfile({
              contact_number: this.profile.contactNumber,
            }).subscribe(result => {
              this.updating = false;
              if (result.success) {
                // update contact number in user local storage data array.
                this.storage.setUser({ contactNumber: this.profile.contactNumber });
                const newContactNumber = this.profile.contactNumber;
                // also update contact number in program object in local storage
                const timelineId = this.storage.getUser().timelineId;  // get current timeline Id
                const programsObj = this.utils.each(this.storage.get('programs'), function(program) {
                    if (program.timeline.id === timelineId) {
                      program.enrolment.contact_number = newContactNumber;
                    }
                });
                this.storage.set('programs', programsObj);
                return this.notificationService.popUp('shortMessage', { message: 'Profile successfully updated!'});

              } else {
                return this.notificationService.popUp('shortMessage', { message: 'Profile updating failed!'});
              }
           });
          }
        }
      ]
    });

  }

  private validateContactNumber(contactNumber) {
    switch (this.countryModel) {
      case 'AUS':
        if (contactNumber.length === 12) {
          return true;
        } else if (contactNumber.length === 3) {
          this.profile.contactNumber = null;
          return true;
        }
        break;

      case 'US' :
        if (contactNumber.length === 12) {
          return true;
        } else if (contactNumber.length === 2) {
          this.profile.contactNumber = null;
          return true;
        }
        break;
    }
    return false;
  }

  updateCountry() {
    const selectedCountry = this.countryModel;
    const country = this.utils.find(this.contact.countryCodes, eachCountry => {
      return eachCountry.code === selectedCountry;
    });
    this.selectedCountryCode = this.contact.masks[country.code].format;
    this.activeContactPlaceholder = this.contact.masks[country.code].placeholder;
    this.activeContactPattern = this.contact.masks[country.code].pattern;
    // set currentContactNumber to it's format.
    this.contactNumber = '';
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

  disableArrowKeys(event) {
    event = (event) ? event : window.event;

    // charCode is the code of each Key
    const charCode = (event.which) ? event.which : event.keyCode;

    // just allow number keys to enter
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
  }

  formatContactNumber() {
    this.contactNumber = this._separeteContactNumber(this.contactNumber);
  }

  private _separeteContactNumber(text) {
    const result = [];
    text = text.replace(/[^\d]/g, '');
    while (text.length >= 3) {
        result.push(text.substring(0, 3));
        text = text.substring(3);
    }
    if (text.length > 0) {
      result.push(text);
    }
    return result.join(' ');
  }

}
