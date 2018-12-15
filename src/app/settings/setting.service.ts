import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RequestService } from '@shared/request/request.service';


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
  	console.log('call api to update profile here');
  }

}
