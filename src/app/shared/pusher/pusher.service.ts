import { Injectable, Optional, isDevMode } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse, HttpParameterCodec } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
declare const Pusher: any;
// import { UtilsService } from '@services/utils.service';
// import { BrowserStorageService } from '@services/storage.service';

const api = {
  pusherAuth: '/api/v2/message/notify/pusher_auth.json'
};

export class PusherConfig {
  pusherKey = '';
  apiurl = '';
}

@Injectable({
  providedIn: 'root',
})

export class PusherService {
  private pusherKey: string;
  private apiurl: string;
  private pusher;

  constructor(
    private http: HttpClient,
    @Optional() config: PusherConfig
  ) {
    if (config) {
      this.pusherKey = config.pusherKey;
      this.apiurl = config.apiurl;
    }
    try {
      this.pusher = new Pusher(this.pusherKey, {
        cluster: 'mt1',
        encrypted: true,
        authEndpoint: this.apiurl + api.pusherAuth,
        auth: {
          headers: {
            'Authorization': 'pusherKey=' + this.pusherKey,
          },
        },
      });
    } catch (err) {
      throw new Error(err);
    }
  }

  getChannels() {

  }

}
