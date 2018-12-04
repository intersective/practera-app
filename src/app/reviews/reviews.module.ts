import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewsComponent } from './reviews.component';
import { ReviewsRoutingModule } from './reviews-routing.module';
import { ReviewsService } from './reviews.service';
import { ReviewsRoutingComponent } from './reviews-routing.components';
import { ActivityCardModule } from '../components/activity-card/activity-card.module';



@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReviewsRoutingModule,
    ActivityCardModule
  ],
  declarations: [ 
    ReviewsComponent,
    ReviewsRoutingComponent 
  ],
  providers: [ ReviewsService]
})
export class ReviewsModule {}
