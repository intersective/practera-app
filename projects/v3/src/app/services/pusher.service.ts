import { Injectable, Optional, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { RequestService } from 'request';
import { environment } from '@v3/environments/environment';
import { UtilsService } from '@v3/services/utils.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { Pusher, Config, Channel } from 'pusher-js';
import * as PusherLib from 'pusher-js';
import { ApolloService } from './apollo.service';

const api = {
  pusherAuth: 'api/v2/message/notify/pusher_auth.json',
  channels: 'api/v2/message/notify/channels.json'
};

export interface SendMessageParam {
  channelUuid:  string;
  uuid: string;
  message: string;
  file: string;
  isSender: boolean;
  created: string;
  senderUuid: string;
  senderName: string;
  senderRole: string;
  senderAvatar: string;
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
    private request: RequestService,
    private utils: UtilsService,
    public storage: BrowserStorageService,
    private ngZone: NgZone,
    private apolloService: ApolloService,
  ) {
    this.pusherKey = environment.pusherKey;
    this.apiurl = environment.APIEndpoint;
  }

  // initialise + subscribe to channels at one go
  async initialise(options?: {
    unsubscribe?: boolean;
  }) {
    if (environment.demo) {
      return ;
    }

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
    const channels = this.getChannels();
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
  async getChannels() {
    await this.getNotificationChannel().toPromise();
    await this.getChatChannels().toPromise();
  }

  getNotificationChannel(): Observable<any> {
    // if apikey not exist, we don't need to call API to get channel
    const { apikey } = this.storage.getUser();
    if (!apikey) {
      return of();
    }
    return this.request.get(api.channels, {
      params: {
        env: environment.env,
        for: 'notification'
      }
    }).pipe(map(response => {
      if (response.data) {
        this.subscribeChannel('notification', response.data[0].channel);
      }
    }));
  }

  getChatChannels(): Observable<any> {
    return this.apolloService.chatGraphQLQuery(
      `query getPusherChannels {
        channels {
          pusherChannel
        }
      }`,
      {},
      {
        noCache: true
      }
    ).pipe(tap(response => {
      if (response.data && response.data.channels) {
        const result = JSON.parse(JSON.stringify(response.data.channels));
        result.forEach(element => {
          this.subscribeChannel('chat', element.pusherChannel);
        });
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

    if (environment.demo) {
      return;
    }

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
          // .bind('pusher:subscription_succeeded', data => {})
          .bind('pusher:subscription_error', data => {
            console.error(`fail to subscribe ${channelName}::`, data);
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
          .bind('client-chat-new-message', data => {
            this.utils.broadcastEvent('chat:new-message', data);
          })
          .bind('client-typing-event', data => {
            this.utils.broadcastEvent('typing-' + channelName, data);
          })
          // .bind('pusher:subscription_succeeded', data => {})
          .bind('pusher:subscription_error', data => {
            // error handling
            console.error(`fail to subscribe ${channelName}::`, data);
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
   * from pusher doc
   * - A client event must have a name prefixed with 'client'- or it will be rejected by the server.
   * - Client events can only be triggered on 'private' and 'presence' channels because they require authentication
   * - private channel name start with 'private-' and presence channel name start with 'presence-'
   */
  triggerTyping(channelName): void {
    const channel = this.channels.chat.find(c => c.name === channelName);
    if (!channel) {
      return;
    }
    channel.subscription.trigger('client-typing-event', {
      user: this.storage.getUser().name
    });
  }

  /**
   * This method triggering 'client-chat-new-message' event of a pusher channel to send message to other members
   * that subscribe to the pusher channel.
   * when user send message it will save in api first and then call this.
   * @param data send message object
   */
  triggerSendMessage(channelName: string, data: SendMessageParam) {
    const channel = this.channels.chat.find(c => c.name === channelName);
    if (!channel) {
      return;
    }
    channel.subscription.trigger('client-chat-new-message', data);
  }

}
