import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ChatService {
  // chat object select to chat
  private selectedChat: any;
  private chatList: any[];
  private messageList: any[];
  private chatAvatarColors: any[];

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
        last_message_created: "2018-08-20 04:52:33",
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
        last_message_created: "2018-08-20 04:52:33",
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
        last_message_created: "2018-08-16 05:18:29",
        last_message: "coming from student 1 to student 2",
        is_team: false
      },
      {
        team_id: 1448,
        team_name: "sleep team",
        team_member_id: 3,
        name: "mob studtest",
        role: "participant",
        last_message_created: "2018-08-16 05:18:52",
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
        sent_time: "2018-08-16 05:18:29",
        is_sender: true
      },
      {
        id: 14950,
        sender_name: "test student2",
        message: "second chat from student 2 to student 1",
        sent_time: "2018-08-16 05:17:10",
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
  getMessageList(prams): Observable<any> {
    return of(this.messageList);
  }

  // set chat object for chat
  setSelectedChat(chatObject) {
    this.selectedChat = chatObject;
  }

  // get selected chat object for chat
  getSelectedChat(): any {
    return this.selectedChat;
  }

  /**
   * set avatar color in service
   * @param colors chat avatar color array
   */
  setChatAvatarColors(colors) {
    this.chatAvatarColors = colors;
  }

  /**
   * get chat avatar color array.
   */
  getChatAvatarColors() {
    return this.chatAvatarColors;
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
