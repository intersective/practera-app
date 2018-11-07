import { Component, OnInit } from "@angular/core";

import { ChatService } from '../chat.service';

@Component({
  selector: "app-chat-room",
  templateUrl: "./chat-room.component.html",
  styleUrls: ["./chat-room.component.scss"]
})
export class ChatRoomComponent implements OnInit {
  messageList: any[];

  constructor(private _ChatService: ChatService) {}

  ngOnInit() {
    this.loadMessages();
  }

  // @TODO need to create method to convert chat time to local time. also need to use in chat
  loadMessages() {
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

  getChatAvatarText(senderName) {
    return this._ChatService.generateChatAvatarText(senderName);
  }
}
