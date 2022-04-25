import { Component, OnInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { Review, ReviewService } from '@v3/app/services/review.service';
import { AnimationsService } from '@v3/services/animations.service';
import { SettingsPage } from '../settings/settings.page';

@Component({
  selector: 'app-v3',
  templateUrl: './v3.page.html',
  styleUrls: ['./v3.page.scss'],
})
export class V3Page implements OnInit {
  reviews: Review[];
  appPages = [
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
  constructor(
    private modalController: ModalController,
    private popoverController: PopoverController,
    private animationService: AnimationsService,
    private reviewService: ReviewService
  ) {
  }

  ngOnInit(): void {
    this.reviewService.reviews$.subscribe(res => {
      if (res && res.length) {
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
    });
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: SettingsPage,
      enterAnimation: this.animationService.enterAnimation,
      leaveAnimation: this.animationService.leaveAnimation,
      cssClass: 'right-affixed'
    });
    return await modal.present();
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
