import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReviewListPage } from './review-list.page';

const routes: Routes = [
  {
    path: '',
    component: ReviewListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReviewListPageRoutingModule {}
