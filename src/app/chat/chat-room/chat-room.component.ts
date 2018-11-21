import { Component, OnInit, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Content } from "@ionic/angular";
import { BrowserStorageService } from "@services/storage.service";

import { ChatService } from "../chat.service";

@Component({
  selector: "app-chat-room",
  templateUrl: "./chat-room.component.html",
  styleUrls: ["./chat-room.component.scss"]
})
export class ChatRoomComponent implements OnInit {
  // @TODO need to create method to convert chat time to local time.
  @ViewChild(Content) content: Content;

  message: any;
  messageList: any[];
  selectedChat: any = {
    name: ""
  };
  chatColors: any[];

  constructor(
    private chatService: ChatService,
    private router: Router,
    private storage: BrowserStorageService
  ) {}

  ngOnInit() {
    this.loadStorageData();
  }

  loadStorageData() {
    this.chatColors = this.storage.get("chatAvatarColors");
    this.selectedChat = this.storage.get("selectedChatObject");
    this.loadMessages();
  }

  loadMessages() {
    this.chatService.getMessageList(null).subscribe(response => {
      this.updateMessageListResponse(response, false);
    });
  }

  getChatAvatarText(senderName) {
    return this.chatService.generateChatAvatarText(senderName);
  }

  goBack() {
    this.router.navigateByUrl('/app/(chat:chat)');
  }

  sendMessage() {
    if (this.message) {
      const message = this.message;
      this.message = "";
      let data = {
        id: 300,
        sender_name: this.selectedChat.name,
        message: message,
        is_sender: true,
        team_id: this.selectedChat.team_id,
        to: null,
        team_name: this.selectedChat.team_name,
        sent_time: '1.30 PM'
      };
      if (this.selectedChat.is_team) {
        data.to = "team";
      } else {
        data.to = this.selectedChat.team_member_id;
      }
      this.chatService.postNewMessage(data).subscribe((response) => {
        this.messageList.push(response);
      }, (error) => {});
    }
  }

  private updateMessageListResponse(response, loadMore): void {
    let index = 0;
    let tempRes = null;
    if (response.length > 0) {
      this.messageList = [];
      for (index = 0; index < response.length; index++) {
        if (response[index] && !response[index].is_sender) {
          if (this.selectedChat.is_team) {
            this.getValidChatColors(this.chatColors, response, index);
          } else {
            response[index].chat_color = this.selectedChat.chat_color;
          }
        }
        if (index === response.length - 1) {
          tempRes = response;
          tempRes.reverse();
          if (loadMore) {
            this.messageList = tempRes.concat(this.messageList);
          } else {
            this.messageList = tempRes;
            this.content.scrollToBottom();
          }
          this.markAsSeen(tempRes);
        }
      }
    }
  }

  private getValidChatColors(chatColors, response, index) {
    let chatcolor = chatColors.find(function(chat) {
      return chat.name === response[index].sender_name;
    });
    if (chatcolor) {
      response[index].chat_color = chatcolor.chat_color;
    } else {
      response[index].chat_color = this.chatService.getRandomColor();
    }
  }

  private markAsSeen(messageList) {
    let messageIdList = [];
    let index = 0;
    for (index = 0; index < messageList.length; index++) {
      messageIdList.push(messageList[index].id);
    }
    this.chatService
      .markMessagesAsSeen({
        ids: JSON.stringify(messageIdList),
        team_id: this.selectedChat.team_id
      })
      .subscribe(
        response => {
          console.log("marked");
        },
        error => {
          console.log("error");
        }
      );
  }
}
