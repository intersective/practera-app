import { Injectable } from '@angular/core';
import { SharedService } from '@services/shared.service';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  constructor(
    private sharedService : SharedService,
  ) { }

  updateProfile(data) {
    return this.sharedService.updateProfile({
      contact_number: data.contactNumber,
    });
  }

}
