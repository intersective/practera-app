import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopUpComponent } from './pop-up/pop-up.component';
import { ReviewRatingComponent } from '../../review-rating/review-rating.component';
import { NotificationService } from './notification.service';


@NgModule({
  imports: [ 
    IonicModule,
    CommonModule,
    FormsModule
  ],
  providers: [
    NotificationService
  ],
  declarations: [
    PopUpComponent,
    ReviewRatingComponent
  ],
  exports: [
    PopUpComponent
  ],
  entryComponents: [
    PopUpComponent,
    ReviewRatingComponent
  ]
})

export class NotificationModule {
  
}  
