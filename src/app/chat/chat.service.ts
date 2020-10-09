import { Injectable } from '@angular/core';
import { RequestService } from '@shared/request/request.service';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { UtilsService } from '@services/utils.service';
import { PusherService } from '@shared/pusher/pusher.service';
import { environment } from '@environments/environment';

/**
 * @name api
 * @description list of api endpoint involved in this service
 * @type {Object}
 */
const api = {
  getChatList: 'api/v2/message/chat/list.json',
  getChatMessages: 'api/v2/message/chat/list_messages.json',
  createMessage: 'api/v2/message/chat/create_message',
  markAsSeen: 'api/v2/message/chat/edit_message'
};

export interface ChatChannel {
  channelId: number | string;
  channelName: string;
  channelAvatar: string;
  isAnnouncement: boolean;
  isDirectMessage: boolean;
  pusherChannelName: string;
  readonly: boolean;
  roles: string[];
  unreadMessages: number;
  lastMessage: string;
  lastMessageCreated: string;
}

export interface ChannelMembers {
  uuid: number | string;
  name: string;
  role: string;
  avatar: string;
}

export interface Message {
  id?: number;
  senderName?: string;
  senderRole?: string;
  senderAvatar?: string;
  isSender?: boolean;
  message: string;
  sentTime?: string;
  channelId?: number | string;
  channelIdAlias?: string;
  file?: object;
  preview?: string;
  noAvatar?: boolean;
}

interface NewMessageParam {
  channelId: number | string;
  message: string;
  env?: string;
  file?: object;
}

interface MessageListParams {
  channel_id: number | string;
  cursor: number | string;
  size: number;
}

interface MarkAsSeenParams {
  channel_id: number | string;
  ids: number[];
  action?: string;
}

interface UnreadMessageParams {
  filter: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(
    private request: RequestService,
    private utils: UtilsService,
    private pusherService: PusherService
  ) {}

  /**
   * this method return chat list data.
   */
  getChatList(): Observable<ChatChannel[]> {
    return this.request.chatGraphQLQuery(
      `query getChannels {
        channels{
          uuid name avatar isAnnouncement isDirectMessage readonly roles unreadMessageCount lastMessage lastMessageCreated
        }
      }`
    ).pipe(map(response => {
      return this._normaliseChatListResponse(response.data);
    }));
  }

  /**
   * modify the Chat list response
   */
  private _normaliseChatListResponse(data): ChatChannel[] {
    const result = JSON.parse(JSON.stringify(data.channels));
    if (!Array.isArray(result)) {
      this.request.apiResponseFormatError('Chat format error');
      return [];
    }
    if (result.length === 0) {
      return [];
    }
    const chats = [];
    result.forEach(chat => {
      chats.push({
        channelId: chat.uuid,
        channelName: chat.name,
        channelAvatar: chat.avatar,
        isAnnouncement: chat.isAnnouncement,
        isDirectMessage: chat.isDirectMessage,
        pusherChannelName: chat.pusher_channel_name,
        readonly: chat.readonly,
        roles: chat.roles,
        unreadMessages: chat.unread_messages,
        lastMessage: chat.last_message,
        lastMessageCreated: chat.last_message_created
      });
    });
    return chats;
  }

  /**
   * this method return a list of messages for a chat channel.
   * data is a json object
   * {
   *   channel_id: 1234,
   *   cursor: 1,
   *   size:20
   * }
   */
  getMessageList(data: MessageListParams): Observable<Message[]> {
    return this.request.chatGraphQLQuery(
      `query getChannellogs($uuid:string!, $cursor:string!, $size:Int!) {
        channel(uuid:$uuid){
          chatLogsConnection(cursor:$cursor, size:$size){
            cursor chatLogs{
              senderUuid isSender message file created
            }
          }
        }
      }`,
      {
        uuid: data.channel_id,
        cursor: data.cursor,
        size: data.size
      }
    ).pipe(map(response => {
      return this._normaliseMessageListResponse(response.data, data.channel_id);
    }));
  }

  /**
   * modify the message list response
   * @TODO need to find a way to save cursor or send to component and keep in that side.
   */
  private _normaliseMessageListResponse(data, channelId): Message[] {
    const messageListResult = JSON.parse(JSON.stringify(data.channel.chatLogsConnection.chatLogs));
    const cursor = JSON.parse(JSON.stringify(data.channel.chatLogsConnection.cursor));
    if (!Array.isArray(messageListResult)) {
      this.request.apiResponseFormatError('Message array format error');
      return [];
    }
    if (messageListResult.length === 0) {
      return [];
    }

    const messageList = [];
    this.getChatMembers(channelId).subscribe(
      members => {
        if (!members) {
          return [];
        }

        messageListResult.forEach(message => {

          const sender = members.find(member => member.uuid === message.senderUuid);
          if (!sender) {
            return [];
          }

          messageList.push({
            id: message.id,
            senderName: sender.name,
            senderRole: sender.role,
            senderAvatar: sender.avatar,
            isSender: message.isSender,
            message: message.message,
            sentTime: message.created,
            file: message.file
          });
        });
      }
    );
    return messageList;
  }

  /**
   * this method return members of a chat channels.
   */
  getChatMembers(channelId): Observable<ChannelMembers[]> {
    return this.request.chatGraphQLQuery(
      `query getChannelmembers($uuid:string!) {
        channel(uuid:$uuid){
          members{
            uuid name role avatar
          }
        }
      }`,
      {
        uuid: channelId
      }
    ).pipe(map(response => {
      return this._normaliseChatMembersResponse(response.data);
    }));
  }

  private _normaliseChatMembersResponse(data): ChannelMembers[] {
    const result = JSON.parse(JSON.stringify(data.channel.members));
    if (!Array.isArray(result)) {
      this.request.apiResponseFormatError('Member array format error');
      return [];
    }
    if (result.length === 0) {
      return [];
    }

    return result;
  }

  /**
   * This method is returning pusher channel list to subscribe.
   */
  getPusherChannels(): Observable<any[]> {
    return this.request.chatGraphQLQuery(
      `query getPusherChannels {
        channels {
          pusherChannel
        }
      }`
    ).pipe(map(response => {
      return this._normalisePusherChannelsResponse(response.data);
    }));
  }

  private _normalisePusherChannelsResponse(data): any[] {
    const result = JSON.parse(JSON.stringify(data.channels.pusherChannel));
    if (!Array.isArray(result)) {
      this.request.apiResponseFormatError('Pusher Channel array format error');
      return [];
    }
    if (result.length === 0) {
      return [];
    }

    return result;
  }

  markMessagesAsSeen(prams: MarkAsSeenParams): Observable<any> {
    const body = {
      channel_id: prams.channel_id,
      id: prams.ids,
      action: 'mark_seen'
    };
    return this.request.post(api.markAsSeen, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  }

  /**
   * @name postNewMessage
   * @description post new text message (with text) or attachment (with file)
   */
  postNewMessage(data: NewMessageParam): Observable<any> {
    return this.request.post(api.createMessage, {
      channel_id: data.channelId,
      message: data.message,
      env: environment.env,
      file: data.file,
    })
    .pipe(
      map(response => {
        if (response.success && response.data) {
          return this._normalisePostMessageResponse(response.data);
        }
      })
    );
  }

  /**
   * modify the  new message response
   */
  private _normalisePostMessageResponse(data): { message: Message, channelId?: number } {
    if (!this.utils.has(data, 'id') ||
        !this.utils.has(data, 'sender.name') ||
        !this.utils.has(data, 'sender.role') ||
        !this.utils.has(data, 'sender.avatar') ||
        !this.utils.has(data, 'is_sender') ||
        !this.utils.has(data, 'message') ||
        !this.utils.has(data, 'sent_time') ||
        !this.utils.has(data, 'file')) {
      this.request.apiResponseFormatError('chat channel format error');
      return null;
    }
    return {
      message: {
        id: data.id,
        senderName: data.sender.name,
        senderRole: data.sender.role,
        senderAvatar: data.sender.avatar,
        isSender: data.is_sender,
        message: data.message,
        sentTime: data.sent_time,
        file: data.file
      },
      channelId: data.channel ? data.channel.channel_id : null
    };
  }

  postAttachmentMessage(data: NewMessageParam): Observable<any> {
    if (!data.file) {
      throw new Error('Fatal: File value must not be empty.');
    }
    return this.postNewMessage(data);
  }
}
