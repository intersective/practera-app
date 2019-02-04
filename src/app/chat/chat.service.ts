import { Injectable } from "@angular/core";
import { RequestService } from "@shared/request/request.service";
import { HttpParams } from "@angular/common/http";
import { map } from "rxjs/operators";
import { Observable, of } from "rxjs";
import { BrowserStorageService } from "@services/storage.service";
import { UtilsService } from "@services/utils.service";
import { PusherService } from "@shared/pusher/pusher.service";
import { environment } from "@environments/environment";

/**
 * @name api
 * @description list of api endpoint involved in this service
 * @type {Object}
 */
const api = {
  getChatList: "api/v2/message/chat/list.json",
  getChatMessages: "api/v2/message/chat/list_messages.json",
  createMessage: "api/v2/message/chat/create_message",
  markAsSeen: "api/v2/message/chat/edit_message",
  getTeam: "api/teams.json"
};

export interface ChatListObject {
  team_id: number;
  team_name: string;
  team_member_id?: number;
  name: string;
  role?: string;
  unread_messages?: number;
  last_message_created?: string;
  last_message?: string;
  is_team: boolean;
  participants_only: boolean;
  chat_color?: string;
}

export interface ChatRoomObject {
  name: string;
  team_name?: string;
  is_team?: boolean;
  team_id: number;
  team_member_id: number;
  chat_color?: string;
  participants_only?: boolean;
}

export interface Message {
  id?: number;
  sender_name?: string;
  receiver_name?: string;
  message?: string;
  sent_time?: string;
  is_sender?: boolean;
  chat_color?: string;
  noAvatar?: boolean;
}
interface NewMessage {
  to: number | string;
  message: string;
  team_id: number;
  env?: string;
  participants_only?: boolean;
}

interface MessageListPrams {
  team_id: number;
  team_member_id?: number;
  page: number;
  size: number;
  participants_only?: boolean;
}

interface MarkAsSeenPrams {
  team_id: number;
  id: string | number;
  action?: string;
}

interface UnreadMessagePrams {
  filter: string;
}

export interface ChatColor {
  team_member_id: number;
  team_id: number;
  name: string;
  chat_color: string;
}

@Injectable({
  providedIn: "root"
})
export class ChatService {

  constructor(
    private request: RequestService,
    private storage: BrowserStorageService,
    private utils: UtilsService,
    private pusherService:PusherService
  ) {}

  /**
   * this method return chat list data.
   */
  getchatList(): Observable<any> {
    return this.request.get(api.getChatList).pipe(
      map(response => {
        if (response.success && response.data) {
          return this._normaliseeChatListResponse(response.data);
        }
      })
    );
  }

  /**
   * this method return message for one chat.
   * @param prams
   *  prams is a json object
   * {
   *  team_id: 1234,
   *  team_member_id: 4567,
   *  page: 1,
   *  size:20
   * }
   */
  getMessageList(data: MessageListPrams, isTeam:boolean, chatColor:string): Observable<any> {
    return this.request
      .get(api.getChatMessages, {
        params: data
      })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return this._normaliseeMessageListResponse(
              response.data,
              isTeam,
              chatColor
            );
          }
        })
      );
  }

  markMessagesAsSeen(prams: MarkAsSeenPrams): Observable<any> {
    let body = {
      team_id: prams.team_id,
      id: prams.id,
      action: "mark_seen"
    };
    return this.request.post(api.markAsSeen, body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
  }

  postNewMessage(data: NewMessage): Observable<any> {
    let reqData = {
      to: data.to,
      message: data.message,
      team_id:data.team_id,
      env: environment.env,
      participants_only: '',
    }
    if (data.participants_only) {
      reqData.participants_only = data.participants_only.toString();
    } else {
      delete reqData.participants_only;
    }
    return this.request.post(api.createMessage, reqData);
  }

  unreadMessageCout(data: UnreadMessagePrams): Observable<any> {
    let body = {
      unread_count_for: data.filter
    };
    return this.request.get(api.getChatMessages, body);
  }

  getTeamName(id: number): Observable<any> {
    let data = {
      team_id: id
    };
    return this.request
      .get(api.getTeam, {
        params: data
      })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return this._normaliseTeamResponse(response.data);
          }
        })
      );
  }

  getMessageFromEvent(data) {
    let presenceChannelId = this.pusherService.getMyPresenceChannelId();
    let chatColors;
    // don't show the message if it is from the current user,
    // or it is not to this user and not a team message
    if ((presenceChannelId === data.event.from) ||
        (presenceChannelId !== data.event.to && data.event.to !== 'team')
      ) {
      return null;
    }
    // show the message if it is team message, and participants_only match
    // or it is individual message and sender match
    if (!(
          (data.isTeam && data.event.to == 'team' &&
            data.participants_only == data.event.participants_only) ||
          (data.event.sender_name === data.chatName &&
            data.event.to !== 'team')
      )) {
      return null;
    }
    let message = {
      id: data.event.id,
      is_sender: data.event.is_sender,
      message: data.event.message,
      sender_name: data.event.sender_name,
      sent_time: data.event.sent_time,
      chat_color : ''
    };
    if (!message.is_sender) {
      message.chat_color = this._getAvataColor(message.sender_name, data.event.team_id);
    }
    return message;
  }

  private _normaliseTeamResponse(data) {
    if (!this.utils.has(data, 'Team')) {
      return this.request.apiResponseFormatError('Team format error');
    }
    return data.Team.name;
  }

  generateChatAvatarText(text) {
    let chatNameArray = text.split(" ");
    let avatarText = "";
    if (chatNameArray[0] && chatNameArray[1]) {
      avatarText += chatNameArray[0].charAt(0).toUpperCase();
      avatarText += chatNameArray[1].charAt(0).toUpperCase();
    } else {
      avatarText += chatNameArray[0].charAt(0).toUpperCase();
      avatarText += chatNameArray[0].charAt(1).toUpperCase();
    }

    return avatarText;
  }

  private _getRandomColor() {
    // currently we have 19 colors
    var randomNumber = Math.floor(Math.random() * 19) + 1;
    return "color-" + randomNumber;
  }

  /**
   * modify the Chat list response
   *  - set chat avatar color
   *  - set chat name
   * @param {Array} response
   */
  private _normaliseeChatListResponse(data) {
    if (!Array.isArray(data)) {
      return this.request.apiResponseFormatError('Chat format error');
    }
    if (data.length == 0) {
      return [];
    }
    let chats = [];
    data.forEach(chat => {
      if(!this.utils.has(chat, 'team_id') ||
          !this.utils.has(chat, 'is_team') ||
          !this.utils.has(chat, 'participants_only') ||
          !this.utils.has(chat, 'name') ||
          !this.utils.has(chat, 'team_name')
        ){
        return this.request.apiResponseFormatError('Chat object format error');
      }
      chat['chat_color'] = this._getAvataColor(chat.name, chat.team_id)
      chat.name = this._getChatName(chat);
      chats.push(chat);
    });
    return chats;
  }

  private _getChatName(chat) {
    if (!chat.is_team) {
      return chat.name;
    }
    if (chat.participants_only) {
      return chat.team_name;
    } else {
      return chat.team_name + " + Mentor";
    }
  }

  /**
   * modify the message list response
   * @param data
   * @param isTeam
   * @param chatColor
   */
  private _normaliseeMessageListResponse(data, isTeam, chatColor) {
    if (!Array.isArray(data)) {
      return this.request.apiResponseFormatError('Message array format error');
    }
    if (data.length == 0) {
      return [];
    }
    let messageList = [];
    data.forEach(message => {
      if (!this.utils.has(message, 'id') ||
          !this.utils.has(message, 'sender_name') ||
          !this.utils.has(message, 'receiver_name') ||
          !this.utils.has(message, 'message') ||
          !this.utils.has(message, 'is_sender')) {
        return this.request.apiResponseFormatError('Message format error');
      }
      if (!message.is_sender) {
        message.chat_color = this._getAvataColor(message.sender_name);
      }
      messageList.push(message);
    });
    return messageList;
  }

  /**
   * Get the avatar color of a person
   * @param {string} name   [Name of this person]
   * @param {number} teamId [This person's team id]
   */
  private _getAvataColor(name, teamId?) {
    if (!teamId) {
      teamId = this.storage.getUser().teamId;
    }
    // get colors from local storage
    let chatColors = this.storage.get("chatAvatarColors");
    if (!chatColors) {
      chatColors = [];
    }
    if (chatColors) {
      // find the color for this person
      let chatcolor = chatColors.find(function(chat) {
        // the reason of storing & checking name instead of id is that the API
        // 1. returns the actually id in /message/chat/list.json,
        // 2. returns UUID in send-event from Pusher
        // 3. doesn't return id in /message/chat/list_message.json
        // @TODO we need to change API so that it returns UUID all the time later
        return (chat.name === name && chat.teamId === teamId);
      });
      if (chatcolor) {
        //just return the color if found
        return chatcolor.color;
      }
    }
    // generate a random color if not found
    let color = this._getRandomColor();
    chatColors.push({
      teamId: teamId,
      name: name,
      color: color
    });
    // save the new color to local storage
    this.storage.set("chatAvatarColors", chatColors);
    return color;
  }
}
