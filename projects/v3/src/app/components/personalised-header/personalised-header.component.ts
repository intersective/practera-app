import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AnimationsService } from '@v3/services/animations.service';
import { NotificationsComponent } from '../notifications/notifications.component';

@Component({
  selector: 'app-personalised-header',
  templateUrl: './personalised-header.component.html',
  styleUrls: ['./personalised-header.component.scss'],
})
export class PersonalisedHeaderComponent implements OnInit {

  constructor(
    private modalController: ModalController,
    private readonly animationService: AnimationsService
  ) { }

  ngOnInit() {}

  async notifications(): Promise<void> {
    const modal = await this.modalController.create({
      component: NotificationsComponent,
      enterAnimation: this.animationService.enterAnimation,
      leaveAnimation: this.animationService.leaveAnimation,
      cssClass: 'right-affixed',
    });
    return modal.present();
  }
}
