import { NgModule } from '@angular/core';
import { ContributionRatingPage } from './contribution-rating.page';
import { ContributionRatingRoutingModule } from './contribution-rating-routing.module';
import { ComponentsModule } from '@v3/app/components/components.module';
import { PersonalisedHeaderModule } from '@v3/app/personalised-header/personalised-header.module';

@NgModule({
  imports: [
    ComponentsModule,
    ContributionRatingRoutingModule,
    PersonalisedHeaderModule,
  ],
  declarations: [ContributionRatingPage],
})
export class ContributionRatingModule {}
