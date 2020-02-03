import { Injectable, Optional, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse, HttpParameterCodec } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { environment } from '@environments/environment';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';
import { PusherStatic, Pusher, Config, Channel } from 'pusher-js';
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
    presence: {
      name: null,
      subscription: null,
    },
    team: {
      name: null,
      subscription: null,
    },
    teamNoMentor: {
      name: null,
      subscription: null,
    },
    notification: {
      name: null,
      subscription: null,
    }
  };
  private channels = {
    presence: null,
    team: null,
    teamNoMentor: null,
    notification: null
  };

  private typingAction = new Subject<any>();

  constructor(
    private http: HttpClient,
    @Optional() config: PusherConfig,
    private request: RequestService,
    private utils: UtilsService,
    public storage: BrowserStorageService,
    private ngZone: NgZone
  ) {
    if (config) {
      this.pusherKey = config.pusherKey;
      this.apiurl = config.apiurl;
    }
  }

  // initialise + subscribe to channels at one go
  async initialise(options?: {
    unsubscribe?: boolean;
  }) {
    // make sure pusher is connected
    if (!this.pusher) {
      this.pusher = await this.initialisePusher();
    }

    if (!this.pusher) {
      return {};
    }

    if (options && options.unsubscribe) {
      this.unsubscribeChannels();
      this.typingAction = new Subject<any>();
    }

    // handling condition at re-login without rebuilding pusher (where isInstantiated() is false)
    if (this.pusher.connection.state !== 'connected') {
      // reconnect pusher
      this.pusher.connect();
    }

    // subscribe to event only when pusher is available
    const channels = await this.getChannels().toPromise();
    return {
      pusher: this.pusher,
      channels
    };
  }

  disconnect(): void {
    if (this.pusher) {
      return this.pusher.disconnect();
    }
    return;
  }

  // check if pusher has been instantiated correctly
  isInstantiated(): boolean {
    if (this.utils.isEmpty(this.pusher)) {
      return false;
    }

    if (this.pusher.connection.state === 'disconnected') {
      return false;
    }

    return true;
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
      const newPusherInstance = await new PusherLib(this.pusherKey, config);
      return newPusherInstance;
    } catch (err) {
      throw new Error(err);
    }
  }

  /**
   * check if every channel has been subscribed properly
   * true: subscribed
   * false: haven't subscribed
   */
  isSubscribed(newChannelName): boolean {
    const channels = this.pusher.allChannels();
    let subscribedChannel = false;

    this.utils.each(channels, (channel: Channel) => {
      if (channel.name === newChannelName && channel.subscribed) {
        subscribedChannel = true;
      }
    });
    return subscribedChannel;
  }

  /**
   * get a list of channels from API request and subscribe every of them into
   * connected + authorised pusher
   */
  getChannels(): Observable<any> {
    return this.request.get(api.channels, {
      params: { env: environment.env }
    }).pipe(map(response => {
      if (response.data) {
        return this._subscribeChannels(response.data);
      }
    }));
  }

  /**
   * unsubscribe all channels
   * (use case: after switching program)
   */
  unsubscribeChannels(): void {
    this.utils.each(this.channelNames, (channel, key) => {
      if (channel) {
        this.channelNames[key] = { name: null, subscription: null };
        if (this.channels[key]) {
          // unbind all events from this channel
          this.channels[key].unbind_all();
          this.channels[key] = null;
        }

        // handle issue logout at first load of program-switching view
        if (this.pusher) {
          this.pusher.unbind_all();
          this.pusher.unsubscribe(channel.name);
        }
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
        if (this.isSubscribed(channel.channel)) {
          return;
        }

        this.channelNames.team.name = channel.channel;
        this.channels.team = this.pusher.subscribe(channel.channel);

        this.channels.team
          .bind('send-event', data => {
            this.utils.broadcastEvent('team-message', data);
          })
          .bind('typing-event', data => {
            this.utils.broadcastEvent('team-typing', data);
          })
          .bind('client-typing-event', data => {
            this.utils.broadcastEvent('team-typing', data);
          })
          .bind('pusher:subscription_succeeded', data => {
            this.channelNames.team.subscription = true;
          })
          .bind('pusher:subscription_error', () => {
            this.channelNames.team.subscription = `${channel.channel} channel subscription failed.`;
          });

        return;
      }

      // team without mentor
      if (channel.channel.includes('private-' + environment.env + '-team-nomentor-')) {
        if (this.isSubscribed(channel.channel)) {
          return;
        }

        this.channelNames.teamNoMentor.name = channel.channel;
        this.channels.teamNoMentor = this.pusher.subscribe(channel.channel);

        this.channels.teamNoMentor
          .bind('send-event', data => {
            this.utils.broadcastEvent('team-no-mentor-message', data);
          })
          .bind('typing-event', data => {
            this.utils.broadcastEvent('team-no-mentor-typing', data);
          })
          .bind('client-typing-event', data => {
            this.utils.broadcastEvent('team-no-mentor-typing', data);
          })
          .bind('pusher:subscription_succeeded', data => {
            this.channelNames.teamNoMentor.subscription = true;
          })
          .bind('pusher:subscription_error', data => {
            this.channelNames.teamNoMentor.subscription = `${channel.channel} channel subscription failed.`;
          });
        return;
      }

      // notification
      if (channel.channel.includes('private-' + environment.env + '-notification-')) {
        if (this.isSubscribed(channel.channel)) {
          return;
        }

        this.channelNames.notification.name = channel.channel;
        this.channels.notification = this.pusher.subscribe(channel.channel);

        this.channels.notification
          .bind('notification', data => {
            this.utils.broadcastEvent('notification', data);
          })
          .bind('achievement', data => {
            this.utils.broadcastEvent('achievement', data);
          })
          .bind('event-reminder', data => {
            this.utils.broadcastEvent('event-reminder', data);
          })
          .bind('pusher:subscription_succeeded', data => {
            this.channelNames.notification.subscription = true;
          })
          .bind('pusher:subscription_error', data => {
            this.channelNames.notification.subscription = `${channel.channel} channel subscription failed.`;
          });
        return;
      }

      // team member presence
      if (channel.channel.includes('presence-' + environment.env + '-team-')) {
        if (this.isSubscribed(channel.channel)) {
          return;
        }

        this.channelNames.presence.name = channel.channel;
        this.channels.presence = this.pusher.subscribe(channel.channel);

        this.channels.presence
          .bind('pusher:subscription_succeeded', data => {
            this.channelNames.presence.subscription = true;
          })
          .bind('pusher:subscription_error', data => {
            this.channelNames.presence.subscription = `${channel.channel} channel subscription failed.`;
          });
        return;
      }
    });

    // subscribe to typing event
    return this.initiateTypingEvent().subscribe(data => {
      return this.pusher.channels;
    });
  }

  getMyPresenceChannelId(): any {
    if (!this.utils.isEmpty(this.channels.presence) && this.utils.has(this.channels.presence, 'members')) {
      return this.channels.presence.members.me.id;
    }
    return;
  }

  /**
   * prepare subsequent "next" trigger for hot observable,
   * let rxjs handle the repeated trigger before API
   */
  triggerTyping(data, participantsOnly): void {
    if (participantsOnly) {
      return this.typingAction.next({
        data,
        channel: this.channels.teamNoMentor,
      });
    }

    return this.typingAction.next({
      data,
      channel: this.channels.team
    });
  }

  initiateTypingEvent(): Observable<any> {
    return this.typingAction.pipe(
      debounceTime(300),
      switchMap(event => {
        if (event.channel) {
          return of(event.channel.trigger('client-typing-event', event.data));
        }
        // error handling for unsubscribed pusher channel
        return of(true);
      })
    );
  }

}
