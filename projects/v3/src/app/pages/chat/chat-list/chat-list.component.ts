import { ChangeDetectorRef, Component, Output, EventEmitter, NgZone, Input, OnDestroy } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { ChatService, ChatChannel } from '@v3/services/chat.service';
import { PusherService } from '@v3/services/pusher.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * this is an app chat list component
 */
@Component({
  standalone: false,
  selector: 'app-chat-list',
  templateUrl: 'chat-list.component.html',
  styleUrls: ['chat-list.component.scss']
})
export class ChatListComponent implements OnDestroy {
  @Output() navigate = new EventEmitter();
  @Output() chatListReady = new EventEmitter();
  @Input() currentChat: ChatChannel;
  chatList: ChatChannel[];
  loadingChatList = true;
  isMobile: boolean = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    public utils: UtilsService,
    private chatService: ChatService,
    private router: Router,
    private storage: BrowserStorageService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private pusherService: PusherService
  ) {
    this.isMobile = this.utils.isMobile();
    this.utils.getEvent('chat:new-message')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this._loadChatData());
    this.utils.getEvent('chat:delete-message')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this._loadChatData());
    this.utils.getEvent('chat:edit-message')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this._loadChatData());
    this.utils.getEvent('chat:info-update')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this._loadChatData());
    if (!this.isMobile) {
      this.utils.getEvent('chat-badge-update')
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        const chatIndex = this.chatList.findIndex(data => data.uuid === event.channelUuid);
        if (chatIndex > -1) {
          setTimeout(() => {
            this.ngZone.run(() => {
              this.chatList[chatIndex].unreadMessageCount -= event.readcount;
              if (this.chatList[chatIndex].unreadMessageCount < 0) {
                this.chatList[chatIndex].unreadMessageCount = 0;
              }
              this.cdr.markForCheck();
            });
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
    this.pusherService.refreshChatChannels().catch(err => {
      console.error('Failed to refresh chat Pusher channels', err);
    });
    this._loadChatData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    this.chatService.getChatList()
      .pipe(takeUntil(this.destroy$))
      .subscribe(chats => {
        this.ngZone.run(() => {
          this.chatList = chats;
          this.loadingChatList = false;
          this.cdr.markForCheck();
        });
        this.chatListReady.emit(this.chatList);
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
  private _navigate(direction, chatChannel: ChatChannel) {
    if (this.isMobile) {
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
