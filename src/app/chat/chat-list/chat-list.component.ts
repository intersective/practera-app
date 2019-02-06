import { Component, OnInit } from "@angular/core";
import { Router, NavigationExtras } from "@angular/router";
import { BrowserStorageService } from "@services/storage.service";
import { RouterEnter } from "@services/router-enter.service";
import { UtilsService } from "@services/utils.service";

import { ChatService, ChatListObject } from "../chat.service";

@Component({
  selector: "app-chat",
  templateUrl: "chat-list.component.html",
  styleUrls: ["chat-list.component.scss"]
})
export class ChatListComponent extends RouterEnter {
  routeUrl = '/app/chat';
  chatList: Array<ChatListObject>;
  haveMoreTeam: boolean;
  loadingChatList: boolean = true;

  constructor(
    private chatService: ChatService,
    public router: Router,
    public storage: BrowserStorageService,
    public utils: UtilsService,
  ) {
    super(router);
    let role = this.storage.getUser().role;
    this.utils.getEvent('team-message').subscribe(event => {
      this._loadChatData();
    });
    if (role !== 'mentor') {
      this.utils.getEvent('team-no-mentor-message').subscribe(event => {
        this._loadChatData();
      });
    }
  }

  onEnter() {
    this._initialise();
    this._loadChatData();
  }

  private _initialise() {
    this.haveMoreTeam = false;
    this.loadingChatList = true;
  }

  private _loadChatData(): void {
    this.chatService.getchatList().subscribe(chats => {
      this.chatList = chats;
      this._checkHaveMoreTeam();
    });
  }

  /**
   * this method check is this user in multiple teams.
   */
  private _checkHaveMoreTeam(): void {
    if (this.chatList.length > 0) {
      let myRole = this.storage.getUser().role;
      let index = 0;
      let teamCount = 0;
      for (index = 0; index < this.chatList.length; index++) {
        if (this.chatList[index].is_team) {
          if (myRole === "mentor" || !this.chatList[index].participants_only) {
            teamCount++;
          }
        }
      }
      if (teamCount > 1) {
        this.haveMoreTeam = true;
      } else {
        this.haveMoreTeam = false;
      }
      this.loadingChatList = false;
    }
  }

  getChatAvatarText(chatName) {
    return this.chatService.generateChatAvatarText(chatName);
  }
  navigateToChatRoom(chat) {
    if (chat.is_team) {
      this.router.navigate([
        "chat",
        "chat-room",
        "team",
        chat.team_id,
        chat.participants_only
      ]);
    } else {
      if (chat.last_message_created) {
        this.router.navigate([
          "chat",
          "chat-room",
          chat.team_id,
          chat.team_member_id
        ]);
      } else {
        this.router.navigate([
          "chat",
          "chat-room",
          chat.team_id,
          chat.team_member_id,
          {
            name: chat.name
          }
        ]);
      }
    }
  }

  getChatDate(date) {
    return this.utils.timeFormatter(date);
  }
}
