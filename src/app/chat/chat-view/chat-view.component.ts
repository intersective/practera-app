import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { UtilsService } from '@services/utils.service';
import { RouterEnter } from '@services/router-enter.service';

@Component({
  selector: 'app-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls: ['./chat-view.component.scss']
})
export class ChatViewComponent extends RouterEnter {

  routeUrl = '/app/chat';
  teamMemberId: Number;
  participantsOnly: boolean;
  teamId: Number;
  chatName: string;

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
    this.teamMemberId = null;
    this.participantsOnly = null;
    this.teamId = null;
    this.chatName = null;
  }

  goto(event) {
    this.teamId = event.teamId;
    this.teamMemberId = event.teamMemberId ? event.teamMemberId : null;
    this.participantsOnly = event.participantsOnly ? event.participantsOnly : false;
    this.chatName = event.chatName;
    setTimeout(() => {
      this.chatRoom.onEnter();
    });
  }

  getCurrentChat() {
    return {
      teamId: this.teamId,
      chatName: this.chatName,
      teamMemberId: this.teamMemberId,
      participantsOnly: this.participantsOnly
    };
  }

  /**
   * this method call when chat-list component finished loading chat objects.
   * from this method we loading first chat to chat room component.
   * @param chats chat list Array
   * if we have teamId we are not doing any thing, that means we have already load first chat.
   * if we didn't have teamId we will goto() method by passing first chat channel data. to load chat.
   */
  selectFirstChat(chats) {
    if (this.teamId) {
      return;
    }
    // navigate to the first chat
    this.goto({
      teamId: chats[0].team_id,
      teamMemberId: chats[0].team_member_id,
      participantsOnly: chats[0].participants_only,
      chatName: chats[0].name
    });
  }

}
