import { Injectable } from '@angular/core';
import { SharedService, Profile } from '@services/shared.service';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  constructor(
    private sharedService: SharedService,
  ) { }

  updateProfile(data: Profile) {
    return this.sharedService.updateProfile(data);
  }

}
