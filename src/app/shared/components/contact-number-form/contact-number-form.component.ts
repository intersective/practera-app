import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UtilsService } from '@services/utils.service';
import { NativeStorageService } from '@services/native-storage.service';
import { environment } from '@environments/environment';
import { SettingService } from '@app/settings/setting.service';
import { NotificationService } from '@shared/notification/notification.service';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contact-number-form',
  templateUrl: './contact-number-form.component.html',
  styleUrls: ['./contact-number-form.component.scss']
})
export class ContactNumberFormComponent implements OnInit, OnDestroy {

  @Input() page;
  @Output() updateNumber = new EventEmitter();
  data$: Subscription;
  getUser$: Subscription;

  // use to pass data to api
  profile = {
    contactNumber: '',
    email: ''
  };
  // use as a ngModel to controll contact number input
  contactNumber = '';
  // default country model
  countryModel: string;
  // country model infomation
  activeCountryModelInfo = {
    countryCode: '',
    placeholder: '',
    pattern: '',
    length: ''
  };
  // variable to control the update button
  updating = false;
  contactNumberFormat = {
    masks: {
      AUS: {
        format: '+61',
        placeholder: '000 000 000',
        pattern: '^[0-9]{3}[\s\-]?[\0-9]{3}[\s\-]?[0-9]{3}$',
        numberLength: '11'
      },
      US: {
        format: '+1',
        placeholder: '000 000 0000',
        pattern: '^[0-9]{3}[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$',
        numberLength: '12'
      },
      NZ: {
        format: '+64',
        placeholder: '0000000000',
        pattern: '^[0-9]{9-10}$',
        numberLength: '12'
      },
      DE: {
        format: '+49',
        placeholder: '000 000 000',
        pattern: '^[0-9]{3}[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$',
        numberLength: '12'
      },
      UK: {
        format: '+44',
        placeholder: '00 0000 0000',
        pattern: '^[0-9]{2}[\s\-]?[\0-9]{4}[\s\-]?[0-9]{4}$',
        numberLength: '12'
      }
    },
    countryCodes: [
      {
        name: 'Australia',
        code: 'AUS'
      },
      {
        name: 'US/Canada',
        code: 'US'
      },
      {
        name: 'New Zealand',
        code: 'NZ'
      },
      {
        name: 'Germany',
        code: 'DE'
      },
      {
        name: 'United Kingdom',
        code: 'UK'
      }
    ]
  };

  constructor(
    public utils: UtilsService,
    private nativeStorage: NativeStorageService,
    private settingService: SettingService,
    private notificationService: NotificationService,
    private routes: ActivatedRoute
  ) { }

  ngOnInit() {
    this.data$ = this.routes.data.subscribe(() => {
      this.getUser$ = fromPromise(this._initcomponent()).subscribe();
    });
  }

  ngOnDestroy() {
    this.getUser$.unsubscribe();
    this.data$.unsubscribe();
  }

  /**
   * component initialization
   * @return {Promise<void>}
   */
  private async _initcomponent(): Promise<void> {
    this.countryModel = environment.defaultCountryModel;
    this.activeCountryModelInfo.countryCode = this.contactNumberFormat.masks[this.countryModel].format;
    this.activeCountryModelInfo.placeholder = this.contactNumberFormat.masks[this.countryModel].placeholder;
    this.activeCountryModelInfo.pattern = this.contactNumberFormat.masks[this.countryModel].pattern;
    this.activeCountryModelInfo.length = this.contactNumberFormat.masks[this.countryModel].numberLength;

    // if user has the contact number
    const { contactNumber } = await this.nativeStorage.getObject('me');
    if (this.page === 'settings' && (contactNumber && contactNumber != null)) {
      this._checkCurrentContactNumberOrigin(contactNumber);
    } else {
      // without refresh page, we need to manually set to null (no pre-format needed)
      this.contactNumber = null;
    }
  }

  /**
   * reformat contact number format
   * @param {[type]} contactNumber [description]
   * @param {number} prefixCode    [description]
   */
  private reformatNumber(contactNumber, prefixCode: number) {
    let prefix = contactNumber.substring(0, prefixCode);
    let number = contactNumber.substring(prefixCode);
    return this._separeteContactNumber(number);
  }

  private _checkCurrentContactNumberOrigin(contactNumber) {
    const contactNum = contactNumber;
    let prefix = contactNum.substring(0, 3);
    this.contactNumber = this.reformatNumber(contactNum, 3);

    switch (prefix) {
      case '+61':
        this._setCountry('AUS');
        return;
      case '+64':
        this._setCountry('NZ');
        return;
      case '+49':
        this._setCountry('DE');
        return;
      case '+44':
        this._setCountry('UK');
        return;
    }

    prefix = contactNum.substring(0, 2);
    this.contactNumber = this.reformatNumber(contactNum, 2);
    switch (prefix) {
      case '61':
      case '04':
        this._setCountry('AUS');
        return;
      case '+1':
        this._setCountry('US');
        return;
    }

    prefix = contactNum.substring(0, 1);
    this.contactNumber = this.reformatNumber(contactNum, 1);
    if (prefix === '1') {
      this._setCountry('US');
      return;
    }

    if (prefix === '0') {
      this._setCountry('AUS');
      return;
    }
  }

  private _setCountry(country) {
    this.countryModel = country;
    this.activeCountryModelInfo.countryCode = this.contactNumberFormat.masks[this.countryModel].format;
    this.activeCountryModelInfo.placeholder = this.contactNumberFormat.masks[this.countryModel].placeholder;
    this.activeCountryModelInfo.pattern = this.contactNumberFormat.masks[this.countryModel].pattern;
    this.activeCountryModelInfo.length = this.contactNumberFormat.masks[this.countryModel].numberLength;
  }

  /**
   * Accept only certain keys
   * @description accepted keys limited to:
   *              - 'ArrowLeft', 'ArrowRight', 'Backspace', 'Delete'
   *              - numeric key input
   * @param  {KeyboardEvent} event code (function keypress) & key (for non-numeric input)
   * @return {boolean}             true: key accepted, false: key skipped
   */
  disableArrowKeys(event: KeyboardEvent): boolean {
    if (['ArrowLeft', 'ArrowRight', 'Backspace', 'Delete'].indexOf(event.code) !== -1) {
      return true;
    }

    // skip all non-numeric input
    if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].indexOf(event.key) === -1) {
      return false;
    }
    return true;
  }

  formatContactNumber() {
    this.contactNumber = this._separeteContactNumber(this.contactNumber);
    if (this.page === 'go-mobile') {
      this.updateNumber.emit(this.activeCountryModelInfo.countryCode + this.contactNumber);
    }
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

  updateCountry() {
    const selectedCountry = this.countryModel;
    const country = this.utils.find(this.contactNumberFormat.countryCodes, eachCountry => {
      return eachCountry.code === selectedCountry;
    });
    this.activeCountryModelInfo.countryCode = this.contactNumberFormat.masks[this.countryModel].format;
    this.activeCountryModelInfo.placeholder = this.contactNumberFormat.masks[this.countryModel].placeholder;
    this.activeCountryModelInfo.pattern = this.contactNumberFormat.masks[this.countryModel].pattern;
    this.activeCountryModelInfo.length = this.contactNumberFormat.masks[this.countryModel].numberLength;
    // set currentContactNumber to it's format.
    this.contactNumber = '';
    if (this.page === 'go-mobile') {
      this.updateNumber.emit(this.activeCountryModelInfo.countryCode + this.contactNumber);
    }
  }

  async updateContactNumber(): Promise<void> {
    this.profile.contactNumber = this.activeCountryModelInfo.countryCode + this.contactNumber;
    // strip out white spaces and underscores
    this.profile.contactNumber = this.profile.contactNumber.replace(/[^0-9+]+/ig, '');
    // check if newly input number is valid or not.
    if (!this.validateContactNumber(this.profile.contactNumber)) {
      return this.notificationService.presentToast('Invalid contact number');
    }
    this.updating = true;
    return this.notificationService.alert({
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
            }).subscribe(async result => {
              this.updating = false;
              if (result.success) {
                // update contact number in user local storage data array.
                await this.nativeStorage.setObject('me', {
                  contactNumber: this.profile.contactNumber
                });
                const newContactNumber = this.profile.contactNumber;
                // also update contact number in program object in local storage
                const { timelineId } = await this.nativeStorage.getObject('me');  // get current timeline Id
                const programs = await this.nativeStorage.getObject('programs');
                const programsObj = this.utils.each(Object.values(programs), function(program) {
                    if (program.timeline.id === timelineId) {
                      program.enrolment.contact_number = newContactNumber;
                    }
                });

                this.nativeStorage.setObject('programs', programsObj);
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
      case 'DE':
        if (contactNumber.length === 12) {
          return true;
        } else if (contactNumber.length === 3) {
          this.profile.contactNumber = null;
          return true;
        }
        break;

      case 'NZ':
        if (contactNumber.length === 12 || contactNumber.length === 13) {
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

      case 'UK' :
        if (contactNumber.length === 13) {
          return true;
        } else if (contactNumber.length === 3) {
          this.profile.contactNumber = null;
          return true;
        }
        break;
      }
    return false;
  }

}
