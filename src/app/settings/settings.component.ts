import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.component.html',
  styleUrls: ['settings.component.scss']
})
export class SettingsComponent {
  
  email = "test@test.com";
  contact_number= "+61 420000000";
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
    private authService: AuthService
  ){

  }
  openLink(link) {
    console.log('open the file');
  };

  switchProgram() {
    this.router.navigate(['/switcher']);
  };

  updateProfile(number) {

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
