import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GoMobileComponent } from './go-mobile.component';
import { RequestService } from '@shared/request/request.service';

const api = {
  post: {
    profile: 'api/v2/user/enrolment/edit.json',
  }
};

export interface Profile {
	contactNumber : string,
  email : string,
  sendsms: boolean
}

@Injectable({
  providedIn: 'root'
})
export class GoMobileService {

  constructor(
    private modalController: ModalController,
  	private request : RequestService,
  ) { }

  submit(profile : Profile) {
  	let postData;
  	postData = {
  		contact_number: profile.contactNumber,
  		sendsms: profile.sendsms
  	};

  	return this.request.post(api.post.profile, postData);
  }

}
