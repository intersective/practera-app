import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReviewMobilePage } from './review-mobile.page';

const routes: Routes = [
  {
    path: '',
    component: ReviewMobilePage
  },
  {
    path: ':submissionId',
    component: ReviewMobilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReviewMobilePageRoutingModule {}
