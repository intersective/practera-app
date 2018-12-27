import { Injectable } from "@angular/core";
import { RequestService } from "@shared/request/request.service";
import { HttpParams } from "@angular/common/http";
import { map } from "rxjs/operators";
import { Observable, of } from "rxjs";
import { BrowserStorageService } from "@services/storage.service";
import { UtilsService } from "@services/utils.service";

/**
 * @name api
 * @description list of api endpoint involved in this service
 * @type {Object}
 */
const api = {
  getChatList: "api/v2/message/chat/list.json",
  getChatMessages: "api/v2/message/chat/list_messages.json",
  createMessage: "api/v2/message/chat/create_message",
  markAsSeen: "api/v2/message/chat/edit_message"
};


interface newMessage {
  to: number | string;
  message: string;
  team_id: number;
  env?: string;
}

interface messageListPrams {
  team_id: number;
  team_member_id: number | null;
  page: number;
  size: number;
}

interface markAsSeenPrams {
  team_id: number;
  id: string | number;
  action?: string;
}

interface unreadMessagePrams {
  filter: string
}

interface getDatePrams {
  date: any,
  type: string,
  messageList?: any[],
  messageIndex?: number
}

@Injectable({
  providedIn: "root"
})
export class ChatService {

  private chatList: any[];
  private messageList: any[];

  constructor(
    private request: RequestService,
    private storage: BrowserStorageService,
    private utils: UtilsService
  ) {
    
  }

  initDemoData() {
    this.chatList = [
      {
        team_id: 1447,
        team_name: "dream team",
        team_member_id: null,
        name: "Team",
        role: null,
        unread_messages: 2,
        last_message_created: "Nov 7",
        last_message: "this is the team chat for dream team",
        is_team: true
      },
      {
        team_id: 1448,
        team_name: "sleep team",
        team_member_id: null,
        name: "Team",
        role: null,
        unread_messages: 2,
        last_message_created: "Nov 5",
        last_message: "this is the team chat for sleep team",
        is_team: true
      },
      {
        team_id: 1447,
        team_name: "dream team",
        team_member_id: 1,
        name: "test student2",
        role: "participant",
        unread_messages: 0,
        last_message_created: "Nov 1",
        last_message: "coming from student 1 to student 2",
        is_team: false
      },
      {
        team_id: 1448,
        team_name: "sleep team",
        team_member_id: 3,
        name: "mob studtest",
        role: "participant",
        last_message_created: "Oct 23",
        last_message: "Message to team meber in sleep team",
        unread_messages: null,
        is_team: false
      },
      {
        team_id: 1448,
        team_name: "sleep team",
        team_member_id: 4,
        name: "mob Mentor",
        role: "mentor",
        last_message_created: null,
        last_message: null,
        unread_messages: null,
        is_team: false
      }
    ];
    this.messageList = [
      {
        id: 14950,
        sender_name: "test student2",
        message: "second chat from student 2 to student 1",
        sent_time: "1.00 PM",
        is_sender: false
      },
      {
        id: 14949,
        sender_name: "test student1",
        message: "coming from student 1 to student 2",
        sent_time: "11.30 AM",
        is_sender: true
      }
    ];
  }

  /**
   * this method return chat list data.
   */
  getchatList(): Observable<any> {
    return this.request.get(api.getChatList);
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
  getMessageList(data: messageListPrams): Observable<any> {
    return this.request.get(api.getChatMessages, {
      params: data
    });
  }

  markMessagesAsSeen(prams: markAsSeenPrams): Observable<any> {
    let body = {
      'team_id': prams.team_id,
      'id': prams.id,
      'action': 'mark_seen'
    }
    return this.request.post(api.markAsSeen, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  }

  postNewMessage(data: newMessage): Observable<any> {
    const body = new HttpParams()
      .set('data[to]', data.to.toString())
      .set('data[message]', data.message)
      .set('data[team_id]',data.team_id.toString())
      .set('env', 'develop');
    return this.request.post(api.createMessage, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  }

  unreadMessageCout(data: unreadMessagePrams): Observable<any>{
    let body = {
      'unread_count_for': data.filter
    }
    return this.request.get(api.getChatMessages, body);
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
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
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
          returnDate = (months[chatDate.getMonth()]) + " " + (chatDate.getDate().toString());
      }

      returnTime = chatDate.toLocaleString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
      });

      switch(prams.type) {
        case 'list':
          if (diff === 0) {
            return returnTime;
          } else {
            return returnDate;
          }
        case 'room': 
        if (prams.messageList && prams.messageIndex) {
          if (prams.messageList[prams.messageIndex - 1]) {
            var currentMessageTime = new Date(prams.messageList[prams.messageIndex].sent_time);
            var oldMessageTime = new Date(prams.messageList[prams.messageIndex - 1].sent_time);
            var dateDiff = currentMessageTime.getDate() - oldMessageTime.getDate();
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

}
