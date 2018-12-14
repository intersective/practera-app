import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { SettingService, Profile } from './setting.service';
import { BrowserStorageService } from '@services/storage.service';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.component.html',
  styleUrls: ['settings.component.scss']
})
export class SettingsComponent implements OnInit {
   
  profile : Profile = {
    contactNumber ; '',
    email ; ''
  };

  // email = "test@xtest.com";
  // contact_number= "+61 420000000";
  countryModel = "AUS";
  countryCodes = [
    {
        name: "Australia",
        code: "AUS",
        prefix: "+61",
        mask: "+61 999 999 999",
    },
    {
        name: "US/Canada",
        code: "US",
        prefix: "+1",
        mask: "+1 999 999 9999",
    },
  ];
  helpline = 'help@practera.com';
  
  termsUrl = 'https://images.practera.com/terms_and_conditions/practera_terms_conditions.pdf';
  
  constructor (
    private router: Router,
    private authService: AuthService,
    private settingService : SettingService,
    private storage : BrowserStorageService
  ){

  }

  ngOnInit() {
    //@TODO get email and contact number from user storage here
  };

  openLink(link) {
    console.log('open the file');
  };

  switchProgram() {
    this.router.navigate(['/switcher']);
  };

  updateContactNumber() {
    this.settingService.updateProfile(this.profile);
  };

  updateCountry() {

  };

  // send email to Help request
  mailTo() {
    console.log("Send Email to:", this.helpline);
    //mailto:{{helpline}}?subject={{email.supportTitle}}
  }

  logout() {
    return this.authService.logout().subscribe(() => {
      return this.router.navigate(['/login']);
    });
  }
}
