import { Component } from '@angular/core';
import { TabsService } from './tabs.service';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';
import { RouterEnter } from '@services/router-enter.service';
import { ReviewListService } from '@app/review-list/review-list.service';
import { Router } from '@angular/router';
import { SharedService } from '@services/shared.service';
import { EventListService } from '@app/event-list/event-list.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { ChatService } from '@app/chat/chat.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.component.html',
  styleUrls: ['tabs.component.scss']
})
export class TabsComponent extends RouterEnter {
  routeUrl = '/app';
  noOfTodoItems = 0;
  noOfChats = 0;
  selectedTab = '';

  constructor(
    readonly utils: UtilsService,
    readonly storage: BrowserStorageService,
    readonly chatService: ChatService,
    public router: Router,
    private tabsService: TabsService,
    private reviewsService: ReviewListService,
    private sharedService: SharedService,
    private eventsService: EventListService,
    private newRelic: NewRelicService,
  ) {
    super(router);
    this.newRelic.setPageViewName('tab');

    if (this.restrictedAccess === false) {
      this.utils.getEvent('notification').subscribe(event => {
        this.noOfTodoItems++;
      });
      this.utils.getEvent('event-reminder').subscribe(event => {
        this.noOfTodoItems++;
      });
      this.utils.getEvent('chat:new-message').subscribe(event => {
        this.tabsService.getNoOfChats().subscribe(noOfChats => {
          this.noOfChats = noOfChats;
        });
      });
      this.utils.getEvent('chat-badge-update').subscribe(event => {
        this.tabsService.getNoOfChats().subscribe(noOfChats => {
          this.noOfChats = noOfChats;
        });
      });
    }
  }

  get restrictedAccess() {
    return this.storage.singlePageAccess;
  }

  get showChat() {
    const settings = this.storage.settings;
    return settings.showChat;
  }

  set showChat(val) {
    this.storage.settings = { val, title: 'showChat' };
  }

  get showReview() {
    const settings = this.storage.settings;
    return settings.showReview;
  }

  set showReview(val) {
    this.storage.settings = { val, title: 'showReview' };
  }

  get showEvents() {
    const settings = this.storage.settings;
    return settings.showEvents;
  }

  set showEvents(val) {
    this.storage.settings = { val, title: 'showEvents' };
  }

  onEnter() {
    this._checkRoute();
    this._stopPlayingVideos();
    this._topicStopReading();
    this.tabsService.getNoOfTodoItems().subscribe(noOfTodoItems => {
      this.noOfTodoItems = noOfTodoItems;
    });

    const {
      chatEnabled,
      hasReviews,
      hasEvents,
    } = this.storage.getUser()

    if (!chatEnabled) { // keep configuration-based value
      this.showChat = false;
    } else {
      // [AV2-950]: display chat tab if a user has chatroom available
      this.chatService.getChatList().subscribe(chats => {
        if (chats && chats.length > 0) {
          this.showChat = true;

          // only get the unread chats when chatroom is available
          this.tabsService.getNoOfChats().subscribe(noOfChats => {
            this.noOfChats = noOfChats;
          });
        } else {
          this.showChat = false;
        }
      });
    }

    if (hasReviews) {
      this.showReview = true;
    } else {
      this.reviewsService.getReviews().subscribe(data => {
        if (data.length) {
          this.showReview = true;
        } else {
          this.showReview = false;
        }
      });
    }

    if (hasEvents) {
      this.showEvents = true;
    } else {
      this.eventsService.getEvents().subscribe(events => {
        this.showEvents = !this.utils.isEmpty(events);
      });
    }
  }

  private _checkRoute() {
    this.newRelic.actionText(`selected ${this.router.url}`);
    switch (this.router.url) {
      case '/app/home':
        this.selectedTab = 'overview';
        break;

      case '/app/events':
        this.selectedTab = 'events';
        break;

      case '/app/settings':
        this.selectedTab = 'settings';
        break;

      case '/app/chat':
        this.selectedTab = 'chat';
        break;

      default:
        if (this.router.url.includes('/app/home')) {
          this.selectedTab = 'overview';
        } else if (this.router.url.includes('/app/reviews')) {
          this.selectedTab = 'reviews';
        } else {
          this.selectedTab = '';
        }
        break;
    }
  }

  private _stopPlayingVideos() {
    this.sharedService.stopPlayingVideos();
  }

  private _topicStopReading() {
    // if user looking at topic mark it stop reading before go back.
    this.sharedService.markTopicStopOnNavigating();
  }

}
