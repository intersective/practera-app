import { Component, OnInit } from '@angular/core';
import { ModalController, PopoverController, createAnimation } from '@ionic/angular';
import { SettingsSlidePage } from '../settings-slide/settings-slide.page';

@Component({
  selector: 'app-v3',
  templateUrl: './v3.page.html',
  styleUrls: ['./v3.page.scss'],
})
export class V3Page implements OnInit {
  appPages = [
    {
      title: 'Home',
      url: '/v3/home',
      icon: 'home'
    },
    {
      title: 'Events',
      url: '/v3/events',
      icon: 'event'
    },
    {
      title: 'Reviews',
      url: '/v3/reviews',
      icon: 'reviews'
    },
    {
      title: 'Messages',
      url: '/v3/messages',
      icon: 'messages'
    }
  ];
  constructor(
    private modalController: ModalController,
    private popoverController: PopoverController,
  ) { }

  ngOnInit() {
  }

  private enterAnimation(baseElement) {
    const root = baseElement.shadowRoot;
    const backdropAnimation = createAnimation()
      .addElement(root.querySelector('ion-backdrop'))
      .fromTo('opacity', '0.01', '0.4');

    const wrapperAnimation = createAnimation()
      .addElement(root.querySelector('.modal-wrapper'))
      .keyframes([
        { offset: 0, opacity: '0', transform: 'translateX(200%)' },
        { offset: 1, opacity: '0.99', transform: 'translateX(0)' }
      ]);

    return createAnimation()
      .addElement(baseElement)
      .easing('ease-out')
      .duration(300)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  }

  private leaveAnimation(baseElement) {
    return createAnimation(baseElement).direction('reverse');
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: SettingsSlidePage,
      enterAnimation: this.enterAnimation,
      leaveAnimation: this.leaveAnimation,
      cssClass: 'abcd'
    });
    return await modal.present();
  }

  async presentPopover() {
    const popover = await this.popoverController.create({
      component: SettingsSlidePage,
      size: 'cover',
      side: 'right',
      alignment: 'end',
    });
    return await popover.present();
  }
}
