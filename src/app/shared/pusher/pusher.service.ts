import { Injectable, Optional } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse, HttpParameterCodec } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, filter } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { environment } from '@environments/environment';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';

declare const Pusher: any;
const api = {
  pusherAuth: 'api/v2/message/notify/pusher_auth.json',
  channels: 'api/v2/message/notify/channels.json'
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
    private utils: UtilsService,
    public storage: BrowserStorageService
  ) {
    if (config) {
      this.pusherKey = config.pusherKey;
      this.apiurl = config.apiurl;
    }
  }

  initialisePusher() {
    try {
      this.pusher = new Pusher(this.pusherKey, {
        cluster: 'mt1',
        encrypted: true,
        authEndpoint: this.apiurl + api.pusherAuth,
        auth: {
          headers: {
            'Authorization': 'pusherKey=' + this.pusherKey,
            'appkey': environment.appkey,
            'apikey': this.storage.get('apikey'),
            'timelineid': this.storage.getUser().timelineId
          },
        },
      });
    } catch (err) {
      throw new Error(err);
    }
  }

  getChannels() {
    // unsubscribe channels before subscribe the new ones
    this.unsubscribeChannels();
    return this.request.get(api.channels, {params: {
        env: environment.env
      }})
      .pipe(map(response => {
        if (response.data) {
          return this._subscribeChannels(response.data);
        }
      })
    );
  }

  // unsubscribe all channels
  unsubscribeChannels() {
    this.utils.each(this.channelNames, (channel, key) => {
      if (channel) {
        this.channelNames[key] = null;
        if (this.channels[key]) {
          // unbind all events from this channel
          this.channels[key].unbind();
          this.channels[key] = null;
        }
        this.pusher.unsubscribe(channel);
      }
    });
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
      if (channel.channel.includes('private-' + environment.env + '-team-') &&
          !channel.channel.includes('nomentor')) {
        this.channelNames.team = channel.channel;
        this.channels.team = this.pusher.subscribe(channel.channel);
        this.channels.team.bind('send-event', data => {
          this.utils.broadcastEvent('team-message', data);
        });
        this.channels.team.bind('typing-event', data => {
          this.utils.broadcastEvent('team-typing', data);
        });
        this.channels.team.bind('client-typing-event', data => {
          this.utils.broadcastEvent('team-typing', data);
        });
        return;
      }
      if (channel.channel.includes('private-' + environment.env + '-team-nomentor-')) {
        this.channelNames.teamNoMentor = channel.channel;
        this.channels.teamNoMentor = this.pusher.subscribe(channel.channel);
        this.channels.teamNoMentor.bind('send-event', data => {
          this.utils.broadcastEvent('team-no-mentor-message', data);
        });
        this.channels.teamNoMentor.bind('typing-event', data => {
          this.utils.broadcastEvent('team-no-mentor-typing', data);
        });
        this.channels.teamNoMentor.bind('client-typing-event', data => {
          this.utils.broadcastEvent('team-no-mentor-typing', data);
        });
        return;
      }
      if (channel.channel.includes('private-' + environment.env + '-notification-')) {
        this.channelNames.notification = channel.channel;
        this.pusher.subscribe(channel.channel).bind('notification', data => {
          this.utils.broadcastEvent('notification', data);
        });
        return;
      }
      if (channel.channel.includes('presence-' + environment.env + '-team-')) {
        this.channelNames.presence = channel.channel;
        this.channels.presence = this.pusher.subscribe(channel.channel);
        return;
      }
    });
  }

  getMyPresenceChannelId() {
    if (!this.utils.isEmpty(this.channels.presence) && this.utils.has(this.channels.presence, 'members')) {
      return this.channels.presence.members.me.id;
    }
  }

  triggerTypingEvent(data, participantsOnly) {
    if (participantsOnly) {
      this.channels.teamNoMentor.trigger('client-typing-event', data);
    } else {
      this.channels.team.trigger('client-typing-event', data);
    }
  }

}
