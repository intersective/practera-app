import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RequestService } from '@shared/request/request.service';

@Injectable({
  providedIn: 'root'
})

export interface Profile {
	contactNumber : string,
	email : string
}

export class SettingService {

  constructor(
  	private request : RequestService,
  ) { }


  updateProfile(profile : Profile) {
  	console.log('call api to update profile here');
  }

}
