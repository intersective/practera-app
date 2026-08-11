import { Injectable } from '@angular/core';
import { firstValueFrom, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '@v3/environments/environment';
import { UtilsService } from '@v3/services/utils.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import Pusher from 'pusher-js';
type PusherInstance = InstanceType<typeof Pusher>;
type Options = ConstructorParameters<typeof Pusher>[1];
type Channel = ReturnType<PusherInstance['channel']>;
import { ApolloService } from './apollo.service';

const api = {
  pusherAuth: '/pusher_auth',
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
  sentAt: string;
}

export interface DeleteMessageParam {
  channelUuid: string;
  uuid: string;
}

type PusherChannelType = 'notification' | 'chat';
type PusherSubscription = Channel & { subscriptionPending?: boolean };

class PusherChannel {
  name: string;
  subscription?: PusherSubscription;
}

interface RealtimeScope {
  programId: number | null;
  projectId: number | null;
  timelineId: number | null;
}

const SUBSCRIPTION_RETRY_DELAY = 1000;

@Injectable({
  providedIn: 'root',
})
export class PusherService {
  private pusherKey: string;
  private apiurl: string;
  private pusher: PusherInstance;
  private activeScope: RealtimeScope | null = null;
  private initialisePromise: Promise<void> | null = null;
  private lifecycleGeneration = 0;
  private notificationGeneration = 0;
  private chatGeneration = 0;
  private retryAttempted: Record<PusherChannelType, boolean> = {
    notification: false,
    chat: false,
  };
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private retryScope: RealtimeScope | null = null;
  private pendingRetryTypes = new Set<PusherChannelType>();
  private channels: {
    notification: PusherChannel;
    chat: PusherChannel[];
  } = {
    notification: null,
    chat: []
  };

  constructor(
    private utils: UtilsService,
    public storage: BrowserStorageService,
    private apolloService: ApolloService,
  ) {
    this.pusherKey = environment.pusherKey;
    this.apiurl = environment.graphQL;
  }

  /**
   * Initialise the application-scoped Pusher client and reconcile channels for
   * the latest experience. Concurrent callers share the same in-flight work;
   * if storage changes while that work is running, the latest scope is loaded
   * before callers are released.
   */
  async initialise(options?: { unsubscribe?: boolean }): Promise<void> {
    if (environment.demo) {
      return;
    }

    const lifecycleGeneration = this.lifecycleGeneration;
    while (
      lifecycleGeneration === this.lifecycleGeneration
      && this.hasRealtimeScope(this.getCurrentScope())
    ) {
      if (!this.initialisePromise) {
        const requestedScope = this.getCurrentScope();
        const operation = this.performInitialise(requestedScope, options);
        this.initialisePromise = operation;

        try {
          await operation;
        } finally {
          if (this.initialisePromise === operation) {
            this.initialisePromise = null;
          }
        }
      } else {
        await this.initialisePromise;
      }

      // Logout/reset invalidates callers that were waiting for channel
      // discovery. A later authenticated caller will start a fresh lifecycle.
      if (lifecycleGeneration !== this.lifecycleGeneration) {
        return;
      }

      if (this.isCurrentScope(this.activeScope)) {
        return;
      }
    }
  }

  private async performInitialise(
    scope: RealtimeScope,
    options?: { unsubscribe?: boolean }
  ): Promise<void> {
    const scopeChanged = !this.areScopesEqual(scope, this.activeScope);

    if (scopeChanged) {
      this.invalidateChannelRefreshes();
      this.clearRetryState();
      this.disconnect();
      this.unsubscribeChannels();
      this.activeScope = scope;
    } else if (options?.unsubscribe) {
      this.disconnect();
      this.unsubscribeChannels();
    }

    if (!this.pusher) {
      this.pusher = this.initialisePusher();
    }

    if (!this.pusher) {
      return;
    }

    this.syncAuthHeaders();
    if (this.pusher.connection.state === 'disconnected') {
      this.pusher.connect();
    }

    await this.getChannels(scope);
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

  /**
   * Build-time template placeholders look like `<CUSTOM_FOO>`; if the deploy
   * pipeline didn't substitute a value, treat it as "not configured" rather
   * than trying to connect to the literal placeholder.
   */
  private normaliseTemplateValue(value: unknown): string {
    if (value === undefined || value === null) {
      return '';
    }
    const str = String(value).trim();
    if (!str) {
      return '';
    }
    if (str.startsWith('<') && str.endsWith('>')) {
      return '';
    }
    return str;
  }

  private resolveUseTLS(): boolean {
    const raw = this.normaliseTemplateValue((environment as any).pusherUseTLS);
    if (!raw) {
      return true;
    }
    return raw.toLowerCase() !== 'false';
  }

  private resolvePusherPort(_useTLS: boolean): number | undefined {
    const raw = this.normaliseTemplateValue((environment as any).pusherPort);
    if (!raw) {
      return undefined;
    }
    const parsed = parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return undefined;
    }
    return parsed;
  }

  private initialisePusher(): PusherInstance {
    const { apikey, timelineId } = this.storage.getUser();
    if (!apikey || !timelineId) {
      return undefined;
    }

    try {
      const useTLS = this.resolveUseTLS();
      // cluster is required by the pusher-js Options type but is conditionally set below;
      // using a type assertion here so we can assign it (or wsHost) in the branch below.
      const config = {
        forceTLS: useTLS,
        authEndpoint: this.apiurl + api.pusherAuth,
        auth: {
          headers: {
            'Authorization': 'pusherKey=' + this.pusherKey,
            'appkey': environment.appkey,
            'apikey': apikey,
            'timelineid': timelineId,
          },
        },
      } as Options;

      // If a custom host (e.g. self-hosted Soketi) is configured, use that;
      // otherwise fall back to Pusher Cloud's cluster-based routing.
      const host = this.normaliseTemplateValue((environment as any).pusherHost);
      if (host) {
        config.wsHost = host;
        const port = this.resolvePusherPort(useTLS);
        if (port) {
          config.wsPort = port;
          config.wssPort = port;
        }
        config.enabledTransports = ['ws', 'wss'];
        config.disabledTransports = ['xhr_streaming', 'xhr_polling', 'sockjs'];
        // pusher-js 8.x requires cluster to be set even when using a custom wsHost;
        // use a placeholder so the SDK constructor does not throw.
        config.cluster = 'local';
      } else if (environment.pusherCluster) {
        config.cluster = environment.pusherCluster;
      }
      const newPusherInstance = new Pusher(this.pusherKey, config);
      newPusherInstance.connection
        .bind('connecting', () => this.syncAuthHeaders())
        .bind('state_change', state => {
          // eslint-disable-next-line no-console
          console.log('pusher:state_change', state);
        })
        .bind('error', err => console.error('pusher:error', err));
      return newPusherInstance;
    } catch (err) {
      throw new Error('Unable to initialise Pusher', { cause: err });
    }
  }

  /**
   * check if every channel has been subscribed properly
   * true: subscribed
   * false: haven't subscribed
   */
  isSubscribed(channelName: string): boolean {
    return this.pusher?.allChannels().some(
      (channel: Channel) => channel.name === channelName && channel.subscribed
    ) || false;
  }

  /**
   * Refresh both experience-scoped channel types. Each request is independent:
   * a transient failure preserves the same scope's last valid listener set,
   * while a scope change has already removed every previous listener.
   */
  async getChannels(scope = this.getCurrentScope()): Promise<void> {
    await Promise.all([
      this.refreshNotificationChannel(scope),
      this.refreshChatChannel(scope),
    ]);
  }

  async refreshChatChannels(): Promise<void> {
    const scope = this.getCurrentScope();
    if (!this.pusher || !this.isCurrentScope(scope)) {
      await this.initialise();
      return;
    }
    await this.refreshChatChannel(scope);
  }

  getNotificationChannel(
    scope = this.getCurrentScope(),
    generation = ++this.notificationGeneration
  ): Observable<any> {
    const { apikey } = this.storage.getUser();
    if (!apikey) {
      return of(undefined);
    }
    return this.apolloService.graphQLFetch(
      `query notificationChannel($env: String!) {
        notificationChannel(env: $env)
      }`,
      { variables: { env: environment.env } }
    ).pipe(tap(response => {
      if (!this.isCurrentScope(scope) || generation !== this.notificationGeneration) {
        return;
      }

      const channelName = response?.data?.notificationChannel;
      if (channelName !== null && typeof channelName !== 'string') {
        throw new Error('Pusher notification channel format error');
      }

      this.reconcileNotificationChannel(channelName || null);
    }));
  }

  getChatChannels(
    scope = this.getCurrentScope(),
    generation = ++this.chatGeneration
  ): Observable<any> {
    return this.apolloService.graphQLFetch(
      `query getPusherChannels {
        channels {
          pusherChannel
        }
      }`
    ).pipe(tap(response => {
      if (!this.isCurrentScope(scope) || generation !== this.chatGeneration) {
        return;
      }

      if (!Array.isArray(response?.data?.channels)) {
        throw new Error('Pusher chat channel array format error');
      }

      const channelNames = response.data.channels
        .map(element => element?.pusherChannel)
        .filter(channelName => !!channelName);
      this.reconcileChatChannels(channelNames);
    }));
  }

  private async refreshNotificationChannel(scope: RealtimeScope): Promise<void> {
    const generation = ++this.notificationGeneration;
    try {
      await firstValueFrom(this.getNotificationChannel(scope, generation));
    } catch (err) {
      console.error('Failed to refresh Pusher notification channel', err);
    }
  }

  private async refreshChatChannel(scope: RealtimeScope): Promise<void> {
    const generation = ++this.chatGeneration;
    try {
      await firstValueFrom(this.getChatChannels(scope, generation));
    } catch (err) {
      console.error('Failed to refresh Pusher chat channels', err);
    }
  }

  /**
   * unsubscribe all channels
   * (use case: after switching program)
   */
  unsubscribeChannels(): void {
    this.unsubscribeNotificationChannel();
    [...this.channels.chat].forEach(chat => this.unsubscribeChatChannel(chat));
    this.channels.chat = [];
  }

  reset(): void {
    this.lifecycleGeneration++;
    this.invalidateChannelRefreshes();
    this.clearRetryState();
    this.disconnect();
    this.unsubscribeChannels();
    this.activeScope = null;
    this.clearAuthHeaders();
  }

  private unsubscribeNotificationChannel(): void {
    if (!this.channels.notification) {
      return;
    }

    this.channels.notification.subscription?.unbind_all();
    this.pusher?.unsubscribe(this.channels.notification.name);
    this.channels.notification = null;
  }

  private unsubscribeChatChannel(channel: PusherChannel): void {
    channel.subscription?.unbind_all();
    this.pusher?.unsubscribe(channel.name);
  }

  private getCurrentScope(): RealtimeScope {
    const { programId, projectId, timelineId } = this.storage.getUser();
    return {
      programId: programId ?? null,
      projectId: projectId ?? null,
      timelineId: timelineId ?? null,
    };
  }

  private hasRealtimeScope(scope: RealtimeScope): boolean {
    const { apikey } = this.storage.getUser();
    return !!apikey && !!scope.timelineId;
  }

  private isCurrentScope(scope: RealtimeScope | null): boolean {
    return !!scope && this.areScopesEqual(scope, this.getCurrentScope());
  }

  private areScopesEqual(left: RealtimeScope | null, right: RealtimeScope | null): boolean {
    return !!left && !!right
      && left.programId === right.programId
      && left.projectId === right.projectId
      && left.timelineId === right.timelineId;
  }

  private invalidateChannelRefreshes(): void {
    this.notificationGeneration++;
    this.chatGeneration++;
  }

  private syncAuthHeaders(): void {
    if (!this.pusher) {
      return;
    }
    const { apikey, timelineId } = this.storage.getUser();
    this.pusher.config.auth = this.pusher.config.auth || {};
    this.pusher.config.auth.headers = {
      ...(this.pusher.config.auth.headers || {}),
      'Authorization': 'pusherKey=' + this.pusherKey,
      'appkey': environment.appkey,
      'apikey': apikey,
      'timelineid': timelineId,
    };
  }

  private clearAuthHeaders(): void {
    if (!this.pusher?.config?.auth?.headers) {
      return;
    }
    this.pusher.config.auth.headers.apikey = '';
    this.pusher.config.auth.headers.timelineid = '';
  }

  private reconcileNotificationChannel(channelName: string | null): void {
    if (this.channels.notification?.name === channelName) {
      return;
    }

    // A changed exact set supersedes any retry for the previous channel.
    // A failure on the replacement channel starts its own bounded retry.
    this.resetRetry('notification');
    const reconnect = this.disconnectForPendingChannelRemoval(
      this.channels.notification ? [this.channels.notification] : []
    );
    this.unsubscribeNotificationChannel();
    if (channelName) {
      this.subscribeChannel('notification', channelName);
    }
    this.reconnectAfterPendingChannelRemoval(reconnect);
  }

  private reconcileChatChannels(channelNames: string[]): void {
    const desiredNames = [...new Set(channelNames)];
    const removedChannels = this.channels.chat
      .filter(channel => !desiredNames.includes(channel.name));
    const removesPendingChannel = removedChannels.some(
      channel => channel.subscription?.subscriptionPending
    );
    if (desiredNames.length === 0 || removesPendingChannel) {
      this.resetRetry('chat');
    }
    const reconnect = this.disconnectForPendingChannelRemoval(removedChannels);

    removedChannels.forEach(channel => this.unsubscribeChatChannel(channel));
    this.channels.chat = this.channels.chat.filter(channel => desiredNames.includes(channel.name));

    desiredNames.forEach(channelName => this.subscribeChannel('chat', channelName));
    this.reconnectAfterPendingChannelRemoval(reconnect);
  }

  /**
   * The Pusher v4.4 client leaves a channel pending after an authorization
   * error. Calling unsubscribe in that state only marks it cancelled and keeps
   * it in Pusher's registry, where a later reconnect can revive it. Disconnect
   * first so v4 resets the pending flag and unsubscribe removes it exactly.
   */
  private disconnectForPendingChannelRemoval(channels: PusherChannel[]): boolean {
    const hasPendingChannel = channels.some(
      channel => channel.subscription?.subscriptionPending
    );
    const shouldReconnect = !!this.pusher
      && this.pusher.connection.state !== 'disconnected'
      && hasPendingChannel;

    if (shouldReconnect) {
      this.disconnect();
    }
    return shouldReconnect;
  }

  private reconnectAfterPendingChannelRemoval(reconnect: boolean): void {
    if (!reconnect || !this.pusher || this.pusher.connection.state !== 'disconnected') {
      return;
    }
    this.syncAuthHeaders();
    this.pusher.connect();
  }

  /**
   * Subscribe a Pusher channel
   * @param type        The type of Pusher channel (notification/chat)
   * @param channelName The name of the Pusher channel
   */
  subscribeChannel(type: PusherChannelType, channelName: string): void | false {
    if (environment.demo || !this.pusher) {
      return;
    }
    if (!channelName) {
      return false;
    }

    if (type === 'notification' && this.channels.notification?.name === channelName) {
      return;
    }
    if (type === 'chat' && this.channels.chat.some(channel => channel.name === channelName)) {
      return;
    }

    const scope = this.activeScope ? { ...this.activeScope } : null;
    if (!scope || !this.isCurrentScope(scope)) {
      return;
    }

    this.syncAuthHeaders();
    const channel: PusherChannel = {
      name: channelName,
      subscription: this.pusher.subscribe(channelName),
    };

    channel.subscription
      .bind('pusher:subscription_succeeded', () => {
        if (!this.isCurrentScope(scope)) {
          return;
        }
        if (type === 'notification' || this.channels.chat.every(item => item.subscription?.subscribed)) {
          this.resetRetry(type);
        }
      })
      .bind('pusher:subscription_error', data => {
        this.handleSubscriptionError(type, channel, scope, data);
      });

    if (type === 'notification') {
      this.unsubscribeNotificationChannel();
      this.channels.notification = channel;
      channel.subscription
        .bind('notification', data => {
          if (this.isCurrentScope(scope)) {
            this.utils.broadcastEvent('notification', data);
          }
        })
        .bind('achievement', data => {
          if (this.isCurrentScope(scope)) {
            this.utils.broadcastEvent('achievement', data);
          }
        })
        .bind('event-reminder', data => {
          if (this.isCurrentScope(scope)) {
            this.utils.broadcastEvent('event-reminder', data);
          }
        });
      return;
    }

    channel.subscription
      .bind('client-chat-new-message', data => {
        if (this.isCurrentScope(scope)) {
          this.utils.broadcastEvent('chat:new-message', data);
        }
      })
      .bind('client-chat-delete-message', data => {
        if (this.isCurrentScope(scope)) {
          this.utils.broadcastEvent('chat:delete-message', data);
        }
      })
      .bind('client-chat-edit-message', data => {
        if (this.isCurrentScope(scope)) {
          this.utils.broadcastEvent('chat:edit-message', data);
        }
      })
      .bind('client-typing-event', data => {
        if (this.isCurrentScope(scope)) {
          this.utils.broadcastEvent('typing-' + channelName, data);
        }
      });
    this.channels.chat.push(channel);
  }

  private handleSubscriptionError(
    type: PusherChannelType,
    channel: PusherChannel,
    scope: RealtimeScope,
    error: any
  ): void {
    if (!this.isCurrentScope(scope)) {
      return;
    }
    console.error(`Failed to subscribe Pusher ${type} channel ${channel.name}`, error);
    this.scheduleSubscriptionRetry(type, scope);
  }

  private scheduleSubscriptionRetry(type: PusherChannelType, scope: RealtimeScope): void {
    if (this.retryAttempted[type]) {
      console.error(`Pusher ${type} channel retry already attempted`);
      return;
    }

    this.retryAttempted[type] = true;
    this.pendingRetryTypes.add(type);
    this.retryScope = { ...scope };

    // Notification and chat authorization commonly fail together. Batch them
    // into one socket reconnect while retaining independent retry limits.
    if (this.retryTimer) {
      return;
    }

    this.retryTimer = setTimeout(async () => {
      this.retryTimer = null;
      const retryScope = this.retryScope;
      const retryTypes = [...this.pendingRetryTypes];
      this.retryScope = null;
      this.pendingRetryTypes.clear();

      if (!retryScope || !this.isCurrentScope(retryScope)) {
        return;
      }
      this.syncAuthHeaders();
      this.disconnect();
      this.pusher?.connect();
      await Promise.all(retryTypes.map(retryType => {
        return retryType === 'notification'
          ? this.refreshNotificationChannel(retryScope)
          : this.refreshChatChannel(retryScope);
      }));
    }, SUBSCRIPTION_RETRY_DELAY);
  }

  private resetRetry(type: PusherChannelType): void {
    this.retryAttempted[type] = false;
    this.pendingRetryTypes.delete(type);
    if (this.pendingRetryTypes.size === 0) {
      this.clearRetryTimer();
      this.retryScope = null;
    }
  }

  private clearRetryTimer(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  private clearRetryState(): void {
    this.clearRetryTimer();
    this.retryScope = null;
    this.pendingRetryTypes.clear();
    this.retryAttempted.notification = false;
    this.retryAttempted.chat = false;
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
      user: this.storage.getUser().name,
      channel: channelName
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

  triggerDeleteMessage(channelName: string, data: DeleteMessageParam) {
    const channel = this.channels.chat.find(c => c.name === channelName);
    if (!channel) {
      return;
    }
    channel.subscription.trigger('client-chat-delete-message', data);
  }

  /**
   * trigger a client event to notify other members that a message was edited.
   */
  triggerEditMessage(channelName: string, data: SendMessageParam) {
    const channel = this.channels.chat.find(c => c.name === channelName);
    if (!channel) {
      return;
    }
    channel.subscription.trigger('client-chat-edit-message', data);
  }

}
