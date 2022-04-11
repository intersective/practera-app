import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReviewDesktopPage } from './review-desktop.page';

const routes: Routes = [
  {
    path: '',
    component: ReviewDesktopPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReviewDesktopPageRoutingModule {}
