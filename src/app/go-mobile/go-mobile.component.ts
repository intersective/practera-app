import { Component, OnInit } from '@angular/core';
import { GoMobileService } from './go-mobile.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UtilsService, ContactNumberFormat } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { BrowserStorageService } from '@services/storage.service';
import { environment } from '../../environments/environment.prod';

@Component({
  selector: 'go-mobile',
  templateUrl: './go-mobile.component.html',
  styleUrls: ['./go-mobile.component.scss']
})
export class GoMobileComponent implements OnInit {
  sendingSMS = false;
  saved = false;
  profile = {
    contactNumber: '',
    email: '',
    sendsms: true
  };
  invalidNumber = true;
  // default country model
  countryModel = 'AUS';
  // default mask
  mask: Array<string|RegExp>;

  constructor(
    private goMobileService: GoMobileService,
    private utils: UtilsService,
    private notification: NotificationService,
    public storage: BrowserStorageService,
    private contact: ContactNumberFormat,
  ) {}

  ngOnInit() {
    this.profile.contactNumber = this.storage.getUser().contactNumber;
    if (this.profile.contactNumber) {
      this.saved = true;
      this.invalidNumber = false;
    }
    // by default, set Mask in Australian format.
    /*
      user has no contact number, set the default mask
        : also check which the server which the APP talks to, i.e if the APP is consuming APIs from 'us.practera.com' then, it is APP V2 in US.
          But if APP consumes APIs from 'api.practera.com' then it is APP V2 in AUS.
    */
    if (environment.APIEndpoint.indexOf('us') !== -1) {
      this.countryModel = 'US';
    }

    this.mask = this.contact.masks[this.countryModel];
  }

  submit() {
    this.sendingSMS = true;
    this.profile.contactNumber = this.profile.contactNumber.replace(/[^0-9+]+/ig, '');
    // check if newly input number is valid or not.
    if (!this.validateContactNumber()) {
      return this.notification.presentToast('Invalid contact number', false);
    }

    this.goMobileService.submit({
      contact_number: this.profile.contactNumber,
      sendsms: true,
    }).subscribe(res => {
      this.saved = true;
      this.notification.alert({
        header: 'Going Mobile!',
        message: 'You should get an SMS shortly... if not, contact our help team',
        buttons: [{
          text: 'OK',
          handler: () => {
            return this.sendingSMS = false;
          },
        }],
      });
    });
  }

  validateContactNumber() {
    const contactNumber = this.profile.contactNumber.replace(/[^0-9+]+/ig, '');

    switch (this.countryModel) {
      case 'AUS':
        if (contactNumber.length === 12) {
          this.invalidNumber = false;
          return true;
        } else if (contactNumber.length === 3) {
          this.profile.contactNumber = null;
        }
        break;

      case 'US' :
        if (contactNumber.length === 12) {
          this.invalidNumber = false;
          return true;
        } else if (contactNumber.length === 2) {
          this.profile.contactNumber = null;
        }
        break;
    }
    this.invalidNumber = true;
    return false;
  }

  updateCountry() {
    const selectedCountry = this.countryModel;
    const country = this.utils.find(this.contact.countryCodes, function(c) {
      return c.code === selectedCountry;
    });
    // set currentContactNumber to it's format.
    this.profile.contactNumber = country.format;
    // update the mask as per the newly selected country
    this.mask = this.contact.masks[country.code];
  }

}
