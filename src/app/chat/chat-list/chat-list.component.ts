import { Component, Output, EventEmitter, NgZone, Input } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { BrowserStorageService } from '@services/storage.service';
import { RouterEnter } from '@services/router-enter.service';
import { UtilsService } from '@services/utils.service';
import { FastFeedbackService } from '../../fast-feedback/fast-feedback.service';
import { ChatService, ChatListObject } from '../chat.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';

@Component({
  selector: 'app-chat-list',
  templateUrl: 'chat-list.component.html',
  styleUrls: ['chat-list.component.scss']
})
export class ChatListComponent {
  @Output() navigate = new EventEmitter();
  @Output() chatListReady = new EventEmitter();
  @Input() currentChat = {};
  chatList: Array<ChatListObject>;
  haveMoreTeam: boolean;
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

    const role = this.storage.getUser().role;
    this.utils.getEvent('team-message').subscribe(event => {
      this._loadChatData();
    });
    if (role !== 'mentor') {
      this.utils.getEvent('team-no-mentor-message').subscribe(event => {
        this._loadChatData();
      });
    }
    if (!this.utils.isMobile()) {
      this.utils.getEvent('chat-badge-update').subscribe(event => {
        const chatIndex = this.chatList.findIndex((data, index) => {
          return (event.teamID === data.team_id) &&
          (event.teamMemberId === data.team_member_id) &&
          (event.chatName === data.name) &&
          (event.participantsOnly === data.participants_only);
        });
        if (chatIndex > -1) {
          // set time out because when this calling from pusher events it need a time out.
          setTimeout(() => {
            this.chatList[chatIndex].unread_messages -= event.readcount;
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
    this.haveMoreTeam = false;
    this.loadingChatList = true;
    this.chatList = new Array();
  }

  private _loadChatData(): void {
    this.chatService.getchatList().subscribe(chats => {
      this.chatList = chats;
      this._checkHaveMoreTeam();
      this.chatListReady.emit(this.chatList);
    });
  }

  /**
   * this method check is this user in multiple teams.
   */
  private _checkHaveMoreTeam(): void {
    if (this.chatList.length > 0) {
      const myRole = this.storage.getUser().role;
      let index = 0;
      let teamCount = 0;
      for (index = 0; index < this.chatList.length; index++) {
        if (this.chatList[index].is_team) {
          if (myRole === 'mentor' || !this.chatList[index].participants_only) {
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

  // force every navigation happen under radar of angular
  private _navigate(direction) {
    if (this.utils.isMobile()) {
      // redirect to chat room page for mobile
      return this.ngZone.run(() => {
        return this.router.navigate(direction);
      });
    } else {
      // emit event to parent component(chat view component)
      if (direction[2] === 'team') {
        this.navigate.emit({
          teamId: direction[3],
          participantsOnly: direction[4],
          chatName: direction[5] ? direction[5].name : null
        });
        return;
      } else {
        this.navigate.emit({
          teamId: direction[2],
          teamMemberId: direction[3],
          chatName: direction[4] ? direction[4].name : null
        });
        return;
      }
    }
  }

  navigateToChatRoom(chat) {
    this.newrelic.addPageAction('selected chat room', {
      isTeam: chat.is_team,
      raw: chat,
    });

    if (chat.is_team) {
      this._navigate([
        'chat',
        'chat-room',
        'team',
        chat.team_id,
        chat.participants_only,
        {
          name: chat.name
        }
      ]);
    } else {
      this._navigate([
        'chat',
        'chat-room',
        chat.team_id,
        chat.team_member_id,
        {
          name: chat.name
        }
      ]);
    }
  }

  getChatDate(date) {
    return this.utils.timeFormatter(date);
  }

}
