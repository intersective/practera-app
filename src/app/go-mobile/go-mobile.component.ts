import { Component, OnInit } from '@angular/core';
import { GoMobileService } from './go-mobile.service';
import { UtilsService } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { BrowserStorageService } from '@services/storage.service';
import { environment } from '../../environments/environment';
import { NewRelicService } from '@shared/new-relic/new-relic.service';

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

  constructor(
    private goMobileService: GoMobileService,
    private utils: UtilsService,
    private notification: NotificationService,
    public storage: BrowserStorageService,
    private newRelic: NewRelicService
  ) {}

  ngOnInit() {
    this.newRelic.setPageViewName('go-mobile');
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
  }

  submit(): Promise<void> {
    const nrSubmitContactTracer = this.newRelic.createTracer('submit contact');
    this.newRelic.addPageAction('submit contact info');
    this.sendingSMS = true;
    this.profile.contactNumber = this.profile.contactNumber.replace(/[^0-9+]+/ig, '');
    // check if newly input number is valid or not.
    if (!this.validateContactNumber()) {
      return this.notification.presentToast('Invalid contact number');
    }

    this.goMobileService.submit({
      contact_number: this.profile.contactNumber,
      sendsms: true,
    }).subscribe(
      res => {
        nrSubmitContactTracer();
        this.saved = true;
        const alertBox = this.notification.alert({
          header: 'Going Mobile!',
          message: 'You should get an SMS shortly... if not, contact our help team',
          buttons: [{
            text: 'OK',
            handler: () => {
              this.sendingSMS = false;
              return this.notification.dismiss();
            },
          }],
        });
        return alertBox;
      },
      err => {
        const toasted = this.notification.alert({
          header: 'Error submitting contact info',
          message: err.msg || JSON.stringify(err)
        });
        nrSubmitContactTracer();
        this.newRelic.noticeError('submitting contact error', JSON.stringify(err));
        return toasted;
      }
    );
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

  updateCountry(contactNumber: string) {
    this.profile.contactNumber = contactNumber;
  }

}
