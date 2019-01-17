import { Injectable, Optional } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse, HttpParameterCodec } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, filter } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { environment } from '@environments/environment';
import { UtilsService } from '@services/utils.service';

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
  private channelNames = {
    presence: null,
    team: null,
    teamNoMentor: null,
    notification: null
  };

  constructor(
    private http: HttpClient,
    @Optional() config: PusherConfig,
    private request: RequestService,
    private utils: UtilsService
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
          return this._subscribeChannels(response.data);
        }
      })
    );
  }

  private _subscribeChannels(data) {
    if (!Array.isArray(data) || this.utils.isEmpty(data)) {
      return this.request.apiResponseFormatError('Pusher channels format error');
    }
    data.forEach(channel => {
      if (!this.utils.has(channel, 'channel')) {
        return this.request.apiResponseFormatError('Pusher channel format error');
      }
      // subscribe channels and bind events
      if (channel.channel.includes('private-' + environment.env + '-team-')) {
        this.channelNames.team = channel.channel;
        this.pusher.subscribe(channel.channel).bind('send-event', this._sendEventForTeam);
        this.pusher.subscribe(channel.channel).bind('typing-event', this._typingEventForTeam);
        return;
      }
      if (channel.channel.includes('private-' + environment.env + '-team-nomentor-')) {
        this.channelNames.teamNoMentor = channel.channel;
        this.pusher.subscribe(channel.channel).bind('send-event', this._sendEventForTeamNoMentor);
        this.pusher.subscribe(channel.channel).bind('typing-event', this._typingEventForTeamNoMentor);
        return;
      }
      if (channel.channel.includes('private-' + environment.env + '-notification-')) {
        this.channelNames.notification = channel.channel;
        this.pusher.subscribe(channel.channel).bind('notification', this._notificationEvent);
        return;
      }
      if (channel.channel.includes('presence-' + environment.env + '-team-')) {
        this.channelNames.presence = channel.channel;
        return;
      }
    });
  }

  // broadcast events to the app
  private _sendEventForTeam(data) {
    this.utils.broadcastEvent('team-message', data);
  }
  private _typingEventForTeam(data) {
    this.utils.broadcastEvent('team-typing', data);
  }
  private _sendEventForTeamNoMentor(data) {
    this.utils.broadcastEvent('team-no-mentor-message', data);
  }
  private _typingEventForTeamNoMentor(data) {
    this.utils.broadcastEvent('team-no-mentor-typing', data);
  }
  private _notificationEvent(data) {
    this.utils.broadcastEvent('notification', data);
  }

}
