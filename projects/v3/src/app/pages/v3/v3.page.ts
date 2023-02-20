import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Review, ReviewService } from '@v3/app/services/review.service';
import { BrowserStorageService } from '@v3/app/services/storage.service';
import { AnimationsService } from '@v3/services/animations.service';
import { ChatService } from '@v3/app/services/chat.service';
import { Subscription } from 'rxjs';
import { SettingsPage } from '../settings/settings.page';
import { UtilsService } from '@v3/app/services/utils.service';
import { animate, group, query, state, style, transition, trigger } from '@angular/animations';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { HomeService } from '@v3/app/services/home.service';

@Component({
  selector: 'app-v3',
  templateUrl: './v3.page.html',
  styleUrls: ['./v3.page.scss'],
  animations: [
    trigger('openClose', [
      state('open', style({
        maxWidth: '280px',
        minWidth: '280px',
      })),
      state('closed', style({
        maxWidth: '72px',
        minWidth: '72px',
      })),
      transition('open => closed', [
        query('.institute-logo-container', style({ opacity: 0 })),
        query('.collapsible', style({ transform: 'rotate(0deg)' })),
        group([
          query('.institute-logo-container', animate(500, style({
            opacity: 1,
          }))),
          query('.collapsible', animate(300, style({
            transform: 'rotate(180deg)',
          }))),
          animate(300),
        ]),
      ]),
      transition('closed => open', [
        query('.institute-logo-container', style({ opacity: 0 })),
        query('ion-label.body-2', style({ opacity: 0 })),
        query('.collapsible', style({ transform: 'rotate(0deg)' })),
        group([
          query('.institute-logo-container', animate(500, style({
            opacity: 1,
          }))),
          query('ion-label.body-2', animate(300, style({ opacity: 1 }))),
          query('.collapsible', animate(300, style({
            transform: 'rotate(-180deg)',
          }))),
          animate(300),
        ])
      ]),
    ]),
  ]
})
export class V3Page implements OnInit, OnDestroy {
  openMenu = true; // collapsible submenu
  wait: boolean = false; // loading flag
  reviews: Review[];
  subscriptions: Subscription[];
  appPages: any[];
  showMessages: boolean = false;
  showEvents: boolean = false;
  showReviews: boolean = false;
  directionIcon: string = this.direction();

  i18nText = {
    'setting': $localize`Settings`,
    'myExperience': $localize`My Experiences`
  };

  constructor(
    private modalController: ModalController,
    private animationService: AnimationsService,
    private reviewService: ReviewService,
    private route: ActivatedRoute,
    private router: Router,
    private storageService: BrowserStorageService,
    private chatService: ChatService,
    private readonly utils: UtilsService,
    private readonly notificationsService: NotificationsService,
    private readonly homeService: HomeService,
  ) { }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subs => {
      if (subs.closed !== true) {
        subs.unsubscribe();
      }
    });
  }

  private _initMenuItems() {
    this.appPages = [
      {
        title: $localize`Home`,
        url: '/v3/home',
        icon: 'home',
        code: 'Home',
      },
      {
        title: $localize`Events`,
        url: '/v3/events',
        icon: 'today',
        code: 'Events',
      },
      {
        title: $localize`Reviews`,
        url: '/v3/review-desktop',
        icon: 'eye',
        code: 'Reviews',
      },
      {
        title: $localize`Messages`,
        url: '/v3/messages',
        icon: 'mail',
        code: 'Messages',
      }
    ];
  }

  ngOnInit(): void {
    this._initMenuItems();
    this.subscriptions = [];
    this.subscriptions.push(
      this.reviewService.reviews$.subscribe(res => {
        if (res && res.length) {
          this.showReviews = true;
        } else {
          this.showReviews = false;
        }
      })
    );

    this.homeService.experience$.subscribe(expInfo => {
      if (expInfo?.locale) {
        this.utils.moveToNewLocale(expInfo?.locale);
      }
    });

    this.subscriptions.push(this.route.params.subscribe(_params => {
      this.reviewService.getReviews();
      this.homeService.getExperience();

      // Hide events tab to other user roles. Show only for participants
      if (this.storageService.getUser().role && this.storageService.getUser().role === 'participant') {
        this.showEvents = true;
      } else {
        this.showEvents = false;
      }
    }));

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
    this.openMenu =false;

    // initiate subscription TabPage level (required), so the rest independent listener can pickup the same sharedReplay
    this.subscriptions.push(this.notificationsService.getTodoItems().subscribe());
    this.subscriptions.push(this.notificationsService.getChatMessage().subscribe());
  }

  async presentModal(keyboardEvent?: KeyboardEvent): Promise<void> {
    if (keyboardEvent && (keyboardEvent?.code === 'Space' || keyboardEvent?.code === 'Enter')) {
      keyboardEvent.preventDefault();
    } else if (keyboardEvent) {
      return;
    }

    this.wait = true;
    const modal = await this.modalController.create({
      component: SettingsPage,
      componentProps: {
        mode: 'modal',
      },
      enterAnimation: this.animationService.enterAnimation,
      leaveAnimation: this.animationService.leaveAnimation,
      cssClass: 'right-affixed'
    });
    await modal.present();
    this.wait = false;
    return;
  }

  keyboardNavigate(routerLink: string, keyboardEvent: KeyboardEvent): void | Promise<boolean> {
    if (keyboardEvent && (keyboardEvent?.code === 'Space' || keyboardEvent?.code === 'Enter')) {
      keyboardEvent.preventDefault();
      return this.router.navigateByUrl(routerLink);
    } else if (keyboardEvent) {
      return;
    }
  }

  get institutionLogo() {
    if (this.openMenu !== true) {
      return this.storageService.getUser().squareLogo || '';
    }

    return this.storageService.getUser().institutionLogo || '/assets/logo.svg';
  }

  get institutionName() {
    return this.storageService.getUser().institutionName || 'Practera';
  }

  get isMobile() {
    return this.utils.isMobile();
  }

  toggleMenu() {
    this.openMenu = !this.openMenu;
  }

  // only desktop version require collapsed menu
  get collapsibleMenu() {
    if (this.isMobile) {
      return 'open';
    }

    return (this.openMenu ? 'open' : 'closed');
  }

  // rotation animation logic
  direction(): string {
    this.directionIcon = this.openMenu ? 'keyboard_double_arrow_left' : 'keyboard_double_arrow_right';
    return this.directionIcon;
  }

  isVisible (menuTitle: string): boolean {
    switch (menuTitle) {
      case 'Messages':
        return this.showMessages;
      case 'Events':
        return this.showEvents;
      case 'Reviews':
        return this.showReviews;
      default:
        return true;
    }
  }
}
