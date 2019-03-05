import { Injectable } from '@angular/core';
import { SharedService, Profile } from '@services/shared.service';
import { Observable, of } from 'rxjs';

const api = {
  post: {
    profile: 'api/v2/user/enrolment/edit.json',
  }
};

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  constructor(
    private sharedService : SharedService,
  ) { }

  updateProfile(data: Profile) {
    return this.sharedService.updateProfile(data);
  }

}
