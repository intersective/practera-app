import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { BrowserStorageService } from '@services/storage.service';

import { ChatService } from '../chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: 'chat-list.component.html',
  styleUrls: ['chat-list.component.scss']
})
export class ChatListComponent implements OnInit {
  // @TODO need to create method to convert chat time to local time.
  chatList: any[];
  haveMoreTeam:Boolean;
  private chatColors:any[];
  private colorArray = [];

  constructor(private chatService: ChatService, private router: Router, private storage: BrowserStorageService) {
  }

  ngOnInit() {
    this.haveMoreTeam = false;
    this.loadChatData();
  }

  loadChatData():void {
    this.chatService.getchatList().subscribe(response => {
      this.chatList = response;
      this.checkHaveMoreTeam(response);
    });
  }

  /**
   * this method check is this user in multiple teams.
   * @param {Array} response 
   */
  private checkHaveMoreTeam(response):void {
    let index = 0;
    let teamCount = 0;
    for (index = 0; index < response.length; index++) {
      if ((response[index].is_team)) {
        teamCount++;
      }
    }
    if ((teamCount > 1)) {
      this.haveMoreTeam = true;
    } else {
      this.haveMoreTeam = false;
    }
  }

  getChatAvatarText(chatName) {
    return this.chatService.generateChatAvatarText(chatName);
  }

  navigateToChatRoom(chat) {
    this.storage.set('selectedChatObject', chat);

    const extra: NavigationExtras = {
      queryParams: { chat },
    };
    this.router.navigate(['/chat/chatroom'],{ queryParams: {selectedChat: chat} });
  }

  getChatDate(date) {
    let params = {
      date: date,
      type: 'list'
    }
    return this.chatService.getDate(params);
  }
}