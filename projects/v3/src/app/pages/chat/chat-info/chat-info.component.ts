import { Component, Output, EventEmitter, NgZone, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { ChatService, ChatChannel, ChannelMembers } from '@v3/services/chat.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-chat-info',
  templateUrl: 'chat-info.component.html',
  styleUrls: ['chat-info.component.scss']
})
export class ChatInfoComponent implements OnInit {

  @Input() selectedChat: ChatChannel;
  @Output() navigate = new EventEmitter();
  channelName: string;
  enableSave: boolean;
  // channel member list
  memberList: ChannelMembers[] = [];
  loadingMembers: boolean;

  constructor(
    private chatService: ChatService,
    public router: Router,
    private route: ActivatedRoute,
    public storage: BrowserStorageService,
    public utils: UtilsService,
    public modalController: ModalController
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this._initialise();
      this._loadMembers();
    });
  }

  private _initialise() {
    this.memberList = [];
    this.loadingMembers = false;
    this.channelName = this.selectedChat.name;
    this.enableSave = false;
  }

  private _loadMembers() {
    this.loadingMembers = true;
    this.chatService.getChatMembers(this.selectedChat.uuid).subscribe(
      (response) => {
        this.loadingMembers = false;
        if (response.length === 0) {
          return;
        }
        this.memberList = response;
      },
      error => {
        this.loadingMembers = false;
      }
    );
  }

  close(event) {
    if (event && (event?.code === 'Space' || event?.code === 'Enter')) {
      event.preventDefault();
    } else if (event) {
      return;
    }

    if (!this.utils.isMobile()) {
      this.navigate.emit(this.selectedChat);
    } else {
      this.modalController.dismiss({
        channelName: this.channelName
      });
    }
  }
}
