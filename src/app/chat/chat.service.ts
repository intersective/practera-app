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
  createMessage: 'api/v2/message/chat/create_message',
  markAsSeen: 'api/v2/message/chat/edit_message'
};

export interface ChatChannel {
  uuid: string;
  name: string;
  avatar: string;
  isAnnouncement: boolean;
  isDirectMessage: boolean;
  pusherChannel: string;
  readonly: boolean;
  roles: string[];
  unreadMessageCount: number;
  lastMessage: string;
  lastMessageCreated: string;
}

export interface ChannelMembers {
  uuid: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Message {
  uuid: string;
  senderUuid?: string;
  senderName?: string;
  senderRole?: string;
  senderAvatar?: string;
  isSender: boolean;
  message: string;
  created: string;
  file: string;
  fileObject?: object;
  preview?: string;
  noAvatar?: boolean;
  channelUuid?: string;
}

export interface MessageListResult {
  cursor: string;
  messages: Message[];
}

interface NewMessageParam {
  channelUuid: string;
  message: string;
  file?: string;
}

interface MessageListParams {
  channelUuid: string;
  cursor: string;
  size: number;
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
      }`,
      {},
      {
        noCache: true
      }
    ).pipe(map(response => {
      if (response.data) {
        return this._normaliseChatListResponse(response.data);
      }
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
        uuid: chat.uuid,
        name: chat.name,
        avatar: chat.avatar,
        isAnnouncement: chat.isAnnouncement,
        isDirectMessage: chat.isDirectMessage,
        pusherChannel: chat.pusherChannel,
        readonly: chat.readonly,
        roles: chat.roles,
        unreadMessageCount: chat.unreadMessageCount,
        lastMessage: chat.lastMessage,
        lastMessageCreated: chat.lastMessageCreated
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
  getMessageList(data: MessageListParams): Observable<MessageListResult> {
    return this.request.chatGraphQLQuery(
      `query getChannellogs($uuid:String!, $cursor:String!, $size:Int!) {
        channel(uuid:$uuid){
          chatLogsConnection(cursor:$cursor, size:$size){
            cursor chatLogs{
              uuid senderUuid isSender message file created
            }
          }
        }
      }`,
      {
        uuid: data.channelUuid,
        cursor: data.cursor,
        size: data.size
      },
      {
        noCache: true
      }
    ).pipe(map(response => {
      if (response.data) {
        return this._normaliseMessageListResponse(response.data, data.channelUuid);
      }
    }));
  }

  /**
   * modify the message list response
   * @TODO need to find a way to save cursor or send to component and keep in that side.
   */
  private _normaliseMessageListResponse(data, channelId): MessageListResult {
    const messages = JSON.parse(JSON.stringify(data.channel.chatLogsConnection.chatLogs));
    const cursor = JSON.parse(JSON.stringify(data.channel.chatLogsConnection.cursor));
    if (!Array.isArray(messages)) {
      this.request.apiResponseFormatError('Message array format error');
      return null;
    }
    if (messages.length === 0) {
      return null;
    }
    return {
      cursor: cursor,
      messages: messages
    };
  }

  /**
   * this method return members of a chat channels.
   */
  getChatMembers(channelId): Observable<ChannelMembers[]> {
    return this.request.chatGraphQLQuery(
      `query getChannelmembers($uuid:String) {
        channel(uuid:$uuid){
          members{
            uuid name role avatar
          }
        }
      }`,
      {
        uuid: channelId
      },
      {
        noCache: true
      }
    ).pipe(map(response => {
      if (response.data) {
        return this._normaliseChatMembersResponse(response.data);
      }
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
      }`,
      {},
      {
        noCache: true
      }
    ).pipe(map(response => {
      if (response.data) {
        return this._normalisePusherChannelsResponse(response.data);
      }
    }));
  }

  private _normalisePusherChannelsResponse(data): any[] {
    const result = JSON.parse(JSON.stringify(data.channels));
    if (!Array.isArray(result)) {
      this.request.apiResponseFormatError('Pusher Channel array format error');
      return [];
    }
    if (result.length === 0) {
      return [];
    }
    return result;
  }

  markMessagesAsSeen(uuids: string[]): Observable<any> {
    return this.request.chatGraphQLMutate(
      `mutation markAsSeen($uuids: [String]) {
        readChatLogs(uuids: $uuids) {
          success
        }
      }`,
      {
        uuids: uuids
      }
    );
  }

  /**
   * @name postNewMessage
   * @description post new text message (with text) or attachment (with file)
   */
  postNewMessage(data: NewMessageParam): Observable<any> {
    return this.request.chatGraphQLMutate(
      `mutation createChatLogs($channelUuid: String, $message: String, $file: String) {
        createChatLog(channelUuid: $channelUuid, message: $message, file: $file) {
            uuid senderUuid isSender message file created
        }
      }`,
      {
        channelUuid: data.channelUuid,
        message: data.message,
        file: data.file
      }
    ).pipe(
      map(response => {
        if (response.data) {
          return this._normalisePostMessageResponse(response.data);
        }
      })
    );
  }

  /**
   * modify the  new message response
   */
  private _normalisePostMessageResponse(data): Message {
    const result = JSON.parse(JSON.stringify(data.createChatLog));
    if (!this.utils.has(result, 'uuid') ||
        !this.utils.has(result, 'senderUuid') ||
        !this.utils.has(result, 'isSender') ||
        !this.utils.has(result, 'message') ||
        !this.utils.has(result, 'created') ||
        !this.utils.has(result, 'file')) {
      this.request.apiResponseFormatError('chat channel format error');
      return null;
    }
    return {
      uuid: result.uuid,
      senderName: result.senderUuid,
      isSender: result.isSender,
      message: result.message,
      created: result.created,
      file: result.file
    };
  }

  postAttachmentMessage(data: NewMessageParam): Observable<any> {
    if (!data.file) {
      throw new Error('Fatal: File value must not be empty.');
    }
    return this.postNewMessage(data);
  }
}
