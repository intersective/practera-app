import { Injectable, Optional } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse, HttpParameterCodec } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { environment } from '@environments/environment';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';
import { PusherStatic, Pusher, Config } from 'pusher-js';
import * as PusherLib from 'pusher-js';

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
  private pusher: Pusher;
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

  // instantiate + subscribe to channels at one go
  async initantiate() {
    const pusher = await this.initialisePusher();
    if (!pusher) {
      return {};
    }

    // subscribe to event only when pusher is available
    const channels = await this.getChannels().toPromise();
    return {
      pusher,
      channels
    };
  }

  // check if pusher has been instanitated correctly
  isInitantiated() {
    console.log(this.pusher);
    return !this.utils.isEmpty(this.pusher);
  }

  private async initialisePusher(): Promise<Pusher> {
    // during the app execution lifecycle
    if (typeof this.pusher !== 'undefined') {
      return this.pusher;
    }

    // prevent pusher auth before user authenticated (skip silently)
    const { apikey, timelineId } = this.storage.getUser();
    if (!apikey || !timelineId) {
      return this.pusher;
    }

    // never reinstantiate another instance of Pusher
    if (!this.utils.isEmpty(this.pusher)) {
      return this.pusher;
    }

    try {
      const config: Config = {
        cluster: 'mt1',
        forceTLS: true,
        authEndpoint: this.apiurl + api.pusherAuth,
        auth: {
          headers: {
            'Authorization': 'pusherKey=' + this.pusherKey,
            'appkey': environment.appkey,
            'apikey': this.storage.getUser().apikey,
            'timelineid': this.storage.getUser().timelineId
          },
        },
      };

      this.pusher = await new PusherLib(this.pusherKey, config);
    } catch (err) {
      throw new Error(err);
    }

    return this.pusher;
  }

  getChannels() {
    // unsubscribe channels before subscribe the new ones
    this.unsubscribeChannels();

    // @CHAW we should cache this response locally for 15 minutes - the channel list is unlikely to
    // change in that time period. This will help with server load
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

  private _subscribeChannels(channels) {
    // channels format verification
    if (this.utils.isEmpty(channels)) {
      return this.request.apiResponseFormatError('Pusher channels cannot be empty');
    }

    if (!Array.isArray(channels)) {
      return this.request.apiResponseFormatError('Pusher channels must be an array');
    }

    const incorrectChannelName = channels.find(channel => !this.utils.has(channel, 'channel'));
    if (incorrectChannelName) {
      return this.request.apiResponseFormatError('Pusher channel format error');
    }

    channels.forEach(channel => {
      // subscribe channels and bind events
      // team
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

      // team without mentor
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

      // notification
      if (channel.channel.includes('private-' + environment.env + '-notification-')) {
        this.channelNames.notification = channel.channel;
        this.channels.notification = this.pusher.subscribe(channel.channel);
        this.channels.notification.bind('notification', data => {
          this.utils.broadcastEvent('notification', data);
        });
        this.channels.notification.bind('achievement', data => {
          this.utils.broadcastEvent('achievement', data);
        });
        this.channels.notification.bind('event-reminder', data => {
          this.utils.broadcastEvent('event-reminder', data);
        });
        return;
      }

      // team member presence
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
