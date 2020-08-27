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

class PusherChannel {
  name: string;
  subscription?: Channel;
}

@Injectable({
  providedIn: 'root',
})

export class PusherService {
  private pusherKey: string;
  private apiurl: string;
  private pusher: Pusher;
  private channels: {
    notification: PusherChannel;
    chat: PusherChannel[];
  } = {
    notification: null,
    chat: []
  };

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
  isSubscribed(channelName): boolean {
    return !!this.pusher.allChannels().find((channel: Channel) => channel.name === channelName && channel.subscribed);
  }

  /**
   * get a list of channels from API request and subscribe every of them into
   * connected + authorised pusher
   */
  getChannels(): Observable<any> {
    return this.request.get(api.channels, {
      params: {
        env: environment.env,
        for: 'notification'
      }
    }).pipe(map(response => {
      if (response.data) {
        return this.subscribeChannel('notification', response.data[0].channel);
      }
    }));
  }

  /**
   * unsubscribe all channels
   * (use case: after switching program)
   */
  unsubscribeChannels(): void {
    if (!this.channels.notification) {
      return ;
    }
    this.channels.notification.subscription.unbind_all();
    // handle issue logout at first load of program-switching view
    if (this.pusher) {
      this.pusher.unbind_all();
      this.pusher.unsubscribe(this.channels.notification.name);
    }
    this.channels.chat.forEach(chat => {
      chat.subscription.unbind_all();
      if (this.pusher) {
        this.pusher.unsubscribe(chat.name);
      }
    });
    this.channels.notification = null;
    this.channels.chat = [];
  }

  /**
   * Subscribe a Pusher channel
   * @param type        The type of Pusher channel (notification/chat)
   * @param channelName The name of the Pusher channel
   */
  subscribeChannel(type: string, channelName: string) {
    if (!channelName) {
      return false;
    }
    if (this.isSubscribed(channelName)) {
      return;
    }
    switch (type) {
      case 'notification':
        this.channels.notification = {
          name: channelName,
          subscription: this.pusher.subscribe(channelName)
        };
        this.channels.notification.subscription
          .bind('notification', data => {
            this.utils.broadcastEvent('notification', data);
          })
          .bind('achievement', data => {
            this.utils.broadcastEvent('achievement', data);
          })
          .bind('event-reminder', data => {
            this.utils.broadcastEvent('event-reminder', data);
          })
          .bind('chat', data => {
            this.utils.broadcastEvent('chat:new-message', data);
          })
          .bind('pusher:subscription_succeeded', data => {
          })
          .bind('pusher:subscription_error', data => {
            // error handling
          });
        break;
      case 'chat':
        // don't need to subscribe again if already subscribed
        if (this.channels.chat.find(c => c.name === channelName)) {
          return;
        }
        const channel = {
          name: channelName,
          subscription: this.pusher.subscribe(channelName)
        };
        channel.subscription
          .bind('typing-event', data => {
            this.utils.broadcastEvent('typing-' + channelName, data);
          })
          .bind('pusher:subscription_succeeded', data => {
          })
          .bind('pusher:subscription_error', data => {
            // error handling
          });
        if (!this.channels.chat) {
          this.channels.chat = [];
        }
        this.channels.chat.push(channel);
        break;
    }
  }

  /**
   * When the current user start typing, send notification to the Pusher channel
   */
  triggerTyping(channelName): void {
    const channel = this.channels.chat.find(c => c.name === channelName);
    if (!channel) {
      return;
    }
    channel.subscription.trigger('typing-event', {
      user: this.storage.getUser().name
    });
  }

}
