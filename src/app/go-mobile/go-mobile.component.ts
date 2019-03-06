import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GoMobileService } from './go-mobile.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UtilsService, ContactNumberFormat } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { BrowserStorageService } from "@services/storage.service";
import { environment } from '../../environments/environment.prod';

@Component({
  selector: 'app-switcher',
  templateUrl: './go-mobile.component.html',
  styleUrls: ['./go-mobile.component.scss']
})
export class GoMobileComponent implements OnInit {
  loading: boolean = false;
  saved: boolean = false;
  profile = {
    contactNumber: '',
    email: '',
    sendsms: true
  };
  invalidNumber: boolean = true;
  // default country model
  countryModel = "AUS";
  // default mask
  mask: Array<string|RegExp>;
  // variable to control the update button
  updating = false;
  countryCodes;
  formatMasks;

  constructor(
    public modalController: ModalController,
    private GoMobileService: GoMobileService,
    private utils: UtilsService,
    private notification: NotificationService,
    public storage: BrowserStorageService,
    private contact: ContactNumberFormat,
  ) {
    this.countryCodes = contact.countryCodes;
    this.formatMasks = contact.masks;
  }

  ngOnInit() {
    this.profile.email = this.storage.getUser().email;
    this.profile.contactNumber = this.storage.getUser().contactNumber;
    if (this.profile.contactNumber) {
      this.saved = true;
      this.invalidNumber = false;
    }
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

  dismiss() {
    // change the flag to false
    this.storage.set('goMobileOpening', false);
    this.modalController.dismiss();
  }

  submit() {
    this.loading = true;
    this.profile.contactNumber = this.profile.contactNumber.replace(/[^0-9+]+/ig, "");
    // check if newly input number is valid or not.
    if (!this.validateContactNumber()) {
      return this.notification.presentToast('Invalid contact number', false);
    }

    this.GoMobileService.submit({
      contact_number: this.profile.contactNumber,
      email: this.profile.email,
      sendsms: true,
    }).subscribe(res => {
      this.saved = true;
      this.notification.alert({
        header: 'Going Mobile!',
        message: 'You should get an SMS shortly... if not, contact our help team',
        buttons: [{
          text: 'OK',
          handler: () => {
            this.loading = false;
            return this.dismiss();
          },
        }],
      });
    });
  }

  validateContactNumber() {
    var contactNumber = this.profile.contactNumber.replace(/[^0-9+]+/ig, "");

    switch (this.countryModel) {
      case "AUS":
        if (contactNumber.length == 12) {
          this.invalidNumber = false;
          return true;
        } else if(contactNumber.length == 3) {
          this.profile.contactNumber = null;
        }
        break;

      case "US" :
        if (contactNumber.length == 12) {
          this.invalidNumber = false;
          return true;
        } else if (contactNumber.length == 2) {
          this.profile.contactNumber = null;
        }
        break;
    }
    this.invalidNumber = true;
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

}
