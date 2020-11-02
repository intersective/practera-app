import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { UtilsService } from '@services/utils.service';
import { RouterEnter } from '@services/router-enter.service';
import { ChatChannel } from '../chat.service';

@Component({
  selector: 'app-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls: ['./chat-view.component.scss']
})
export class ChatViewComponent extends RouterEnter {
  routeUrl = '/app/chat';
  chatChannel: ChatChannel;
  loadInfo: boolean;

  @ViewChild('chatList') chatList;
  @ViewChild('chatRoom') chatRoom;

  constructor(
    public router: Router,
    public utils: UtilsService
  ) {
    super(router);
  }

  onEnter() {
    this._initialise();
    setTimeout(() => {
      this.chatList.onEnter();
    });
  }

  private _initialise() {
    this.chatChannel = null;
    this.loadInfo = false;
  }

  goto(event) {
    this.loadInfo = false;
    this.chatChannel = event;
    setTimeout(() => {
      this.chatRoom.onEnter();
    });
  }

  /**
   * this method call when chat-list component finished loading chat objects.
   * from this method we loading first chat to chat room component.
   * @param chats chat list array
   */
  selectFirstChat(chats) {
    if (this.chatChannel) {
      return ;
    }
    // navigate to the first chat
    this.goto(chats[0]);
  }

  loadchannelInfo(event) {
    this.loadInfo = true;
  }

}
