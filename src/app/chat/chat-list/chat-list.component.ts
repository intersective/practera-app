import { Component, Output, EventEmitter, NgZone, Input } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { BrowserStorageService } from '@services/storage.service';
import { RouterEnter } from '@services/router-enter.service';
import { UtilsService } from '@services/utils.service';
import { FastFeedbackService } from '../../fast-feedback/fast-feedback.service';
import { ChatService, ChatChannel } from '../chat.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';

@Component({
  selector: 'app-chat-list',
  templateUrl: 'chat-list.component.html',
  styleUrls: ['chat-list.component.scss']
})
export class ChatListComponent {
  @Output() navigate = new EventEmitter();
  @Output() chatListReady = new EventEmitter();
  @Input() currentChat: ChatChannel;
  chatList: ChatChannel[];
  loadingChatList = true;

  constructor(
    private chatService: ChatService,
    public router: Router,
    public storage: BrowserStorageService,
    public utils: UtilsService,
    public fastFeedbackService: FastFeedbackService,
    private newrelic: NewRelicService,
    private ngZone: NgZone
  ) {
    this.newrelic.setPageViewName('Chat list');
    this.utils.getEvent('chat:new-message').subscribe(event => this._loadChatData());
    if (!this.utils.isMobile()) {
      this.utils.getEvent('chat-badge-update').subscribe(event => {
        const chatIndex = this.chatList.findIndex(data => data.channelId == event.channelId);
        if (chatIndex > -1) {
          // set time out because when this calling from pusher events it need a time out.
          setTimeout(() => {
            this.chatList[chatIndex].unreadMessages -= event.readcount;
            if (this.chatList[chatIndex].unreadMessages < 0) {
              this.chatList[chatIndex].unreadMessages = 0;
            }
          });
        }
      });
    }
  }

  onEnter() {
    this._initialise();
    this._loadChatData();
    this.fastFeedbackService.pullFastFeedback().subscribe();
  }

  private _initialise() {
    this.loadingChatList = true;
    this.chatList = [];
  }

  private _loadChatData(): void {
    this.chatService.getChatList().subscribe(chats => {
      this.chatList = chats;
      this.loadingChatList = false;
      this.chatListReady.emit(this.chatList);
    });
  }

  goToChatRoom(chat: ChatChannel) {
    this.newrelic.addPageAction('selected chat room', {
      channelId: chat.channelId,
      chat: chat,
    });
    this._navigate(
      [
        'chat',
        'chat-room',
        chat.channelId
      ],
      chat
    );
  }

  // navigation logic depends on the platform/screen size
  private _navigate(direction, chatChannel) {
    if (this.utils.isMobile()) {
      this.storage.setCurrentChatChannel(chatChannel);
      // redirect to chat room page for mobile
      return this.ngZone.run(() => {
        return this.router.navigate(direction);
      });
    }
    // emit chatChannel to parent component(chat view component)
    this.navigate.emit(chatChannel);
  }

  getChatDate(date) {
    return this.utils.timeFormatter(date);
  }

}
