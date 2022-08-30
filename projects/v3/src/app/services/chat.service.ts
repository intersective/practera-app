import { Injectable } from '@angular/core';
import { ApolloService } from '@v3/services/apollo.service';
import { RequestService } from 'request';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { UtilsService } from '@v3/services/utils.service';
import { PusherService } from '@v3/services/pusher.service';
import { environment } from '@v3/environments/environment';
import { DemoService } from './demo.service';

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
  canEdit: boolean;
}

export interface ChannelMembers {
  uuid: string;
  name: string;
  role: string;
  email: string;
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
  fileObject?: any;
  preview?: string;
  noAvatar?: boolean;
  channelUuid?: string;
  sentAt?: string;
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
    private apolloService: ApolloService,
    private request: RequestService,
    private utils: UtilsService,
    private pusherService: PusherService,
    private demo: DemoService
  ) {}

  /**
   * this method return chat list data.
   */
  getChatList(): Observable<ChatChannel[]> {

    if (environment.demo) {
      return of(this._normaliseChatListResponse(this.demo.channels));
    }

    return this.apolloService.chatGraphQLQuery(
      `query getChannels {
        channels{
          uuid
          name
          avatar
          isAnnouncement
          isDirectMessage
          readonly
          roles
          unreadMessageCount
          lastMessage
          lastMessageCreated
          pusherChannel
          canEdit
        }
      }`
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
    let result = JSON.parse(JSON.stringify(data.channels));
    if (!Array.isArray(result)) {
      this.request.apiResponseFormatError('Chat format error');
      return [];
    }
    if (result.length === 0) {
      return [];
    }
    result = this._sortChatList(result);
    return result.filter(c => c.name);
  }

  /**
   * Sort chat channel list to show latest chat to on top.
   * @param chatList Array of chat channels.
   * @returns ChatChannel[]
   */
  private _sortChatList(chatList: ChatChannel[]) {
    chatList.sort(function(a, b) {
      return new Date(b.lastMessageCreated).getTime() - new Date(a.lastMessageCreated).getTime();
    });
    return chatList;
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

    if (environment.demo) {
      return of(this._normaliseMessageListResponse(this.demo.channelLogs(data.channelUuid)));
    }

    return this.apolloService.chatGraphQLQuery(
      `query getChannellogs($uuid:String!, $cursor:String!, $size:Int!) {
        channel(uuid:$uuid){
          chatLogsConnection(cursor:$cursor, size:$size){
            cursor
            chatLogs{
              uuid
              isSender
              message
              file
              created
              sentAt
              sender {
                uuid
                name
                role
                avatar
              }
            }
          }
        }
      }`,
      {
        uuid: data.channelUuid,
        cursor: data.cursor,
        size: data.size
      }
    ).pipe(map(response => {
      if (response.data) {
        return this._normaliseMessageListResponse(response.data);
      }
    }));
  }

  /**
   * modify the message list response
   * @TODO need to find a way to save cursor or send to component and keep in that side.
   */
  private _normaliseMessageListResponse(data): MessageListResult {
    const messages = JSON.parse(JSON.stringify(data.channel.chatLogsConnection.chatLogs));
    const cursor = JSON.parse(JSON.stringify(data.channel.chatLogsConnection.cursor));
    if (!Array.isArray(messages)) {
      this.request.apiResponseFormatError('Message array format error');
      return null;
    }
    if (messages.length === 0) {
      return null;
    }
    const messageList = [];
    messages.forEach(message => {
      let fileObject = null;
      if ((typeof message.file) === 'string') {
        fileObject = JSON.parse(message.file);
        if (this.utils.isEmpty(fileObject)) {
          fileObject = null;
        }
      } else {
        fileObject = message.file;
      }
      messageList.push({
        uuid: message.uuid,
        isSender: message.isSender,
        message: message.message,
        file: message.file,
        fileObject: fileObject,
        created: message.created,
        senderUuid: message.sender.uuid,
        senderName: message.sender.name,
        senderRole: message.sender.role,
        senderAvatar: message.sender.avatar,
        sentAt: message.sentAt
      });
    });
    return {
      cursor: cursor,
      messages: messageList
    };
  }

  /**
   * this method return members of a chat channels.
   */
  getChatMembers(channelId): Observable<ChannelMembers[]> {

    if (environment.demo) {
      return of(this._normaliseChatMembersResponse(this.demo.channelMenbers));
    }

    return this.apolloService.chatGraphQLQuery(
      `query getChannelmembers($uuid:String!) {
        channel(uuid:$uuid){
          members{
            uuid
            name
            role
            avatar
            email
          }
        }
      }`,
      {
        uuid: channelId
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

    if (environment.demo) {
      return of(this._normalisePusherChannelsResponse(this.demo.pusherChannels));
    }

    return this.apolloService.chatGraphQLQuery(
      `query getPusherChannels {
        channels {
          pusherChannel
        }
      }`
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

    if (environment.demo) {
      return of(this.demo.markAsSeen);
    }

    return this.apolloService.chatGraphQLMutate(
      `mutation markAsSeen($uuids: [String]!) {
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

    if (environment.demo) {
      return of(this._normalisePostMessageResponse(this.demo.createChatLog(data.message, data.file)));
    }

    return this.apolloService.chatGraphQLMutate(
      `mutation createChatLogs($channelUuid: String!, $message: String, $file: String) {
        createChatLog(channelUuid: $channelUuid, message: $message, file: $file) {
            uuid
            isSender
            message
            file
            created
            sentAt
            sender {
              uuid
              name
              role
              avatar
          }
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
        !this.utils.has(result, 'sender.uuid') ||
        !this.utils.has(result, 'isSender') ||
        !this.utils.has(result, 'message') ||
        !this.utils.has(result, 'created') ||
        !this.utils.has(result, 'file')) {
      this.request.apiResponseFormatError('chat channel format error');
      return null;
    }
    let fileObject = null;
    if ((typeof result.file) === 'string') {
      fileObject = JSON.parse(result.file);
    } else {
      fileObject = result.file;
    }
    return {
      uuid: result.uuid,
      isSender: result.isSender,
      message: result.message,
      file: result.file,
      fileObject: fileObject,
      created: result.created,
      senderUuid: result.sender.uuid,
      senderName: result.sender.name,
      senderRole: result.sender.role,
      senderAvatar: result.sender.avatar,
      sentAt: result.sentAt
    };
  }

  postAttachmentMessage(data: NewMessageParam): Observable<any> {
    if (!data.file) {
      throw new Error('Fatal: File value must not be empty.');
    }
    return this.postNewMessage(data);
  }
}
