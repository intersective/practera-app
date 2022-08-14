import { Component, ViewChild, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { UtilsService } from '@v3/services/utils.service';
import { ChatChannel } from '@v3/services/chat.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls: ['./chat-view.component.scss']
})
export class ChatViewComponent implements OnInit {
  routeUrl = '/app/chat';
  chatChannel: ChatChannel;
  loadInfo: boolean;

  @ViewChild('chatList') chatList;
  @ViewChild('chatRoom') chatRoom;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    public utils: UtilsService,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this._initialise();
      setTimeout(() => {
        this.chatList.onEnter();
      });
    });
  }

  private _initialise() {
    this.chatChannel = null;
    this.loadInfo = false;
  }

  // navigate to a chat-room (on desktop only)
  desktopGoto(event, action?: {click: boolean}) {
    this.loadInfo = false;
    this.chatChannel = event;
    if (action?.click) {
      setTimeout(() => {
        this.chatRoom.ngOnInit();

        const chatroomEl = this.document.getElementById('chatroom');
        if (chatroomEl) {
          chatroomEl.focus();
        }
      });
    }
  }

  /**
   * this method call when chat-list component finished loading chat objects.
   * from this method we loading first chat to chat room component.
   * @param chats chat list array
   */
  selectFirstChat(chats) {
    if (this.chatChannel) {
      return;
    }
    // navigate to the first chat
    this.desktopGoto(chats[0]);
  }

  loadchannelInfo(event) {
    this.loadInfo = true;
  }

}
