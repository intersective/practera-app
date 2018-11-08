import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  // chat object select to chat
  private selectedChat:any;

  constructor() { }


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

  // set chat object for chat
  setSelectedChat(chatObject) {
    this.selectedChat = chatObject;
  }

  // get selected chat object for chat
  getSelectedChat():any {
    return this.selectedChat;
  }

}
