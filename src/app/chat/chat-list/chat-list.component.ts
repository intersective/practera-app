import { Component, OnInit } from "@angular/core";
import { Router, NavigationExtras } from "@angular/router";
import { BrowserStorageService } from "@services/storage.service";
import { RouterEnter } from "@services/router-enter.service";
import { UtilsService } from "../../services/utils.service";

import { ChatService } from "../chat.service";

export interface Chat {
  team_id: number;
  team_name: string;
  team_member_id?: number;
  name: string;
  role?: string;
  unread_messages?: number;
  last_message_created?: string;
  last_message?: string;
  is_team: boolean;
  participants_only: boolean;
  chat_color?: string;
}

@Component({
  selector: "app-chat",
  templateUrl: "chat-list.component.html",
  styleUrls: ["chat-list.component.scss"]
})
export class ChatListComponent extends RouterEnter {
  // @TODO need to create method to convert chat time to local time.
  chatList: Array<Chat>;
  haveMoreTeam: boolean;
  loadingChatList: boolean = true;

  constructor(
    private chatService: ChatService,
    public router: Router,
    public storage: BrowserStorageService,
    public utils: UtilsService
  ) {
    super(router, utils, storage);
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
    this.chatService.getchatList().subscribe(response => {
      this.chatList = response;
      this._checkHaveMoreTeam();
    });
  }

  /**
   * this method check is this user in multiple teams.
   * @param {Array} response
   */
  private _checkHaveMoreTeam(): void {
    if (this.chatList.length > 0) {
      let index = 0;
      let teamCount = 0;
      for (index = 0; index < this.chatList.length; index++) {
        if (this.chatList[index].is_team) {
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
  }

  getChatAvatarText(chatName) {
    return this.chatService.generateChatAvatarText(chatName);
  }
  navigateToChatRoom(chat) {
    if (chat.is_team) {
      this.router.navigate([
        "/chat/chat-room/team",
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
