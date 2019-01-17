import { Injectable, Optional } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse, HttpParameterCodec } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { environment } from '@environments/environment';
// import { UtilsService } from '@services/utils.service';

declare const Pusher: any;
const api = {
  pusherAuth: '/api/v2/message/notify/pusher_auth.json',
  channels: '/api/v2/message/notify/channels.json'
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
  private channels = {
    presence: null,
    team: null,
    teamNoMentor: null,
    notification: null
  };

  constructor(
    private http: HttpClient,
    @Optional() config: PusherConfig,
    private request: RequestService,
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
    this.request.get(api.channels, {params: {
        env: environment.env
      }})
      .pipe(map(response => {
        if (response.data) {
          return this._normaliseChannels(response.data);
        }
      })
    );
  }

  private _normaliseChannels(data) {

  }

}
