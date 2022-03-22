import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReviewsPageRoutingModule } from './reviews-routing.module';

import { ReviewsPage } from './reviews.page';
import { ReviewListPageModule } from '../review-list/review-list.module';
import { ComponentsModule } from '@v3/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReviewsPageRoutingModule,
    ReviewListPageModule,
    ComponentsModule,
  ],
  declarations: [ReviewsPage]
})
export class ReviewsPageModule {}
