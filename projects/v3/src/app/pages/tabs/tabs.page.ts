import { Component, HostListener, isDevMode, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonTabs } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Review, ReviewService } from '@v3/services/review.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { ChatService } from '@v3/services/chat.service';
import { Subscription } from 'rxjs';
import { UtilsService } from '@v3/services/utils.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { ActivityService } from '@v3/app/services/activity.service';

@Component({
  standalone: false,
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

  hasLeftSidebar: boolean;

  constructor(
    private reviewService: ReviewService,
    private storageService: BrowserStorageService,
    private chatService: ChatService,
    private utils: UtilsService,
    private notificationsService: NotificationsService,
    private route: ActivatedRoute,
    private activityService: ActivityService,
    private router: Router,
  ) {
  }

  /**
   * Check if a feature is enabled in developer mode only
   * @param featureName The name of the feature to check
   * @returns True if the feature is enabled in developer mode, false otherwise
   */
  forDeveloperMode(featureName: string): boolean {
    // List of features to enable in developer mode
    const betaFeatures = [];
    if (isDevMode() && betaFeatures.includes(featureName)) {
      return true;
    }
    return false;
  }

  ngOnInit() {
    this.utils.setPageTitle('Practera');
    this.utils.screenStatus$.subscribe((res) => {
      this.hasLeftSidebar = res.leftSidebarExpanded;
    });
    this.subscriptions.push(this.reviewService.reviews$.subscribe(res => this.reviews = res));
    if (!this.storageService.getUser().chatEnabled) { // keep configuration-based value
      this.showMessages = false;
    } else {
      // Optimistically show the Messages tab immediately so ion-tabs can
      // activate the route; getChatList() updates to false if no channels exist.
      this.showMessages = true;
      this.subscriptions.push(this.chatService.getChatList().subscribe(chats => {
        this.showMessages = !!(chats && chats.length > 0);
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

  /**
   * Handle keyboard navigation for tab buttons
   * Ensures proper keyboard support similar to side menu navigation
   */
  keyboardNavigateTab(tabName: string, keyboardEvent: KeyboardEvent): void | Promise<boolean> {
    if (keyboardEvent && (keyboardEvent?.code === 'Space' || keyboardEvent?.code === 'Enter')) {
      keyboardEvent.preventDefault();
      // Map tab names to routes
      const tabRouteMap: { [key: string]: string } = {
        'home': '/v3/home',
        'events': '/v3/events',
        'reviews': '/v3/review-desktop',
        'messages': '/v3/messages',
        'due-dates': '/v3/due-dates',
        'settings': '/v3/settings'
      };
      const route = tabRouteMap[tabName];
      if (route && this.tabs) {
        // Use Ionic tabs API to select the tab
        this.tabs.select(tabName);
        // Also navigate to ensure URL is correct
        return this.router.navigateByUrl(route);
      }
    } else if (keyboardEvent) {
      return;
    }
  }
}
