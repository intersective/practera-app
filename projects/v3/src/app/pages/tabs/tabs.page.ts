import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonTabs, Platform } from '@ionic/angular';
import { Review, ReviewService } from '@v3/app/services/review.service';
import { BrowserStorageService } from '@v3/app/services/storage.service';
import { ChatService } from '@v3/app/services/chat.service';
import { Subscription } from 'rxjs';
import { UtilsService } from '@v3/app/services/utils.service';
import { NotificationsService } from '@v3/app/services/notifications.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit, OnDestroy {
  reviews: Review[];
  subscriptions: Subscription[] = [];
  showMessages: boolean = false;

  @ViewChild('tabs', { static: false }) tabs: IonTabs;
  selectedTab: string = '';

  constructor(
    private platform: Platform,
    private reviewService: ReviewService,
    private storageService: BrowserStorageService,
    private chatService: ChatService,
    private utils: UtilsService,
    private notificationsService: NotificationsService,
  ) {}

  ngOnInit() {
    this.subscriptions.push(this.reviewService.reviews$.subscribe(res => this.reviews = res));
    if (!this.storageService.getUser().chatEnabled) { // keep configuration-based value
      this.showMessages = false;
    } else {
      // display chat tab if a user has chatroom available
      this.subscriptions.push(this.chatService.getChatList().subscribe(chats => {
        if (chats && chats.length > 0) {
          this.showMessages = true;
        } else {
          this.showMessages = false;
        }
      }));
    }

    this.subscriptions.push(this.utils.getEvent('notification').subscribe(event => {
      this.notificationsService.getTodoItemFromEvent(event);
    }));

    this.subscriptions.push(this.utils.getEvent('chat:new-message').subscribe(() => {
      this.notificationsService.getChatMessage().subscribe();
    }));

    this.subscriptions.push(this.utils.getEvent('event-reminder').subscribe(event => {
      this.notificationsService.getReminderEvent(event).subscribe();
    }));

    this.subscriptions.push(this.notificationsService.getTodoItems().subscribe());
    this.subscriptions.push(this.notificationsService.getChatMessage().subscribe());
  }

  get isMobile() {
    return this.platform.is('mobile');
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subs => subs.unsubscribe());
  }

  setCurrentTab() {
    this.selectedTab = this.tabs.getSelected();
  }

}
