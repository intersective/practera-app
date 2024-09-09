import { take, takeUntil, mergeMap } from 'rxjs/operators';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MenuController, ModalController } from '@ionic/angular';
import { Review, ReviewService } from '@v3/app/services/review.service';
import { BrowserStorageService } from '@v3/app/services/storage.service';
import { AnimationsService } from '@v3/services/animations.service';
import { ChatService } from '@v3/app/services/chat.service';
import { Subject, Subscription } from 'rxjs';
import { SettingsPage } from '../settings/settings.page';
import { UtilsService } from '@v3/app/services/utils.service';
import { animate, group, query, state, style, transition, trigger } from '@angular/animations';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { HomeService } from '@v3/app/services/home.service';
import { environment } from '@v3/environments/environment';
import { UnlockIndicatorService } from '@v3/app/services/unlock-indicator.service';

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
  openMenu = false; // collapsible submenu
  wait: boolean = false; // loading flag
  reviews: Review[];
  appPages: any[];
  showMessages: boolean = false;
  showEvents: boolean = false;
  showReviews: boolean = false;
  showDueDates: boolean = true;
  directionIcon: string = this.direction();
  collapsibleMenu: string = 'closed';
  institutionLogo: string = this.getInstitutionLogo();
  isMobile: boolean;
  institutionName: string;

  i18nText = {
    'setting': $localize`Settings`,
    'myExperience': $localize`My Experiences`
  };
  hasUnlockedTasks: boolean;
  unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private menuController: MenuController,
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
    private readonly unlockIndicatorService: UnlockIndicatorService,
  ) {
    this.isMobile = this.utils.isMobile();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private _initMenuItems() {
    // be careful with the order of the menu items
    // the order index will be used to display tab status as in ngOnInit()
    this.appPages = [
      {
        title: $localize`Home`,
        url: '/v3/home',
        icon: 'home',
        code: 'Home',
        badges: 0,
        hasNotification: false,
      },
      {
        title: $localize`Events`,
        url: '/v3/events',
        icon: 'today',
        code: 'Events',
        badges: 0,
      },
      {
        title: $localize`Reviews`,
        url: '/v3/review-desktop',
        icon: 'eye',
        code: 'Reviews',
        badges: 0,
      },
      {
        title: $localize`Messages`,
        url: '/v3/messages',
        icon: 'mail',
        code: 'Messages',
        badges: 0,
      },
      {
        title: $localize`Due Status`,
        url: '/v3/due-dates',
        icon: 'alarm',
        code: 'DueDates',
        badges: 0,
      },
    ];

    this.institutionName = this.storageService.getUser().institutionName || 'Practera';
  }

  ngOnInit(): void {
    this.institutionLogo = this.getInstitutionLogo();

    if (this.isMobile) {
      this.menuController.enable(false);
    }
    this._initMenuItems();

    this.reviewService.reviews$
    .pipe(
      takeUntil(this.unsubscribe$),
    )
    .subscribe(res => {
      if (res && res.length) {
        this.showReviews = true;
      } else {
        this.showReviews = false;
      }
    });

    this.notificationsService.notification$.subscribe(notifications => {
      // assign notification badge to each tab
      const chat = (notifications || []).find(noti => {
        if (noti.type === 'chat') {
          return noti;
        }
      });
      this.appPages[3].badges = chat?.unreadMessages || 0; // messages tab

      this.appPages[1].badges = notifications.filter(noti => noti.type === 'event-reminder').length; // events tab
      this.appPages[2].badges = notifications.filter(noti => noti.type === 'review_submission').length; // reviews tab
    });

    this.homeService.experience$.subscribe(expInfo => {
      if (expInfo?.locale && environment.production === true) {
        this.utils.moveToNewLocale(expInfo?.locale);
      }
    });

    this.route.params
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(_params => {
      this.reviewService.getReviews();

      // Hide events tab to other user roles. Show only for participants
      if (this.storageService.getUser().role && this.storageService.getUser().role === 'participant') {
        this.showEvents = true;
      } else {
        this.showEvents = false;
      }
    });

    this.router.events
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(event => {
        if (event instanceof NavigationEnd && event.urlAfterRedirects === '/v3/home') {
          this.homeService.getExperience();
        }
      });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && event.urlAfterRedirects === '/v3/home') {
        this.homeService.getExperience();
      }
    });

    if (!this.storageService.getUser().chatEnabled) { // keep configuration-based value
      this.showMessages = false;
    } else {
      // display chat tab if a user has chatroom available
      this.chatService.getChatList()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(chats => {
          if (chats && chats.length > 0) {
            this.showMessages = true;
          } else {
            this.showMessages = false;
          }
        });
    }
    this.openMenu = false;

    // initiate subscription v3 page level (required), so the rest independent listener can pickup the same sharedReplay
    this.notificationsService.getTodoItems().pipe(
      mergeMap(_generic => {
        return this.notificationsService.getChatMessage();
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe();

    this.unlockIndicatorService.unlockedTasks$
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(unlockedTasks => {
      this.appPages[0].hasNotification = false; // reset
      if (unlockedTasks?.length > 0) {
        this.appPages[0].hasNotification = true;
      }
    });
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

  getInstitutionLogo(): string {
    if (!this.storageService) {
      return '/assets/logo.svg'; // Default logo or some fallback
    }

    if (this.openMenu !== true) {
      return this.storageService.getUser().squareLogo || '';
    }

    return this.storageService.getUser().institutionLogo || '/assets/logo.svg';
  }

  toggleMenu() {
    this.openMenu = !this.openMenu;
    this.collapsibleMenu = this.collapseMenu();
    this.institutionLogo = this.getInstitutionLogo();
  }

  // only desktop version require collapsed menu
  // get collapsibleMenu() {
  collapseMenu(): string {
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
      case 'DueDates':
        return this.showDueDates;
      default:
        return true;
    }
  }
}
