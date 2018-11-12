import { Component, OnInit } from "@angular/core";
import { NavController } from "@ionic/angular";
import { Storage } from "@ionic/storage";

import { ChatService } from "./chat.service";

@Component({
  selector: "app-chat",
  templateUrl: "chat.component.html",
  styleUrls: ["chat.component.scss"]
})
export class ChatComponent implements OnInit {
  // @TODO need to create method to convert chat time to local time.
  chatList: any[];
  haveMoreTeam:Boolean;
  private chatColors:any[];
  private colorArray = [];

  constructor(private chatService: ChatService, private navCtrl: NavController, private storage: Storage) {
  }

  ngOnInit() {
    this.haveMoreTeam = false;
    this.loadChatData();
  }

  loadChatData():void {
    this.chatService.getchatList().subscribe(response => {
      this.updateChatListResponse(response);
    });
  }

  /**
   * modify the response 
   *  - set chat avatar color
   * @param {Array} response 
   */
  private updateChatListResponse(response):void {
    if ((response)) {
      this.chatList = [];
      // let chatColors = this.chatService.getChatAvatarColors();
      if ((!this.chatColors)) {
        this.setChatAvatarColors(response, null, 'nocolor');
      } else {
        this.setChatAvatarColors(response, this.chatColors, 'havecolor');
      }
      this.checkHaveMoreTeam(response);
    }
  }

  /**
   * this method check old avatar colors and set the releted one.
   * if there no old avatar colors it will create new color and add that to service variable.
   * @param {Array} response 
   * @param {Array} chatColors 
   * @param {String} status 
   */
  private setChatAvatarColors(response, chatColors, status):void {
    let index = 0;
    for (index = 0; index < response.length; index++) {
      if ((response[index])) {
        switch (status) {
          case "nocolor":
            response[index].chat_color = this.chatService.getRandomColor();
            this.colorArray.push({
              team_member_id: response[index].team_member_id,
              name: response[index].name,
              chat_color: response[index].chat_color
            });
            break;
          case "havecolor":
            let colorObject = chatColors.find(function(chat) {
              return chat.team_member_id === response[index].team_member_id;
            });
            if ((colorObject)) {
              response[index].chat_color = colorObject.chat_color;
            } else {
              response[index].chat_color = this.chatService.getRandomColor();
            }
            break;
        }
        this.chatList.push(response[index]);
      }
    }
    if ((this.colorArray.length > 0)) {
      this.storage.set('chatAvatarColors', this.colorArray);
    }
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
    this.navCtrl.navigateForward('/chat/chat-room');
  }
}
