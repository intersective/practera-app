import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { ReviewsRoutingComponent } from './reviews-routing.component';

import { ReviewsRoutingModule } from './reviews-routing.module';
import { ReviewsComponent } from './reviews.component';
import { ReviewListModule } from '../review-list/review-list.module';
import { AssessmentModule } from '../assessment/assessment.module';

@NgModule({
  declarations: [
    ReviewsComponent,
    ReviewsRoutingComponent
  ],
  imports: [
    SharedModule,
    ReviewsRoutingModule,
    ReviewListModule,
    AssessmentModule
  ]
})
export class ReviewsModule { }
