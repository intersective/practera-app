import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, PopoverController } from '@ionic/angular';
import { Review, ReviewService } from '@v3/app/services/review.service';
import { AnimationsService } from '@v3/services/animations.service';
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
  constructor(
    private modalController: ModalController,
    private popoverController: PopoverController,
    private animationService: AnimationsService,
    private reviewService: ReviewService,
    private route: ActivatedRoute
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
        icon: 'calendar'
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
        icon: 'calendar'
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
    this.subscriptions.push(this.route.params.subscribe(params => {
      this.reviewService.getReviews();
    }));
  }

  async presentModal(): Promise<void> {
    this.wait = true;
    const modal = await this.modalController.create({
      component: SettingsPage,
      enterAnimation: this.animationService.enterAnimation,
      leaveAnimation: this.animationService.leaveAnimation,
      cssClass: 'right-affixed'
    });
    await modal.present();
    this.wait = false;
    return;
  }

  async presentPopover() {
    const popover = await this.popoverController.create({
      component: SettingsPage,
      size: 'cover',
      side: 'right',
      alignment: 'end',
    });
    return await popover.present();
  }
}
