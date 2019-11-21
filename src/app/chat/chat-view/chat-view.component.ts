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

  teamMemberId?: Number;
  participantsOnly?: boolean;
  teamId: Number;
  chatName?: string;

  @ViewChild('chatList') chatList;
  @ViewChild('chatRoom') chatRoom;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    public utils: UtilsService
  ) {
    super(router);
  }

  onEnter() {
    // this.activityId = +this.route.snapshot.paramMap.get('id');
    // trigger onEnter after the element get generated
    setTimeout(() => {
      this.chatList.onEnter();
    });
  }

  goto(event) {
    this.teamId = event.teamId;
    this.teamMemberId = event.teamMemberId;
    this.participantsOnly = event.participantsOnly;
    this.chatName = event.chatName;
    setTimeout(() => {
      this.chatRoom.onEnter();
    });
  }

}
