import { Component, OnInit } from "@angular/core";
import { Router, NavigationExtras } from "@angular/router";
import { BrowserStorageService } from "@services/storage.service";

import { ChatService } from "../chat.service";

@Component({
  selector: "app-chat",
  templateUrl: "chat-list.component.html",
  styleUrls: ["chat-list.component.scss"]
})
export class ChatListComponent implements OnInit {
  // @TODO need to create method to convert chat time to local time.
  chatList: any[];
  haveMoreTeam: boolean;
  loadingChatList:boolean = true;
  private chatColors: any[];
  private colorArray = [];

  constructor(
    private chatService: ChatService,
    private router: Router,
    private storage: BrowserStorageService
  ) {}

  ngOnInit() {
    this.haveMoreTeam = false;
    this.loadingChatList = true;
    this.loadChatData();
  }

  loadChatData(): void {
    this.chatService.getchatList().subscribe(response => {
      this.chatList = response;
      this.checkHaveMoreTeam(response);
    });
  }

  /**
   * this method check is this user in multiple teams.
   * @param {Array} response
   */
  private checkHaveMoreTeam(response): void {
    let index = 0;
    let teamCount = 0;
    for (index = 0; index < response.length; index++) {
      if (response[index].is_team) {
        teamCount++;
      }
    }
    if (teamCount > 1) {
      this.haveMoreTeam = true;
    } else {
      this.haveMoreTeam = false;
    }
    this.loadingChatList = false;
  }

  getChatAvatarText(chatName) {
    return this.chatService.generateChatAvatarText(chatName);
  }
  navigateToChatRoom(chat) {
    if (chat.is_team) {
      this.router.navigate([
        "/chat/chat-room",
        chat.team_id,
        chat.participants_only
      ]);
    } else {
      this.router.navigate([
        "/chat/chat-room",
        chat.team_id,
        chat.team_member_id
      ]);
    }
  }

  getChatDate(date) {
    let params = {
      date: date,
      type: "list"
    };
    return this.chatService.getDate(params);
  }

  getChatName(chat) {
    var chatName = chat.name;
    if (chat.is_team && chat.participants_only) {
      chatName = chat.team_name;
    } else if (chat.is_team && !chat.participants_only) {
      chatName = chat.team_name + " + Mentor";
    }
    return chatName;
  }
}
