import { Injectable } from '@angular/core';
import { ApolloService } from '@v3/services/apollo.service';
import { RequestService } from 'request';
import { delay, map } from 'rxjs/operators';
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

export interface Team {
  id: number;
  uuid: string;
  name: string;
}

export interface User {
  id: number;
  uuid: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role?: string;
  email: string;
  image?: string;
  team?: Team;
  teams?: Team[];
  enrolmentUuid?: string;
  timelineUuid?: string;
  institution?: {
    id: number;
    uuid: string;
    name: string;
  };
  userHash?: string;
  contactNumber?: string;
}

export interface FileResponse {
  name: string;
  type: string;
  url: string;
}

export interface Message {
  uuid: string;
  sender: User;
  isSender: boolean;
  message: string;
  file: FileResponse;
  created: string;
  scheduled: string;
  sentAt?: string;

  // TBC
  preview?: string;
  noAvatar?: boolean;
  channelUuid?: string;
  senderUuid?: string;
  senderName?: string;
  senderRole?: string;
  senderAvatar?: string;
}

export interface MessageListResult {
  cursor: string;
  messages: Message[];
}

export interface EditMessageParam {
  uuid: string;
  message?: string;
}

interface NewMessageParam {
  channelUuid: string;
  message: string;
  file?: {
    path: string;
    bucket: string;
    name: string;
    url: string;
    extension: string;
    type: string;
    size: number;
  };
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

    return this.apolloService.graphQLFetch(
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

    return this.apolloService.graphQLFetch(
      `query getChannellogs($uuid:String!, $cursor:String!, $size:Int!) {
        channel(uuid:$uuid){
          chatLogsConnection(cursor:$cursor, size:$size){
            cursor
            chatLogs {
              uuid
              isSender
              message
              file {
                name
                type
                url
              }
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
        variables: {
          uuid: data.channelUuid,
          cursor: data.cursor,
          size: data.size
        }
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
        fileObject,

        uuid: message.uuid,
        sender: message.sender,
        isSender: message.isSender,
        message: message.message,
        file: message.file,
        created: message.created,
        scheduled: message.scheduled,
        sentAt: message.sentAt,

        senderUuid: message.sender.uuid,
        senderName: message.sender.name,
        senderRole: message.sender.role,
        senderAvatar: message.sender.avatar,
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

    return this.apolloService.graphQLFetch(
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
        variables: {uuid: channelId}
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

    return this.apolloService.graphQLFetch(
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

    return this.apolloService.graphQLMutate(
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

    return this.apolloService.graphQLMutate(
      `mutation createChatLogs($channelUuid: String!, $message: String, $fileObj: FileInput) {
        createChatLog(channelUuid: $channelUuid, message: $message, fileObj: $fileObj) {
          uuid
          isSender
          message
          file {
            name
            type
            url
          }
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
        fileObj: data.file
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
      sender: result.sender,
      isSender: result.isSender,
      message: result.message,
      file: result.file,
      created: result.created,
      scheduled: result.scheduled,
      sentAt: result.sentAt,

      // TBC
      senderUuid: result.sender.uuid,
      senderName: result.sender.name,
      senderRole: result.sender.role,
      senderAvatar: result.sender.avatar,
    };
  }

  /**
   * delete a chat message by uuid.
   */
  deleteChatMessage(uuid: string): Observable<any> {
    if (environment.demo) {
      return of({}).pipe(delay(1000));
    }
    return this.apolloService.graphQLMutate(
      `mutation deleteChatMessage($uuid: String!) {
        deleteChatLog(uuid: $uuid) {
          success
        }
      }`,
      { uuid }
    );
  }

  /**
   * edit a chat message (text content).
   */
  editChatMessage(data: EditMessageParam): Observable<any> {
    if (environment.demo) {
      return of({}).pipe(delay(1000));
    }
    return this.apolloService.graphQLMutate(
      `mutation editChatMessage($uuid: String!, $message: String) {
        editChatLog(uuid: $uuid, message: $message) {
          success
        }
      }`,
      {
        uuid: data.uuid,
        message: data.message,
      }
    );
  }

  logChatError(data) {
    return this.apolloService.logError(JSON.stringify(data)).subscribe();
  }
}
