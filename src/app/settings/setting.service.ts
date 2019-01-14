import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RequestService } from '@shared/request/request.service';

const api = {
  post: {
    profile: 'api/v2/user/enrolment/edit.json',
  }
};

export interface Profile {
	contactNumber : string,
	email : string
}

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  constructor(
  	private request : RequestService,
  ) { }

  updateProfile(profile : Profile) {
  	let postData;
  	postData = {
  		contact_number: profile.contactNumber
  	};

  	return this.request.post(api.post.profile, postData);
  }

}
