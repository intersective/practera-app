import { Component, OnInit, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Content } from "@ionic/angular";
import { BrowserStorageService } from "@services/storage.service";

import { ChatService } from "../chat.service";

interface Chat {
  name: string;
  team_name?: string;
  is_team?: boolean;
  team_id: number;
  team_member_id: number;
  chat_color?: string;
}

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
  selectedChat: Chat;
  chatColors: any[];
  routeTeamId:number = 0;
  routeTeamMemberId:number = 0;
  messagePageNumber:number = 0;
  messagePagesize:number = 20;

  constructor(
    private chatService: ChatService,
    private router: Router,
    private storage: BrowserStorageService,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.chatColors = this.storage.get("chatAvatarColors");
    this.selectedChat = this.storage.get("selectedChatObject") || {
      name: '',
      is_team: false,
      team_id: null,
      team_member_id: null,
      chat_color: null,
    };
    this.validateRoutePrams();
  }

  private validateRoutePrams() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.routeTeamId = +params['teamId']; // (+) converts string 'teamId' to a number
      this.routeTeamMemberId = +params['memberId']; // (+) converts string 'memberId' to a number
      this.loadMessages();
   });
  }

  loadMessages() {
    // creating params need to load messages.
    let param = {
      team_id : this.routeTeamId,
      page: this.getMessagePageNumber(),
      size: this.messagePagesize,
      team_member_id: this.routeTeamMemberId
    }
    this.chatService.getMessageList(param).subscribe(response => {
      this.updateMessageListResponse(response, false);
    });
  }

  private getMessagePageNumber() {
    return (this.messagePageNumber += 1);
  }

  getChatAvatarText(senderName) {
    return this.chatService.generateChatAvatarText(senderName);
  }

  back() {
    this.router.navigateByUrl('/app/(chat:chat)');
  }

  sendMessage() {
    if (this.message) {
      const message = this.message;
      this.message = ""; // remove typed message from text field.
      // createing prams need to send message
      let data = {
        message: message,
        team_id: this.selectedChat.team_id,
        to: null,
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
          tempRes = Object.assign([], response);
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

  // call chat api to mark message as seen messages
  private markAsSeen(messageList) {
    let messageIdList = [];
    let index = 0;
    // createing id array to mark as read.
    for (index = 0; index < messageList.length; index++) {
      messageIdList.push(messageList[index].id);
    }
    this.chatService
      .markMessagesAsSeen({
        id: JSON.stringify(messageIdList),
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
