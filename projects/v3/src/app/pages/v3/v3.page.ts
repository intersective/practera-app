import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Review, ReviewService } from '@v3/app/services/review.service';
import { BrowserStorageService } from '@v3/app/services/storage.service';
import { AnimationsService } from '@v3/services/animations.service';
import { ChatService } from '@v3/app/services/chat.service';
import { Subscription } from 'rxjs';
import { SettingsPage } from '../settings/settings.page';

@Component({
  selector: 'app-v3',
  templateUrl: './v3.page.html',
  styleUrls: ['./v3.page.scss'],
})
export class V3Page implements OnInit, OnDestroy {
  wait: boolean = false; // loading flag
  reviews: Review[];
  subscriptions: Subscription[];
  appPages: any[];
  showMessages: boolean = false;

  constructor(
    private modalController: ModalController,
    private animationService: AnimationsService,
    private reviewService: ReviewService,
    private route: ActivatedRoute,
    private router: Router,
    private storageService: BrowserStorageService,
    private chatService: ChatService
  ) {
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subs => subs.unsubscribe());
  }

  private _menuWithReview() {
    this.appPages = [
      {
        title: 'Home',
        url: '/v3/home',
        icon: 'home'
      },
      {
        title: 'Events',
        url: '/v3/events',
        icon: 'today'
      },
      {
        title: 'Reviews',
        url: '/v3/review-desktop',
        icon: 'eye'
      },
      {
        title: 'Messages',
        url: '/v3/messages',
        icon: 'mail'
      }
    ];
  }

  private _menuWithoutReview() {
    this.appPages = [
      {
        title: 'Home',
        url: '/v3/home',
        icon: 'home'
      },
      {
        title: 'Events',
        url: '/v3/events',
        icon: 'today'
      },
      {
        title: 'Messages',
        url: '/v3/messages',
        icon: 'mail'
      }
    ];
  }

  ngOnInit(): void {
    this._menuWithoutReview();
    this.subscriptions = [];
    this.subscriptions.push(
      this.reviewService.reviews$.subscribe(res => {
        if (res && res.length) {
          this._menuWithReview();
        } else {
          this._menuWithoutReview();
        }
      })
    );
    this.subscriptions.push(this.route.params.subscribe(_params => {
      this.reviewService.getReviews();
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
    return this.storageService.getUser().institutionLogo || '/assets/logo.svg';
  }

  get institutionName() {
    return this.storageService.getUser().institutionName || 'Practera';
  }
}
