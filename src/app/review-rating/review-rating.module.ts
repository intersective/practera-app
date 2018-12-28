import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewRatingComponent } from './review-rating.component';

@NgModule({
  declarations: [ReviewRatingComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class ReviewRatingModule { }
