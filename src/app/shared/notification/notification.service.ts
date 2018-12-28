import { Injectable } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { AlertOptions } from '@ionic/core';
import { PopUpComponent } from './pop-up/pop-up.component';
import { ReviewRatingComponent } from '../../review-rating/review-rating.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private modalController: ModalController,
    private alertController: AlertController
  ) {}

  // show pop up message 
  // this is using pop-up.component.ts as the view
  // put redirect = false if don't need to redirect
  async popUp(type, data, redirect) {
    const modal = await this.modalController.create({
      component: PopUpComponent,
      componentProps: { 
        type: type,
        data: data,
        redirect: redirect
      }
    });
    return await modal.present();
  }

  async alert(config: AlertOptions) {
    const alert = await this.alertController.create(config);
    return await alert.present();
  }

  // show review rating page as pop up modal
  // review ID is required
  async reviewRating(reviewId, redirect) {
     const modal = await this.modalController.create({
      component: ReviewRatingComponent,
      componentProps: { 
        reviewId: reviewId,
        redirect: redirect
      }
    });
    return await modal.present();
  }
}
