import { Injectable, Optional, isDevMode } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse, HttpParameterCodec } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
declare const Pusher: any;
// import { UtilsService } from '@services/utils.service';
// import { BrowserStorageService } from '@services/storage.service';

export class PusherConfig {
  apikey = '';
  apiurl = '';
}

@Injectable({
  providedIn: 'root',
})
export class PusherService {
  private apikey: string;
  private apiurl: string;
  private client;

  constructor(
    private http: HttpClient,
    @Optional() config: PusherConfig
  ) {
    if (config) {
      this.apikey = config.apikey;
      this.apiurl = config.apiurl;
    }
  }

  init() {
    try {
        this.client = new Pusher(this.apikey, {
            encrypted: true,
            authEndpoint: this.apiurl + '/chats/auth.json',
            auth: {
                headers: {
                    'Authorization': 'apikey=' + this.apikey,
                },
            },
        });
    } catch (err) {
        throw new Error(err);
    }
  }
}
