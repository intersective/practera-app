import { Component, Input, ViewChild, NgZone, ElementRef, Output, EventEmitter, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonContent, ModalController } from '@ionic/angular';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { PusherService } from '@v3/services/pusher.service';
import { FilestackService } from '@v3/services/filestack.service';
import { ChatService, ChatChannel, Message, MessageListResult, ChannelMembers } from '@v3/services/chat.service';
import { ChatPreviewComponent } from '../chat-preview/chat-preview.component';
import { ChatInfoComponent } from '../chat-info/chat-info.component';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent implements OnInit {
  @ViewChild(IonContent) content: IonContent;
  @Input() chatChannel?: ChatChannel = {
    uuid: '',
    name: '',
    avatar: '',
    pusherChannel: '',
    isAnnouncement: false,
    isDirectMessage: false,
    readonly: false,
    roles: [],
    unreadMessageCount: 0,
    lastMessage: '',
    lastMessageCreated: '',
    canEdit: false
  };
  @Output() loadInfo = new EventEmitter();

  routeUrl = '/chat/chat-room';
  channelUuid: string;
  // message history list
  messageList: Message[] = [];
  // channel member list
  memberList: ChannelMembers[] = [];
  // the message that the current user is typing
  typingMessage: string;
  messagePageCursor = '';
  messagePageSize = 20;
  loadingChatMessages = false;
  sendingMessage = false;
  // display "someone is typing" when received a typing event
  whoIsTyping: string;
  // this use to show/hide bottom section of text field which have attachment buttons and send button, when user start typing text messages
  showBottomAttachmentButtons = false;
  videoHandles = [];

  constructor(
    private chatService: ChatService,
    private router: Router,
    private storage: BrowserStorageService,
    public utils: UtilsService,
    private pusherService: PusherService,
    private filestackService: FilestackService,
    private modalController: ModalController,
    private ngZone: NgZone,
    public element: ElementRef,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
    this.utils.getEvent('chat:new-message').subscribe(event => {
      if (this._isValidPusherEvent(event)) {
        const receivedMessage = this.getMessageFromEvent(event);

        if (receivedMessage && receivedMessage.file) {
          let fileObject = null;
          fileObject = JSON.parse(receivedMessage.file);
          if (this.utils.isEmpty(fileObject)) {
            fileObject = null;
          }
          receivedMessage.fileObject = fileObject;
          receivedMessage.preview = this.attachmentPreview(receivedMessage.fileObject);
        }
        if (receivedMessage.senderUuid &&
          this.storage.getUser().uuid &&
          receivedMessage.senderUuid === this.storage.getUser().uuid
        ) {
          receivedMessage.isSender = true;
        }
        if (!this.utils.isEmpty(receivedMessage)) {
          this.messageList.push(receivedMessage);
          this._markAsSeen();
          this._scrollToBottom();
        }
      }
    });
    this.utils.getEvent('chat:delete-message').subscribe(event => {
      if (this._isValidPusherEvent(event)) {
        const deletedMessageIndex = this.messageList.findIndex(message => {
          return message.uuid === event.uuid;
        });
        if (deletedMessageIndex > -1) {
          this.messageList.splice(deletedMessageIndex, 1);
        }
      }
    });
    this.utils.getEvent('chat:edit-message').subscribe(event => {
      if (this._isValidPusherEvent(event)) {
        const receivedMessage = this.getMessageFromEvent(event);

        const editedMessageIndex = this.messageList.findIndex(message => {
          return message.uuid === event.uuid;
        });
        if (editedMessageIndex > -1 && !this.utils.isEmpty(receivedMessage)) {
          this.messageList[editedMessageIndex] = receivedMessage;
        }
      }
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this._initialise();
      this._subscribeToTypingEvent();
      this._loadMessages();
      this._loadMembers();
      this._scrollToBottom();
    });
  }

  private _initialise() {
    this.typingMessage = '';
    this.messageList = [];
    this.loadingChatMessages = false;
    this.messagePageCursor = '';
    this.messagePageSize = 20;
    this.sendingMessage = false;
    this.whoIsTyping = '';
    this.showBottomAttachmentButtons = false;
  }

  private _isValidPusherEvent(pusherData) {
    if (!this.utils.isMobile() && (this.router.url !== '/v3/messages')) {
      return false;
    }
    if (this.utils.isMobile() && (this.router.url !== '/v3/messages/chat-room')) {
      return false;
    }
    if (pusherData.channelUuid !== this.channelUuid) {
      return false;
    }
    return true;
  }

  private _subscribeToTypingEvent() {
    if (this.utils.isMobile()) {
      this.chatChannel = this.storage.getCurrentChatChannel();
    }
    this.channelUuid = this.chatChannel.uuid;
    // subscribe to typing event
    this.utils.getEvent('typing-' + this.chatChannel.pusherChannel).subscribe(event => this._showTyping(event));
  }

  /**
   * @description listen to pusher event for new message
   */
  getMessageFromEvent(data): Message {
    return {
      uuid: data.uuid,
      senderName: data.senderName,
      senderRole: data.senderRole,
      senderAvatar: data.senderAvatar,
      senderUuid: data.senderUuid,
      isSender: false,
      message: data.message,
      created: data.created,
      file: data.file,
      channelUuid: data.channelUuid,
      sentAt: data.sentAt
    };
  }

  private _loadMembers() {
    this.chatService.getChatMembers(this.channelUuid).subscribe(
      (response) => {
        if (response.length === 0) {
          return;
        }
        this.memberList = response;
      },
      error => {
        console.error(error);
      }
    );
  }

  private _loadMessages() {
    // if one chat request send to the api. not calling other one.
    // because in some cases second api call respose return before first one.
    // then messages getting mixed.
    if (this.loadingChatMessages) {
      return;
    }

    this.loadingChatMessages = true;

    this.chatService.getMessageList({
      channelUuid: this.channelUuid,
      cursor: this.messagePageCursor,
      size: this.messagePageSize
    })
    .subscribe(
      (messageListResult: MessageListResult) => {
        if (!messageListResult) {
          this.loadingChatMessages = false;
          return;
        }
        let messages = messageListResult.messages;
        if (messages.length === 0) {
          this.loadingChatMessages = false;
          return;
        }
        this.messagePageCursor = messageListResult.cursor;
        this.loadingChatMessages = false;
        messages = messages.map(msg => {
          if (msg.file && msg.fileObject) {
            msg.preview = this.attachmentPreview(msg.fileObject);
          }
          return msg;
        });
        messages.reverse();
        if (this.messageList.length > 0) {
          this.messageList = messages.concat(this.messageList);
        } else {
          this.messageList = messages;
          this._scrollToBottom();
        }

        this._markAsSeen();
      },
      error => {
        console.error('Error', error);
        this.loadingChatMessages = false;
      }
    );
  }

  loadMoreMessages(event) {
    const scrollTopPosition = event.detail.scrollTop;
    if (scrollTopPosition === 0) {
      this._loadMessages();
    }
  }

  back() {
    return this.ngZone.run(() => this.router.navigate(['v3', 'messages']));
  }

  sendMessage() {
    if (!this.typingMessage) {
      return;
    }
    const message = this.typingMessage;
    this._beforeSenMessages();
    this.chatService.postNewMessage({
      channelUuid: this.channelUuid,
      message: message
    }).subscribe(
      response => {
        this.pusherService.triggerSendMessage(this.chatChannel.pusherChannel, {
          channelUuid: this.channelUuid,
          uuid: response.uuid,
          isSender: response.isSender,
          message: response.message,
          file: response.file,
          created: response.created,
          senderUuid: response.senderUuid,
          senderName: response.senderName,
          senderRole: response.senderRole,
          senderAvatar: response.senderAvatar,
          sentAt: response.sentAt
        });
        this.messageList.push(
          {
            uuid: response.uuid,
            isSender: response.isSender,
            message: response.message,
            file: response.file,
            created: response.created,
            senderUuid: response.senderUuid,
            senderName: response.senderName,
            senderRole: response.senderRole,
            senderAvatar: response.senderAvatar,
            sentAt: response.sentAt
          }
        );
        this.utils.broadcastEvent('chat:info-update', true);
        this._scrollToBottom();
        this._afterSendMessage();
      },
      error => {
        this._afterSendMessage();
      }
    );
  }

  /**
   * need to clear type message before send api call.
   * because if we wait untill api response to clear the type message user may think message not sent and
   *  will press send button multiple times.
   * to indicate message sending we have loading controll by sendingMessage.
   * we will insert type message to cost variable befoer clear it so type message will not lost from the api call.
   */
  private _beforeSenMessages() {
    this.sendingMessage = true;
    // remove typed message from text area and shrink text area.
    this.typingMessage = '';
    this.element.nativeElement.querySelector('textarea').style.height = 'auto';
  }

  private _afterSendMessage() {
    this.sendingMessage = false;
    this.showBottomAttachmentButtons = false;
    /**
     * if there are no previous messages message page cursor is empty.
     * after user start sending message, if page cursor is empty we need to set cursor.
     * if we didn't do that when user scroll message list api call with page cursor empty and load same messages again.
     * only way we can get cursor is from API. so calling message list in background to get cursor.
     */
    if (this.messageList.length > 0 && this.utils.isEmpty(this.messagePageCursor)) {
      this.chatService
        .getMessageList({
          channelUuid: this.channelUuid,
          cursor: this.messagePageCursor,
          size: this.messagePageSize
        })
        .subscribe((messageListResult: MessageListResult) => {
          const messages = messageListResult.messages;
          if (messages.length === 0) {
            this.messagePageCursor = '';
            return;
          }
          this.messagePageCursor = messageListResult.cursor;
        });
    }
  }

  // call chat api to mark message as seen messages
  private _markAsSeen() {
    const messageIds = this.messageList.map(m => m.uuid);
    this.chatService
      .markMessagesAsSeen(messageIds)
      .subscribe(
        res => {
          if (!this.utils.isMobile()) {
            this.utils.broadcastEvent('chat-badge-update', {
              channelUuid: this.chatChannel.uuid,
              readcount: messageIds.length
            });
          }
        },
        err => { }
      );
  }

  getMessageDate(date) {
    return this.utils.timeFormatter(date);
  }

  /**
   * this method will return correct css class for chat avatar to adjust view
   * @param message message object
   * - if selected chat is a team chat and we are not showing time with this message.
   *  - return 'no-time-team' css class. it will add 'margin-top: -8%' to avatar.
   * - if selected chat is not a team and we are not showing time with this message.
   *  - return 'no-time' css class. it will add 'margin-top: 8%' to avatar.
   * - if user not in mobile platform and selected chat is a team and we are showing time with this message.
   *  - return 'with-time-team' css class. it will add 'margin-top: 0' to avatar.
   * - if these conditions not complete
   *  - return empty srting.
   */
  getAvatarClass(message) {
    if (!this.checkToShowMessageTime(message)) {
      return 'no-time';
    }
    return '';
  }

  /**
   * check same user have messages inline
   * @param {int} incomingMessage
   */
  isLastMessage(incomingMessage) {
    // const index = this.messageList.indexOf(message);
    const index = this.messageList.findIndex(function (msg, i) {
      return msg.uuid === incomingMessage.uuid;
    });

    // no need avatar if uuid not match
    if (index === -1) {
      this.messageList[index].noAvatar = true;
      return false;
    }

    const currentMessage = this.messageList[index];
    const nextMessage = this.messageList[index + 1];
    if (currentMessage.isSender) {
      this.messageList[index].noAvatar = true;
      return false;
    }
    if (!nextMessage) {
      this.messageList[index].noAvatar = false;
      return true;
    }
    const currentMessageTime = new Date(this.messageList[index].sentAt);
    const nextMessageTime = new Date(this.messageList[index + 1].sentAt);
    if (currentMessage.senderName !== nextMessage.senderName) {
      this.messageList[index].noAvatar = false;
      return true;
    }
    const timeDiff =
      (nextMessageTime.getTime() - currentMessageTime.getTime()) /
      (60 * 1000);
    if (timeDiff > 5) {
      this.messageList[index].noAvatar = false;
      return true;
    } else {
      this.messageList[index].noAvatar = true;
      return false;
    }
  }

  /**
   * check message sender and return related css class
   * @param {object} message
   */
  getClassForMessageBubble(message) {
    if (message.isSender) {
      return 'send-messages';
    }
    if (message.noAvatar) {
      return 'received-messages no-avatar';
    }
    return 'received-messages';
  }

  getClassForMessageBody(message) {
    if (!message.fileObject || !message.fileObject.mimetype ||
      (!message.fileObject.mimetype.includes('image') && !message.fileObject.mimetype.includes('video'))) {
      return '';
    }
    if (message.fileObject.mimetype && message.fileObject.mimetype.includes('video')) {
      return 'video-attachment-container';
    }
    if (message.fileObject.mimetype && message.fileObject.mimetype.includes('image')) {
      return 'image';
    }
  }

  /**
   * check date and time diffrance between current message(message object of index) old message.
   * @param {int} message
   */
  checkToShowMessageTime(message: {
    uuid: string;
  }): boolean {
    const index = this.messageList.findIndex(function (msg, i) {
      return msg.uuid === message.uuid;
    });
    if (index <= -1) {
      return;
    }
    // show message time for the first message
    if (!this.messageList[index - 1]) {
      return true;
    }
    const currentMessageTime = new Date(this.messageList[index].sentAt);
    const oldMessageTime = new Date(this.messageList[index - 1].sentAt);
    if ((currentMessageTime.getDate() - oldMessageTime.getDate()) === 0) {
      return this._checkmessageOldThan5Min(
        currentMessageTime,
        oldMessageTime
      );
    }
    return true;
  }

  /**
   * check time diffrance larger than 5 min.
   * @param {object} currentMessageTime
   * @param {object} oldMessageTime
   */
  private _checkmessageOldThan5Min(currentMessageTime, oldMessageTime) {
    const timeDiff =
      (currentMessageTime.getTime() - oldMessageTime.getTime()) / (60 * 1000);
    if (timeDiff > 5) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Trigger typing event when user is typing
   */
  typing() {
    if (!this.utils.isEmpty(this.typingMessage)) {
      this.showBottomAttachmentButtons = true;
      this._scrollToBottom();
    } else {
      this.showBottomAttachmentButtons = false;
    }
    this.pusherService.triggerTyping(this.chatChannel.pusherChannel);
  }

  private _showTyping(event) {
    // don't need to show typing message if the current user is the one who is typing
    if (event.user === this.storage.getUser().name) {
      return;
    }
    this.whoIsTyping = event.user + ' is typing';
    this._scrollToBottom();
    setTimeout(
      () => {
        this.whoIsTyping = '';
      },
      3000
    );
  }

  private _scrollToBottom() {
    setTimeout(() => this.content.scrollToBottom(), 500);
  }

  private attachmentPreview(filestackRes) {
    let preview = `Uploaded ${filestackRes.filename}`;
    const dimension = 224;
    if (!filestackRes.mimetype) {
      return preview;
    }
    if (filestackRes.mimetype.includes('image')) {
      const attachmentURL = `https://cdn.filestackcontent.com/quality=value:70/resize=w:${dimension},h:${dimension},fit:crop/${filestackRes.handle}`;
      // preview = `<p>Uploaded ${filestackRes.filename}</p><img src=${attachmentURL}>`;
      preview = `<img src="${attachmentURL}" alt="filestack attachment">`;
    } else if (filestackRes.mimetype.includes('video')) {
      // we'll need to identify filetype for 'any' type fileupload
      preview = `<app-file-display [file]="submission.answer" [fileType]="question.fileType"></app-file-display>`;
    }
    return preview;
  }

  async attach(type: string) {
    const options: any = {};

    if (this.filestackService.getFileTypes(type)) {
      options.accept = this.filestackService.getFileTypes(type);
      options.storeTo = this.filestackService.getS3Config(type);
    }
    await this.filestackService.open(
      options,
      res => {
        return this._postAttachment(res);
      },
      err => {
        console.error(err);
      }
    );
  }

  previewFile(file) {
    return this.filestackService.previewFile(file);
  }

  private _postAttachment(file) {
    if (this.sendingMessage) {
      return;
    }
    this.sendingMessage = true;
    this.chatService.postAttachmentMessage({
      channelUuid: this.channelUuid,
      message: this.typingMessage,
      file: JSON.stringify(file)
    }).subscribe(
      response => {
        this.pusherService.triggerSendMessage(this.chatChannel.pusherChannel, {
          channelUuid: this.channelUuid,
          uuid: response.uuid,
          isSender: response.isSender,
          message: response.message,
          file: JSON.stringify(file),
          created: response.created,
          senderUuid: response.senderUuid,
          senderName: response.senderName,
          senderRole: response.senderRole,
          senderAvatar: response.senderAvatar,
          sentAt: response.sentAt
        });
        this.messageList.push(
          {
            uuid: response.uuid,
            isSender: response.isSender,
            message: response.message,
            file: response.file,
            fileObject: response.fileObject,
            preview: this.attachmentPreview(response.fileObject),
            created: response.created,
            senderUuid: response.senderUuid,
            senderName: response.senderName,
            senderRole: response.senderRole,
            senderAvatar: response.senderAvatar,
            sentAt: response.sentAt
          }
        );
        this.utils.broadcastEvent('chat:info-update', true);
        this._scrollToBottom();
        this._afterSendMessage();
      },
      error => {
        this._afterSendMessage();
      }
    );
  }

  getTypeByMime(mimetype: string): string {
    const zip = [
      'application/x-compressed',
      'application/x-zip-compressed',
      'application/zip',
      'multipart/x-zip',
    ];

    let result = '';

    if (!mimetype) {
      return 'File';
    }

    if (zip.indexOf(mimetype) >= 0) {
      result = 'Zip';

      // set icon to different document type (excel, word, powerpoint, audio, video)
    } else if (mimetype.indexOf('audio/') >= 0) {
      result = 'Audio';
    } else if (mimetype.indexOf('image/') >= 0) {
      result = 'Image';
    } else if (mimetype.indexOf('text/') >= 0) {
      result = 'Text';
    } else if (mimetype.indexOf('video/') >= 0) {
      result = 'Video';
    } else {
      switch (mimetype) {
        case 'application/pdf':
          result = 'PDF';
          break;
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          result = 'Word';
          break;
        case 'application/excel':
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        case 'application/x-excel':
        case 'application/x-msexcel':
          result = 'Excel';
          break;
        case 'application/mspowerpoint':
        case 'application/vnd.ms-powerpoint':
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        case 'application/x-mspowerpoint':
          result = 'Powerpoint';
          break;
        default:
          result = 'File';
          break;
      }
    }

    return result;
  }

  getIconByMime(mimetype: string): string {
    const zip = [
      'application/x-compressed',
      'application/x-zip-compressed',
      'application/zip',
      'multipart/x-zip',
    ];
    let result = '';

    if (!mimetype) {
      return 'document';
    }

    if (zip.indexOf(mimetype) >= 0) {
      result = 'document';
    } else if (mimetype.includes('audio')) {
      result = 'volume-mute';
    } else if (mimetype.includes('image')) {
      result = 'photos';
    } else if (mimetype.includes('text')) {
      result = 'clipboard-outline';
    } else if (mimetype.includes('video')) {
      result = 'videocam';
    } else {
      switch (mimetype) {
        case 'application/pdf':
          result = 'document'; // 'pdf';
          break;
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          result = 'document'; // 'word';
          break;
        case 'application/excel':
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        case 'application/x-excel':
        case 'application/x-msexcel':
          result = 'document'; // 'excel';
          break;
        case 'application/mspowerpoint':
        case 'application/vnd.ms-powerpoint':
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        case 'application/x-mspowerpoint':
          result = 'document'; // 'powerpoint';
          break;
        default:
          result = 'document'; // 'file';
          break;
      }
    }

    return result;
  }

  async preview(file, keyboardEvent?: KeyboardEvent) {
    if (keyboardEvent && (keyboardEvent?.code === 'Space' || keyboardEvent?.code === 'Enter')) {
      keyboardEvent.preventDefault();
    } else if (keyboardEvent) {
      return;
    }

    // if file didn't have mimetype use filestack Url to priview the file.
    if (!file.mimetype) {
      return this.filestackService.previewFile(file);
    }
    const modal = await this.modalController.create({
      component: ChatPreviewComponent,
      componentProps: {
        file,
      }
    });
    return await modal.present();
  }

  // @Deprecated in case we need it later
  createThumb(video, w, h) {
    const c = document.createElement('canvas'),    // create a canvas
      ctx = c.getContext('2d');                // get context
    c.width = w;                                 // set size = thumb
    c.height = h;
    ctx.drawImage(video, 0, 0, w, h);            // draw in frame
    return c;                                    // return canvas
  }

  async openChatInfo() {
    const info = this.document.getElementById('chatroom');
    if (info) {
      info.focus();
    }

    if (!this.utils.isMobile()) {
      this.loadInfo.emit(true);
    } else {
      const modal = await this.modalController.create({
        component: ChatInfoComponent,
        cssClass: 'chat-info-page',
        componentProps: {
          selectedChat: this.chatChannel,
        }
      });
      await modal.present();
    }
  }
}
