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

interface newMessage {
  to: number | string;
  message: string;
  team_id: number;
  env?: string;
  participants_only?: boolean;
}

interface messageListPrams {
  team_id: number;
  team_member_id?: number;
  page: number;
  size: number;
  participants_only?: boolean;
}

interface markAsSeenPrams {
  team_id: number;
  id: string | number;
  action?: string;
}

interface unreadMessagePrams {
  filter: string;
}

interface getDatePrams {
  date: any;
  type: string;
  messageList?: any[];
  messageIndex?: number;
}

@Injectable({
  providedIn: "root"
})
export class ChatService {
  private chatList: any[];
  private chatColors: any[];
  private colorArray = [];

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
  getMessageList(data: messageListPrams, selectedChat: any): Observable<any> {
    return this.request
      .get(api.getChatMessages, {
        params: data
      })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return this._normalisMessageListResponse(
              response.data,
              selectedChat
            );
          }
        })
      );
  }

  markMessagesAsSeen(prams: markAsSeenPrams): Observable<any> {
    let body = {
      team_id: prams.team_id,
      id: prams.id,
      action: "mark_seen"
    };
    return this.request.post(api.markAsSeen, body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
  }

  postNewMessage(data: newMessage): Observable<any> {
    const body = new HttpParams()
      .set("data[to]", data.to.toString())
      .set("data[message]", data.message)
      .set("data[team_id]", data.team_id.toString())
      .set("env", environment.env);
      if (data.participants_only) {
        body.set("participants_only", data.participants_only.toString());
      }
    return this.request.post(api.createMessage, body.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
  }

  unreadMessageCout(data: unreadMessagePrams): Observable<any> {
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

  private _normalisTeamResponse(response) {
    return response.Team.name;
  }

  generateChatAvatarText(text) {
    let chatNameArray = text.split(" ");
    let avatarText = "";
    if (chatNameArray[0] && chatNameArray[1]) {
      avatarText += chatNameArray[0].charAt(0).toUpperCase();
      avatarText += chatNameArray[1].charAt(0).toUpperCase();
    } else if (chatNameArray[0]) {
      avatarText += chatNameArray[0].charAt(0).toUpperCase();
      avatarText += chatNameArray[0].charAt(1).toUpperCase();
    } else {
      avatarText += chatNameArray[1].charAt(0).toUpperCase();
      avatarText += chatNameArray[1].charAt(1).toUpperCase();
    }

    return avatarText;
  }

  getRandomColor() {
    var randomNumber = this.getRamdomNumber();
    return "color-" + randomNumber;
  }

  private getRamdomNumber() {
    return Math.floor(Math.random() * 19) + 1;
  }

  getDate(prams: getDatePrams) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Dec"
    ];
    let returnDate = "";
    let returnTime = "";
    if (prams.date) {
      var UTCDate = prams.date.replace(/-/g, "/") + " UTC";
      var chatDate = new Date(UTCDate);
      var today = new Date();
      var diff = today.getDate() - chatDate.getDate();
      if (diff === 0) {
        returnDate = "Today";
      } else if (diff === 1) {
        returnDate = "Yesterday";
      } else {
        returnDate =
          months[chatDate.getMonth()] + " " + chatDate.getDate().toString();
      }

      returnTime = chatDate.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true
      });

      switch (prams.type) {
        case "list":
          if (diff === 0) {
            return returnTime;
          } else {
            return returnDate;
          }
        case "room":
          if (prams.messageList && prams.messageIndex) {
            if (prams.messageList[prams.messageIndex - 1]) {
              var currentMessageTime = new Date(
                prams.messageList[prams.messageIndex].sent_time
              );
              var oldMessageTime = new Date(
                prams.messageList[prams.messageIndex - 1].sent_time
              );
              var dateDiff =
                currentMessageTime.getDate() - oldMessageTime.getDate();
              if (dateDiff === 0) {
                return returnTime;
              } else {
                return returnDate + " " + returnTime;
              }
            }
          }
      }
    } else {
      return "";
    }
  }

  /**
   * modify the response
   *  - set chat avatar color
   * @param {Array} response
   */
  private _normaliseChatListResponse(response): Array<any> {
    if (response) {
      this.chatList = [];
      this.chatColors = this.storage.get("chatAvatarColors");
      if (!this.chatColors) {
        return this.setChatAvatarColors(response, null, "nocolor");
      } else {
        return this.setChatAvatarColors(response, this.chatColors, "havecolor");
      }
    }
  }

  /**
   * this method check old avatar colors and set the releted one.
   * if there no old avatar colors it will create new color and add that to service variable.
   * @param {Array} response
   * @param {Array} chatColors
   * @param {String} status
   */
  private setChatAvatarColors(response, chatColors, status): Array<any> {
    let index = 0;
    for (index = 0; index < response.length; index++) {
      if (response[index]) {
        switch (status) {
          case "nocolor":
            response[index].chat_color = this.getRandomColor();
            this.colorArray.push({
              team_member_id: response[index].team_member_id,
              team_id: response[index].team_id,
              name: response[index].name,
              chat_color: response[index].chat_color
            });
            break;
          case "havecolor":
            let colorObject = chatColors.find(function(chat) {
              return chat.team_member_id === response[index].team_member_id;
            });
            if (colorObject) {
              response[index].chat_color = colorObject.chat_color;
            } else {
              response[index].chat_color = this.getRandomColor();
            }
            break;
        }
        this.chatList.push(response[index]);
      }
    }
    if (this.colorArray.length > 0) {
      this.storage.set("chatAvatarColors", this.colorArray);
    }
    return this._filterChatList();
  }

  private _filterChatList(): Array<any> {
    let myRole = this.storage.get("role");
    let index:number;
    if (myRole !== "mentor") {
      index = 0;
      for (; index < this.chatList.length; index++) {
        if (
          this.chatList[index].role === "mentor" &&
          this.chatList[index].last_message_created === null &&
          this.chatList[index].last_message === null
        ) {
          this.chatList.splice(index, 1);
        }
      }
    } else {
      index = 0;
      for (; index < this.chatList.length; index++) {
        if (this.chatList[index].participants_only === true) {
          this.chatList.splice(index,1);
        }
    }
    }
    return this.chatList;
  }

  private _normalisMessageListResponse(response, selectedChat): Array<any> {
    let index = 0;
    if (response.length > 0) {
      for (index = 0; index < response.length; index++) {
        if (response[index] && !response[index].is_sender) {
          if (selectedChat.is_team) {
            this.getValidChatColors(this.chatColors, response, index);
          } else if (selectedChat.chat_color) {
            response[index].chat_color = selectedChat.chat_color;
          } else {
            response[index].chat_color = this.getRandomColor();
          }
          this.colorArray.push({
            team_member_id: response[index].team_member_id,
            team_id: response[index].team_id,
            name: response[index].name,
            chat_color: response[index].chat_color
          });
        }
      }
      if (this.colorArray.length > 0) {
        this.storage.set("chatAvatarColors", this.colorArray);
      }
      return response;
    }
  }

  private getValidChatColors(chatColors, response, index) {
    if (chatColors) {
      let chatcolor = chatColors.find(function(chat) {
        return chat.name === response[index].sender_name;
      });
      if (chatcolor) {
        response[index].chat_color = chatcolor.chat_color;
      } else {
        response[index].chat_color = this.getRandomColor();
      }
    } else {
      response[index].chat_color = this.getRandomColor();
    }
    this.colorArray.push({
      team_member_id: response[index].team_member_id,
      team_id: response[index].team_id,
      name: response[index].name,
      chat_color: response[index].chat_color
    });
  }
}
