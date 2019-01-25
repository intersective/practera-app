import { Component, OnInit, ViewChild, AfterContentInit, AfterViewInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { IonContent } from "@ionic/angular";
import { BrowserStorageService } from "@services/storage.service";
import { RouterEnter } from "@services/router-enter.service";
import { UtilsService } from "../../services/utils.service";

import { ChatService } from "../chat.service";

export interface Chat {
  name: string;
  team_name?: string;
  is_team?: boolean;
  team_id: number;
  team_member_id: number;
  chat_color?: string;
  participants_only?: boolean;
}

export interface Message {
  id:number
  sender_name:string;
  message:string;
  sent_time:string;
  is_sender:boolean;
  chat_color?: string;
  noAvatar?:boolean;
}

@Component({
  selector: "app-chat-room",
  templateUrl: "./chat-room.component.html",
  styleUrls: ["./chat-room.component.scss"]
})
export class ChatRoomComponent extends RouterEnter implements AfterViewInit {
  // @TODO need to create method to convert chat time to local time.
  @ViewChild(IonContent) content: IonContent;

  message: string;
  messageList: Array<Message>;
  selectedChat: Chat;
  messagePageNumber: number = 0;
  messagePagesize: number = 20;
  loadingChatMessages:boolean = true;

  constructor(
    private chatService: ChatService,
    public router: Router,
    public storage: BrowserStorageService,
    private activatedRoute: ActivatedRoute,
    public utils: UtilsService
  ) {
    super(router, utils, storage);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.content.scrollToBottom();
   }, 500);
  }

  onEnter() {
    this._initialise();
    this._validateRoutePrams();
    this._loadMessages(false);
  }

  private _initialise() {
    this.loadingChatMessages = true;
    this.selectedChat = {
      name: "",
      is_team: false,
      team_id: null,
      team_member_id: null,
      chat_color: null,
      participants_only: false
    };
  }

  private _validateRoutePrams() {
    let teamId = parseInt(this.activatedRoute.snapshot.paramMap.get('teamId'));
    this.selectedChat.team_id = teamId
    if (Number(this.activatedRoute.snapshot.paramMap.get('teamMemberId'))) {
      this.selectedChat.team_member_id = parseInt(this.activatedRoute.snapshot.paramMap.get('teamMemberId'));
    } else {
      this.selectedChat.is_team = true;
      this.selectedChat.participants_only = JSON.parse(this.activatedRoute.snapshot.paramMap.get('teamMemberId'));
    }
  }

  private _loadMessages(loadMore) {
    this.loadingChatMessages = true;
    let tempRes = null;
    let param: any;
    this.messageList = [];
    // creating params need to load messages.
    if (this.selectedChat.is_team) {
      param = {
        team_id: this.selectedChat.team_id,
        page: this.getMessagePageNumber(),
        size: this.messagePagesize,
        participants_only: this.selectedChat.participants_only
      };
    } else {
      param = {
        team_id: this.selectedChat.team_id,
        page: this.getMessagePageNumber(),
        size: this.messagePagesize,
        team_member_id: this.selectedChat.team_member_id
      };
    }
    this.chatService
      .getMessageList(param, this.selectedChat)
      .subscribe(response => {
        if (response) {
          if (response.length > 0) {
            tempRes = Object.assign([], response);
            tempRes.reverse();
            if (loadMore) {
              this.messageList = tempRes.concat(this.messageList);
            } else {
              this.messageList = tempRes;
            }
            this.getChatName();
            this.markAsSeen(tempRes);
          } else {
            this.messagePageNumber -= 1;
          }
        } else {
          this.loadingChatMessages = false;
        }
      }, error => {
        this.loadingChatMessages = false;
      });
  }

  loadMoreMessages(event) {
    let scrollTopPosition = event.detail.scrollTop;
    if (scrollTopPosition === 0) {
      this._loadMessages(true);
    }
  }

  private getMessagePageNumber() {
    return (this.messagePageNumber += 1);
  }

  private getChatName() {
    if (this.selectedChat.is_team) {
      this.chatService.getTeamName(this.selectedChat.team_id)
      .subscribe(Response => {
        this.selectedChat.team_name = Response;
        this.loadingChatMessages = false;
      });
    } else {
      let message = this.messageList.find(function(message) {
        return message.is_sender === false;
      });
      if (message) {
        this.selectedChat.name = message.sender_name;
      }
    }
    this.loadingChatMessages = false;
  }

  getChatAvatarText(senderName) {
    return this.chatService.generateChatAvatarText(senderName);
  }

  back() {
    this.router.navigateByUrl("/app/(chat:chat)");
  }

  sendMessage(event?:any) {
    // preventing textarea default action when press enter.
    if (event) {
      event.preventDefault();
    }
    if (this.message) {
      const message = this.message;
      // remove typed message from text field.
      this.message = ''; 
      // createing prams need to send message
      let data:any;
      if (this.selectedChat.is_team) {
        data = {
          message: message,
          team_id: this.selectedChat.team_id,
          to: "team",
          participants_only: this.selectedChat.participants_only
        }
      } else {
        data = {
          message: message,
          team_id: this.selectedChat.team_id,
          to: this.selectedChat.team_member_id
        }
      }
      this.chatService.postNewMessage(data).subscribe(
        response => {
          this.messageList.push(response.data);
        },
        error => {}
      );
    }
  }

  // call chat api to mark message as seen messages
  private markAsSeen(messageList) {
    let messageIdList = [];
    let index = 0;
    // createing id array to mark as read.
    for (index = 0; index < messageList.length; index++) {
      messageIdList.push(messageList[index].id);
    }
    this.chatService
      .markMessagesAsSeen({
        id: JSON.stringify(messageIdList),
        team_id: this.selectedChat.team_id
      })
      .subscribe(
        response => {
          console.log("marked");
        }
      );
  }

  getMessageDate(date) {
    let params = {
      date: date,
      type: "list"
    };
    return this.chatService.getDate(params);
  }

  /**
   * check same user have messages inline
   * @param {int} message
   */
  checkIsLastMessage(message) {
    let index = this.messageList.indexOf(message);
    if (index > -1) {
      var currentMessage = this.messageList[index];
      var nextMessage = this.messageList[index + 1];
      if (!currentMessage.is_sender) {
        if (nextMessage) {
          var currentMessageTime = new Date(this.messageList[index].sent_time);
          var nextMessageTime = new Date(this.messageList[index + 1].sent_time);
          if (currentMessage.sender_name === nextMessage.sender_name) {
            var timeDiff =
              (nextMessageTime.getTime() - currentMessageTime.getTime()) /
              (60 * 1000);
            if (timeDiff > 5) {
              this.messageList[index].noAvatar = false;
              return true;
            } else {
              this.messageList[index].noAvatar = true;
              return false;
            }
          } else {
            this.messageList[index].noAvatar = false;
            return true;
          }
        }
        this.messageList[index].noAvatar = false;
        return true;
      } else {
        this.messageList[index].noAvatar = true;
        return false;
      }
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
    if (!message.is_sender && message.noAvatar) {
      return "reserved-messages no-avatar";
    } else if (!message.is_sender && !message.noAvatar) {
      return "reserved-messages";
    } else {
      return "send-messages";
    }
  }
  /**
   * check message time and return related css class for avatar
   * @param {object} message
   */
  getClassForAvatar(message) {
    if (this.checkToShowMessageTime(message)) {
      return message.chat_color;
    } else {
      return message.chat_color + " no-time";
    }
  }

  /**
   * check date and time diffrance between current message(message object of index) old message.
   * @param {int} message
   */
  checkToShowMessageTime(message) {
    let index = this.messageList.indexOf(message);
    if (index > -1) {
      if (this.messageList[index - 1]) {
        var currentMessageTime = new Date(this.messageList[index].sent_time);
        var oldMessageTime = new Date(this.messageList[index - 1].sent_time);
        if (oldMessageTime) {
          var dateDiff =
            currentMessageTime.getDate() - oldMessageTime.getDate();
          if (dateDiff === 0) {
            return this.checkmessageOldThan5Min(
              currentMessageTime,
              oldMessageTime
            );
          } else {
            return true;
          }
        } else {
          return true;
        }
      }
    }
  }

  /**
   * check time diffrance larger than 5 min.
   * @param {object} currentMessageTime
   * @param {object} oldMessageTime
   */
  private checkmessageOldThan5Min(currentMessageTime, oldMessageTime) {
    var timeDiff =
      (currentMessageTime.getTime() - oldMessageTime.getTime()) / (60 * 1000);
    if (timeDiff > 5) {
      return true;
    } else {
      return false;
    }
  }
}
