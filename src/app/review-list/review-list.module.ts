import { SharedModule } from '@shared/shared.module';
import { NgModule } from '@angular/core';
import { ReviewListComponent } from './review-list.component';
import { ReviewListService } from './review-list.service';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    ReviewListComponent
  ],
  providers: [ ReviewListService],
  exports: [
    ReviewListComponent
  ],
})
export class ReviewListModule {}
