import { Injectable } from "@angular/core";
import { RequestService } from "@shared/request/request.service";
import { HttpParams } from "@angular/common/http";
import { map } from "rxjs/operators";
import { Observable, of } from "rxjs";
import { BrowserStorageService } from "@services/storage.service";
import { UtilsService } from "@services/utils.service";
import { environment } from "../../environments/environment";

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
  id:number
  sender_name:string;
  message:string;
  sent_time:string;
  is_sender:boolean;
  chat_color?: string;
  noAvatar?:boolean;
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

interface GetDatePrams {
  date: any;
  type: string;
  messageList?: any[];
  messageIndex?: number;
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
    private utils: UtilsService
  ) {}

  /**
   * this method return chat list data.
   */
  getchatList(): Observable<any> {
    return this.request.get(api.getChatList).pipe(
      map(response => {
        if (response.success && response.data) {
          return this._normaliseChatListResponse(response.data);
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
            return this._normaliseMessageListResponse(
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
      env: data.env,
      participants_only: '',
    }
    if (data.participants_only) {
      reqData.participants_only = data.participants_only.toString();
    } else {
      delete reqData.participants_only;
    }
    return this.request.post(api.createMessage, reqData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
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
            return this._normalisTeamResponse(response.data);
          }
        })
      );
  }

  private _normalisTeamResponse(data) {
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
    var randomNumber = this._getRamdomNumber();
    return "color-" + randomNumber;
  }

  private _getRamdomNumber() {
    return Math.floor(Math.random() * 19) + 1;
  }

  getDate(prams: GetDatePrams) {
    return this.utils.timeFormatter(prams.date);
  }

  /**
   * modify the Chat list response
   *  - set chat avatar color
   *  - set chat name
   * @param {Array} response
   */
  private _normaliseChatListResponse(data) {
    if (!Array.isArray(data) ||
        !this.utils.has(data[0], 'team_id') ||
        !this.utils.has(data[0], 'is_team') ||
        !this.utils.has(data[0], 'participants_only') ||
        !this.utils.has(data[0], 'name') ||
        !this.utils.has(data[0], 'team_name')) {
      return this.request.apiResponseFormatError('Chat format error');
    }
    if (data.length > 0) {
      return this._setChatAvatarColorAndName(data);
    }
  }

  /**
   * this method check old avatar colors and set the releted one.
   * if there no old avatar colors it will create new color and add that to service variable.
   * @param {Array} response
   */
  private _setChatAvatarColorAndName(data): Array<ChatListObject> {
    let chatColors = this.storage.get("chatAvatarColors");
    let colors: Array<ChatColor> = new Array;
    data.forEach((chat) => {
      if (chatColors && chatColors.length > 0) {
        let colorObject = chatColors.find(function(color) {
          return color.team_member_id === chat.team_member_id;
        });
        if (colorObject) {
          chat.chat_color = colorObject.chat_color;
        } else {
          chat.chat_color = this._getRandomColor();
        }
      } else {
        chat.chat_color = this._getRandomColor();
      }
      colors.push({
        team_member_id: chat.team_member_id,
        team_id: chat.team_id,
        name: chat.name,
        chat_color: chat.chat_color
      });
      this._getChatName(chat);
    });
    this.storage.set("chatAvatarColors", colors);
    return data;
  }

  private _getChatName(chat) {
    if (chat.is_team && chat.participants_only) {
      chat.name = chat.team_name;
    } else if (chat.is_team && !chat.participants_only) {
      chat.name = chat.team_name + " + Mentor";
    }
  }

  /**
   * modify the message list response
   * @param data 
   * @param isTeam 
   * @param chatColor 
   */
  private _normaliseMessageListResponse(data, isTeam, chatColor) {
    let colors:Array<ChatColor> = new Array;
    if (!Array.isArray(data) ||
        !this.utils.has(data[0], 'id') ||
        !this.utils.has(data[0], 'sender_name') ||
        !this.utils.has(data[0], 'message') ||
        !this.utils.has(data[0], 'is_sender')) {
      return this.request.apiResponseFormatError('Message format error');
    }
    if (data.length > 0) {
      data.forEach((message) => {
        if (message && !message.is_sender) {
          if (isTeam) {
            message.chat_color = this._getValidChatColors(message.sender_name);
          } else if (chatColor) {
            message.chat_color = chatColor;
          } else {
            message.chat_color = this._getRandomColor();
          }
          colors.push({
            team_member_id: message.team_member_id,
            team_id: message.team_id,
            name: message.name,
            chat_color: message.chat_color
          });
        }
      });
      if (colors.length > 0) {
        this.storage.set("chatAvatarColors", colors);
      }
      return data;
    }
  }

  private _getValidChatColors(senderName) {
    let chatColors = this.storage.get("chatAvatarColors");
    let color:string = '';
    if (chatColors) {
      let chatcolor = chatColors.find(function(chat) {
        return chat.name === senderName;
      });
      if (chatcolor) {
        color = chatcolor.chat_color;
      } else {
        color = this._getRandomColor();
      }
    } else {
      color = this._getRandomColor();
    }
    return color;
  }
}
