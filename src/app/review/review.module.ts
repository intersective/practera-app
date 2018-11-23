import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewComponent } from './review.component';
import { ReviewRoutingModule } from './review-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReviewRoutingModule,
  ],
  declarations: [ReviewComponent]
})
export class ReviewModule {}
