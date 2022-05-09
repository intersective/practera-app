import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UtilsService } from '@v3/services/utils.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { environment } from '@v3/environments/environment';
import { NotificationsService } from '@v3/services/notifications.service';
import { AuthService } from '@v3/app/services/auth.service';

@Component({
  selector: 'app-contact-number-form',
  templateUrl: './contact-number-form.component.html',
  styleUrls: ['./contact-number-form.component.scss']
})
export class ContactNumberFormComponent implements OnInit {

  @Input() page;
  @Output() updateNumber = new EventEmitter();

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
    public storage: BrowserStorageService,
    readonly utils: UtilsService,
    private readonly authService: AuthService,
    private notificationsService: NotificationsService
  ) { }

  ngOnInit() {
    this._initcomponent();
  }

  get isMobile(): boolean {
    return this.utils.isMobile();
  }

  private _initcomponent() {
    this.countryModel = environment.defaultCountryModel;
    this.activeCountryModelInfo.countryCode = this.contactNumberFormat.masks[this.countryModel].format;
    this.activeCountryModelInfo.placeholder = this.contactNumberFormat.masks[this.countryModel].placeholder;
    this.activeCountryModelInfo.pattern = this.contactNumberFormat.masks[this.countryModel].pattern;
    this.activeCountryModelInfo.length = this.contactNumberFormat.masks[this.countryModel].numberLength;
    // if user has the contact number
    if (this.page === 'settings' && (this.storage.getUser().contactNumber && this.storage.getUser().contactNumber != null)) {
      this._checkCurrentContactNumberOrigin();
    }
  }

  private _checkCurrentContactNumberOrigin() {
    const contactNum = this.storage.getUser().contactNumber;
    let prefix = contactNum.substring(0, 3);
    let number = contactNum.substring(3);
    this.contactNumber = this._separeteContactNumber(number);

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
    number = contactNum.substring(2);
    this.contactNumber = this._separeteContactNumber(number);
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
    number = contactNum.substring(1);
    this.contactNumber = this._separeteContactNumber(number);
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
    if (['ArrowLeft', 'ArrowRight', 'Backspace', 'Delete', 'Tab'].indexOf(event.code) !== -1) {
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

  updateContactNumber(): Promise<void> {
    this.profile.contactNumber = this.activeCountryModelInfo.countryCode + this.contactNumber;
    // strip out white spaces and underscores
    this.profile.contactNumber = this.profile.contactNumber.replace(/[^0-9+]+/ig, '');
    // check if newly input number is valid or not.
    if (!this.validateContactNumber(this.profile.contactNumber)) {
      return this.notificationsService.presentToast('Invalid contact number');
    }
    this.updating = true;
    return this.notificationsService.alert({
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
            this.authService.updateProfile({
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
                return this.notificationsService.popUp('shortMessage', { message: 'Profile successfully updated!'});

              } else {
                return this.notificationsService.popUp('shortMessage', { message: 'Profile updating failed!'});
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
