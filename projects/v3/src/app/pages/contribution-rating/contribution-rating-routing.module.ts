import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContributionRatingPage } from './contribution-rating.page';

const routes: Routes = [
  { path: '', component: ContributionRatingPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContributionRatingRoutingModule {}
