import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { SettingService, Profile } from './setting.service';
import { BrowserStorageService } from '@services/storage.service';
import { UtilsService } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';


@Component({
  selector: 'app-settings',
  templateUrl: 'settings.component.html',
  styleUrls: ['settings.component.scss']
})
export class SettingsComponent implements OnInit {
   
  profile : Profile = {
    contactNumber: '',
    email: ''
  };
  currentProgramName = '';
  // default country model
  countryModel = "AUS";
  // default mask 
  mask = '';
  // variable to control the update button 
  updating = false;
  // supported countries
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

  formatMasks = {
      AUS: "+61 999 999 999",
      US: "+1 999 999 9999"      
   };

  helpline = 'help@practera.com';
  
  termsUrl = 'https://images.practera.com/terms_and_conditions/practera_terms_conditions.pdf';
  
  constructor (
    private router: Router,
    private authService: AuthService,
    private settingService : SettingService,
    private storage : BrowserStorageService,
    private utils: UtilsService,
    private notificationService: NotificationService
  ){

  }

  ngOnInit() {
    // get contact number and email from local storage
    this.profile.email = this.storage.getUser().email;
    this.profile.contactNumber = this.storage.getUser().contactNumber;
    // also get program name 
    this.currentProgramName = this.storage.getUser().programName;
    // if user has the contact number
    if (this.profile.contactNumber && this.profile.contactNumber != null) {
      this._checkCurrentContactNumberOrigin();
    }

  };

  private _checkCurrentContactNumberOrigin() {
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
    this.updating = true;
    this.notificationService.confirm({
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
               // update contact number in user storage data array.
               this.storage.setUser({
                 contactNumber: this.profile.contactNumber
               });                             
               return this.notificationService.popUp('shortMessage', { message: "Profile successfully updated!"}, false);         
             } else {
               return this.notificationService.popUp('shortMessage', { message: "Profile updating failed!"}, false);
             }
           });
          }
        }
      ]
    });
   
  };

  updateCountry() {
    var selectedCountry = this.countryModel;    
    var country = this.utils.find(this.countryCodes, function(country){
      return country.code === selectedCountry;
    })
    // set currentContactNumber to empty 
    this.profile.contactNumber = '';    
    // update the mask as per the newly selected country
    this.mask = this.formatMasks[country.code];    
  };


  openLink(link) {
     window.open(
      this.termsUrl,
      "_system"
    );
  };

  switchProgram() {
    this.router.navigate(['/switcher']);
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
