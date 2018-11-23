import { Injectable } from "@angular/core";
import { Observable, of, BehaviorSubject } from "rxjs";


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

@Injectable({
  providedIn: "root"
})
export class ChatService {

  private chatList: any[];
  private messageList: any[];

  constructor() {
    this.initDemoData();
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
        id: 14949,
        sender_name: "test student1",
        message: "coming from student 1 to student 2",
        sent_time: "11.30 AM",
        is_sender: true
      },
      {
        id: 14950,
        sender_name: "test student2",
        message: "second chat from student 2 to student 1",
        sent_time: "1.00 PM",
        is_sender: false
      }
    ];
  }

  /**
   * this method return chat list data.
   */
  getchatList(): Observable<any> {
    return of(this.chatList);
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
  getMessageList(prams: messageListPrams): Observable<any> {
    return of(this.messageList);
  }

  markMessagesAsSeen(prams: markAsSeenPrams): Observable<any> {
    prams.action = 'mark_seen';
    return of("maked");
  }

  postNewMessage(data: newMessage): Observable<any> {
    data.env = 'develop';
    let returnData = {
      id: 300,
      sender_name: 'Chathumal',
      is_sender: true,
      team_name: 'dream team',
      sent_time: '1.30 PM',
      message: data.message,
      team_id: data.team_id,
      to: data.to
    };
    return of(returnData);
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
}
