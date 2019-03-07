import { Injectable } from '@angular/core';
import { SharedService, Profile } from '@services/shared.service';

@Injectable({
  providedIn: 'root'
})
export class GoMobileService {

  constructor(
    private sharedService: SharedService,
  ) {}

  submit(profile: Profile) {
    return this.sharedService.updateProfile(profile);
  }
}
