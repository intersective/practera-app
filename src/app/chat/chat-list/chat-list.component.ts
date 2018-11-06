import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-chat-list",
  templateUrl: "chat-list.component.html",
  styleUrls: ["chat-list.component.scss"]
})
export class ChatListComponent implements OnInit {
  chatList: any[];

  constructor() {}

  ngOnInit() {
    this.loadChatData();
  }

  loadChatData() {
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
        is_team: true,
        chat_color: "color-1"
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
        is_team: true,
        chat_color: "color-3"
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
        is_team: false,
        chat_color: "color-5"
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
        is_team: false,
        chat_color: "color-2"
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
        is_team: false,
        chat_color: "color-7"
      }
    ];
  }

  getChatAvatarText(chatName) {
    let chatNameArray = chatName.split(" ");
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
}
