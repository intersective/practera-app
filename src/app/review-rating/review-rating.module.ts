import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ReviewRatingComponent } from './review-rating.component';
import { ReviewRatingService } from './review-rating.service';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ],
  declarations: [
    ReviewRatingComponent
  ],
  providers: [ ReviewRatingService ],
  exports: [ ReviewRatingComponent ],
  entryComponents: [ ReviewRatingComponent ]
})

export class ReviewRatingModule {}
