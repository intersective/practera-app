import { Component, Output, EventEmitter, NgZone, Input, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { BrowserStorageService } from '@services/storage.service';
import { UtilsService } from '@services/utils.service';
import { ChatService, ChatChannel, ChannelMembers } from '@app/chat/chat.service';
import { ModalController } from '@ionic/angular';
import { NotificationService } from '@shared/notification/notification.service';

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
    public storage: BrowserStorageService,
    public utils: UtilsService,
    public modalController: ModalController,
    private notification: NotificationService
  ) {}

  ngOnInit() {
    this._initialise();
    this._loadMembers();
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

  close() {
    if (!this.utils.isMobile()) {
      this.navigate.emit(this.selectedChat);
    } else {
      this.modalController.dismiss({
        channelName: this.channelName
      });
    }
  }
}
