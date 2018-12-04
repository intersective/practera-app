import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewsComponent } from './reviews.component';
import { ReviewsRoutingModule } from './reviews-routing.module';
import { ReviewsService } from './reviews.service';
import { ReviewsRoutingComponent } from './reviews-routing.components';



@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReviewsRoutingModule
  ],
  declarations: [ 
    ReviewsComponent,
    ReviewsRoutingComponent 
  ],
  providers: [ ReviewsService]
})
export class ReviewsModule {}
