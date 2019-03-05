import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GoMobileComponent } from './go-mobile.component';
import { SharedService, Profile } from '@services/shared.service';

const api = {
  post: {
    profile: 'api/v2/user/enrolment/edit.json',
  }
};

@Injectable({
  providedIn: 'root'
})
export class GoMobileService {

  constructor(
    private modalController: ModalController,
    private sharedService : SharedService,
  ) { }

  submit(profile: Profile) {
    return this.sharedService.updateProfile(profile);
  }
}
