import { Component, OnInit, ViewChild, AfterContentInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Content } from "@ionic/angular";
import { BrowserStorageService } from "@services/storage.service";

import { ChatService } from "../chat.service";

interface Chat {
  name: string;
  team_name?: string;
  is_team?: boolean;
  team_id: number;
  team_member_id: number;
  chat_color?: string;
}

@Component({
  selector: "app-chat-room",
  templateUrl: "./chat-room.component.html",
  styleUrls: ["./chat-room.component.scss"]
})
export class ChatRoomComponent implements OnInit, AfterContentInit {
  // @TODO need to create method to convert chat time to local time.
  @ViewChild(Content) content: Content;

  message: any;
  messageList: any[];
  selectedChat: Chat;
  chatColors: any[];
  routeTeamId: number = 0;
  routeTeamMemberId: number = 0;
  messagePageNumber: number = 0;
  messagePagesize: number = 20;

  constructor(
    private chatService: ChatService,
    private router: Router,
    private storage: BrowserStorageService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngAfterContentInit() {
    this.content.scrollToBottom();
  }

  ngOnInit() {
    this.chatColors = this.storage.get("chatAvatarColors");
    this.selectedChat = this.storage.get("selectedChatObject") || {
      name: "",
      is_team: false,
      team_id: null,
      team_member_id: null,
      chat_color: null
    };
    this.validateRoutePrams();
  }

  private validateRoutePrams() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.selectedChat = params['selectedChat'];
      console.log("chat", this.selectedChat.name);
      // this.routeTeamId = +params["teamId"]; // (+) converts string 'teamId' to a number
      // this.routeTeamMemberId = +params["memberId"]; // (+) converts string 'memberId' to a number
      // this.loadMessages(false);
    });
  }

  loadMessages(loadMore) {
    let tempRes = null;
    // creating params need to load messages.
    let param = {
      team_id: this.routeTeamId,
      page: this.getMessagePageNumber(),
      size: this.messagePagesize,
      team_member_id: this.routeTeamMemberId
    };
    this.chatService
      .getMessageList(param, this.selectedChat)
      .subscribe(response => {
        tempRes = Object.assign([], response);
        tempRes.reverse();
        if (loadMore) {
          this.messageList = tempRes.concat(this.messageList);
        } else {
          this.messageList = tempRes;
        }
        this.markAsSeen(tempRes);
      });
  }

  private getMessagePageNumber() {
    return (this.messagePageNumber += 1);
  }

  getChatAvatarText(senderName) {
    return this.chatService.generateChatAvatarText(senderName);
  }

  back() {
    this.router.navigateByUrl("/app/(chat:chat)");
  }

  sendMessage() {
    if (this.message) {
      const message = this.message;
      this.message = ""; // remove typed message from text field.
      // createing prams need to send message
      let data = {
        message: message,
        team_id: this.selectedChat.team_id,
        to: null
      };
      if (this.selectedChat.is_team) {
        data.to = "team";
      } else {
        data.to = this.selectedChat.team_member_id;
      }
      this.chatService.postNewMessage(data).subscribe(
        response => {
          this.messageList.push(response.data);
        },
        error => {}
      );
    }
  }

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
        },
        error => {
          console.log("error");
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
