import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { SettingService, Profile } from './setting.service';
import { BrowserStorageService } from '@services/storage.service';
import { UtilsService } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { environment } from '../../environments/environment.prod';
import { RouterEnter } from '@services/router-enter.service';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.component.html',
  styleUrls: ['settings.component.scss']
})
export class SettingsComponent extends RouterEnter {

  routeUrl: string = '/app/settings';
  profile : Profile = {
    contactNumber: '',
    email: ''
  };
  currentProgramName = '';
  // default country model
  countryModel = "AUS";
  // default mask
  mask: Array<string|RegExp>;
  // variable to control the update button
  updating = false;
  // supported countries
  countryCodes = [
    {
        name: "Australia",
        code: "AUS",
        format: '+61 ___ ___ ___'
    },
    {
        name: "US/Canada",
        code: "US",
        format: '+1 ___ ___ ____'
    },
  ];

  formatMasks = {
      AUS: ['+','6','1',' ', /[1-9]/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/],
      US: ['+','1', ' ',/[1-9]/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/]
   };

  helpline = 'help@practera.com';

  termsUrl = 'https://images.practera.com/terms_and_conditions/practera_terms_conditions.pdf';

  constructor (
    public router: Router,
    private authService: AuthService,
    private settingService : SettingService,
    public storage : BrowserStorageService,
    public utils: UtilsService,
    private notificationService: NotificationService,
  ){
    super(router);
  }

  onEnter() {
    // get contact number and email from local storage
    this.profile.email = this.storage.getUser().email;
    this.profile.contactNumber = this.storage.getUser().contactNumber;
    // also get program name
    this.currentProgramName = this.storage.getUser().programName;
    // if user has the contact number
    if (this.profile.contactNumber && this.profile.contactNumber != null) {
      this.checkCurrentContactNumberOrigin();
    } else {
      // by default, set Mask in Australian format.
      this.mask = this.formatMasks[this.countryModel];
      /*
          user has no contact number, set the default mask
            : also check which the server which the APP talks to, i.e if the APP is consuming APIs from 'us.practera.com' then, it is APP V2 in US.
              But if APP consumes APIs from 'api.practera.com' then it is APP V2 in AUS.
       */
      if (environment.APIEndpoint.indexOf('us') !== -1) {
        this.countryModel = 'US';
        this.mask = this.formatMasks[this.countryModel];
      }
    }
  };

  private checkCurrentContactNumberOrigin() {
    var contactNum = this.profile.contactNumber;
    var prefix = contactNum.substring(0, 3);

    if (prefix === '+61') {
        this.countryModel = 'AUS';
        this.mask = this.formatMasks['AUS'];
        return;
    }

    prefix = contactNum.substring(0, 2);
    if (prefix === '61') {
        this.countryModel = 'AUS';
        this.mask = this.formatMasks['AUS'];
        return;
    }

    if (prefix === '04') {
        this.countryModel = 'AUS';
        this.mask = this.formatMasks['AUS'];
        return;
     }

    if (prefix === '+1') {
        this.countryModel = 'US';
        this.mask = this.formatMasks['US'];
        return;
    }

    prefix = contactNum.substring(0, 1);
    if (prefix === '1') {
        this.countryModel = 'US';
        this.mask = this.formatMasks['US'];
        return;
    }

    if (prefix === '0') {
        this.countryModel = 'AUS';
        this.mask = this.formatMasks['AUS'];
        return;
    }
  }

  updateContactNumber() {
    // strip out white spaces and underscores
    this.profile.contactNumber = this.profile.contactNumber.replace(/[^0-9+]+/ig, "");
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
            this.settingService.updateProfile(this.profile).subscribe(result => {
              this.updating = false;
              if (result.success) {
                // update contact number in user local storage data array.
                this.storage.setUser({ contactNumber: this.profile.contactNumber });
                var newContactNumber = this.profile.contactNumber;
                // also update contact number in program object in local storage
                var timelineId = this.storage.getUser().timelineId;  // get current timeline Id
                var programsObj = this.utils.each(this.storage.get('programs'), function(program){
                    if (program.timeline.id === timelineId) {
                      program.enrolment.contact_number = newContactNumber;
                    }
                });
                this.storage.set('programs', programsObj);
                return this.notificationService.popUp('shortMessage', { message: "Profile successfully updated!"});

              } else {
                return this.notificationService.popUp('shortMessage', { message: "Profile updating failed!"});
              }
           });
          }
        }
      ]
    });

  };

  private validateContactNumber(contactNumber) {
    switch (this.countryModel) {
      case "AUS":
        if (contactNumber.length == 12) {
          return true;
        } else if(contactNumber.length == 3) {
          this.profile.contactNumber = null;
          return true;
        }
        break;

      case "US" :
        if (contactNumber.length == 12) {
          return true;
        } else if (contactNumber.length == 2) {
          this.profile.contactNumber = null;
          return true;
        }
        break;
    }
    return false;
  }

  updateCountry() {
    var selectedCountry = this.countryModel;
    var country = this.utils.find(this.countryCodes, function(country){
      return country.code === selectedCountry;
    });
    // set currentContactNumber to it's format.
    this.profile.contactNumber = country.format;
    // update the mask as per the newly selected country
    this.mask = this.formatMasks[country.code];
  };


  openLink() {
     window.open(this.termsUrl, "_system");
  };

  switchProgram() {
    this.router.navigate(['/switcher']);
  };

  // send email to Help request
  mailTo() {
    var mailto = 'mailto:' + this.helpline + '?subject=' + this.currentProgramName;
    window.open(mailto, '_self');
  }

  logout() {
    return this.authService.logout();
  }

}
