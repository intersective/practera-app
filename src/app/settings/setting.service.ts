import { Injectable } from '@angular/core';
import { SharedService, Profile } from '@services/shared.service';
import { map } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';

const api = {
  profileImageUpload: 'api/v2/user/account/edit',
};

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  constructor(
    private sharedService: SharedService,
    private request: RequestService,
  ) { }

  updateProfile(data: Profile) {
    return this.sharedService.updateProfile(data);
  }

  updateProfileImage(data) {
    return this.request.post(api.profileImageUpload, data)
      .pipe(map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          return [];
        }
      })
    );
  }

}
