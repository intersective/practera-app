import { Component, Output, EventEmitter, NgZone, Input } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { FastFeedbackService } from '@v3/services/fast-feedback.service';
import { ChatService, ChatChannel } from '@v3/services/chat.service';
import { PusherService } from '@v3/services/pusher.service';

/**
 * this is an app chat list component
 */
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
    private ngZone: NgZone,
    public pusherService: PusherService
  ) {
    this.utils.getEvent('chat:new-message').subscribe(event => this._loadChatData());
    this.utils.getEvent('chat:info-update').subscribe(event => this._loadChatData());
    if (!this.utils.isMobile()) {
      this.utils.getEvent('chat-badge-update').subscribe(event => {
        const chatIndex = this.chatList.findIndex(data => data.uuid === event.channelUuid);
        if (chatIndex > -1) {
          // set time out because when this calling from pusher events it need a time out.
          setTimeout(() => {
            this.chatList[chatIndex].unreadMessageCount -= event.readcount;
            if (this.chatList[chatIndex].unreadMessageCount < 0) {
              this.chatList[chatIndex].unreadMessageCount = 0;
            }
          });
        }
      });
    }
  }

  /**
    * This is an on enter method
    * @returns nothing
    */
  onEnter() {
    this._initialise();
    this._checkAndSubscribePusherChannels();
    this._loadChatData();
    this.fastFeedbackService.pullFastFeedback().subscribe();
  }

  /**
    * This is an _initialise method
    * @returns nothing
    */
  private _initialise() {
    this.loadingChatList = true;
    this.chatList = [];
  }

  /**
    * This is a private load chat data method
    * @returns nothing
    */
  private _loadChatData(): void {
    this.chatService.getChatList().subscribe(chats => {
      this.chatList = chats;
      this.loadingChatList = false;
      this.chatListReady.emit(this.chatList);
    });
  }

  /**
   * This method pusher service to subscribe to chat pusher channels
   * - first it call chat service to get pusher channels.
   * - then it call pusher service 'subscribeChannel' method to subscribe.
   * - in pusher service it chaeck if we alrady subscribe or not.
   *   if not it will subscribe to the pusher channel.
   */
  private _checkAndSubscribePusherChannels() {
    this.chatService.getPusherChannels().subscribe(pusherChannels => {
      pusherChannels.forEach(channel => {
        this.pusherService.subscribeChannel('chat', channel.pusherChannel);
      });
    });
  }

  goToChatRoom(chat: ChatChannel, keyboardEvent?: KeyboardEvent) {
    if (keyboardEvent && (keyboardEvent?.code === 'Space' || keyboardEvent?.code === 'Enter')) {
      keyboardEvent.preventDefault();
    } else if (keyboardEvent) {
      return;
    }

    this._navigate(
      [
        'v3',
        'messages',
        'chat-room'
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

  /**
    * This is a method to transform a date object of a chate message
    * @returns string formate of a date object
    */
  getChatDate(date) {
    return this.utils.timeFormatter(date);
  }

}
