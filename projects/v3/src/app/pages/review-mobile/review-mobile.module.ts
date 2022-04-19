import { NgModule } from '@angular/core';

import { ReviewMobilePageRoutingModule } from './review-mobile-routing.module';
import { ReviewMobilePage } from './review-mobile.page';
import { ComponentsModule } from '@v3/app/components/components.module';
import { PersonalisedHeaderModule } from '@v3/app/personalised-header/personalised-header.module';

@NgModule({
  imports: [
    ComponentsModule,
    ReviewMobilePageRoutingModule,
    PersonalisedHeaderModule,
  ],
  declarations: [ReviewMobilePage]
})
export class ReviewMobilePageModule {}
