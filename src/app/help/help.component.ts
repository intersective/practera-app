import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-help',
  templateUrl: 'help.component.html',
  styleUrls: ['help.component.scss']
})
export class HelpComponent {
  
  email = "test@test.com";
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
  
  termsUrl = 'https://images.practera.com/terms_and_conditions/practera_terms_conditions.pdf';
  
  constructor (
    private router: Router
  ){

  }
  openLink(link) {
    console.log('open the file');
  };
  switchProgram () {
    this.router.navigate (['/switcher']);
  };
  updateProfile (number) {};
  updateCountry (){};
}
