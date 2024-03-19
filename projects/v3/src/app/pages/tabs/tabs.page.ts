import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonTabs, Platform } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Review, ReviewService } from '@v3/services/review.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { ChatService } from '@v3/services/chat.service';
import { Subscription } from 'rxjs';
import { UtilsService } from '@v3/services/utils.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { ActivityService } from '@v3/app/services/activity.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit, OnDestroy {
  reviews: Review[];
  subscriptions: Subscription[] = [];
  showMessages: boolean = false;
  showEvents: boolean = false;

  @ViewChild('tabs', { static: false }) tabs: IonTabs;
  selectedTab: string = '';

  badges = {
    event: 0,
    review: 0,
    chat: 0,
  };

  constructor(
    private platform: Platform,
    private reviewService: ReviewService,
    private storageService: BrowserStorageService,
    private chatService: ChatService,
    private utils: UtilsService,
    private notificationsService: NotificationsService,
    private route: ActivatedRoute,
    private activityService: ActivityService,
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

    // Hide events tab to other user roles. Show only for participants
    this.subscriptions.push(this.route.params.subscribe(_params => {
      if (this.storageService.getUser().role && this.storageService.getUser().role === 'participant') {
        this.showEvents = true;
      } else {
        this.showEvents = false;
      }
    }));

    this.subscriptions.push(this.utils.getEvent('notification').subscribe(event => {
      this.notificationsService.getTodoItemFromEvent(event);
      if (event.type === 'assessment_review_published' && event?.meta?.AssessmentReview?.activity_id) {
        this.activityService.getActivity(event.meta.AssessmentReview.activity_id);
      }
    }));

    this.subscriptions.push(this.utils.getEvent('chat:new-message').subscribe(() => {
      this.notificationsService.getChatMessage().subscribe();
    }));

    this.subscriptions.push(this.utils.getEvent('chat:delete-message').subscribe(() => {
      this.notificationsService.getChatMessage().subscribe();
    }));

    this.subscriptions.push(this.utils.getEvent('event-reminder').subscribe(event => {
      this.notificationsService.getReminderEvent(event).subscribe();
    }));

    this.notificationsService.notification$.subscribe(notifications => {
      // assign notification badge to each tab
      this.badges.event = notifications.filter(noti => noti.type === 'event-reminder').length;
      this.badges.review = notifications.filter(noti => noti.type === 'review_submission').length;

      const chat = notifications.find(noti => {
        if (noti.type === 'chat') {
          return noti;
        }
      });
      this.badges.chat = chat?.unreadMessages || 0;
    });
  }

  get isMobile() {
    return this.platform.is('mobile');
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => {
      if (sub.closed === false) {
        sub.unsubscribe();
      }
    });
  }

  setCurrentTab() {
    this.selectedTab = this.tabs.getSelected();
  }
}
