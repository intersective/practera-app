import { Injectable } from '@angular/core';
import { RequestService } from '@shared/request/request.service';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs';

const APIs = {
  preference: 'https://4d052q3ph6.execute-api.ap-southeast-2.amazonaws.com/notify',
};

@Injectable({
  providedIn: 'root'
})
export class PreferenceService {

  constructor(private request: RequestService) { }

  getPreference(): Observable<any> {
    return this.request.post(APIs.preference, {});
  }
}
