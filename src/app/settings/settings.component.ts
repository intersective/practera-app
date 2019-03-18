import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { BrowserStorageService } from '@services/storage.service';
import { UtilsService } from '@services/utils.service';
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

  helpline = 'help@practera.com';

  termsUrl = 'https://images.practera.com/terms_and_conditions/practera_terms_conditions.pdf';

  constructor (
    public router: Router,
    private authService: AuthService,
    public storage: BrowserStorageService,
    public utils: UtilsService,
  ) {
    super(router);
  }

  onEnter() {
    // get contact number and email from local storage
    this.profile.email = this.storage.getUser().email;
    // also get program name
    this.currentProgramName = this.storage.getUser().programName;
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

}
