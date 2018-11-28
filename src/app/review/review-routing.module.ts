import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ReviewComponent } from './review.component';
import { ReviewListComponent } from './review-list/review-list.component';
import { ReviewDetailComponent } from './review-detail/review-detail.component';

const routes: Routes = [
  {
    path: '',
    component: ReviewComponent,
    children: [
      {
        path: '',
        redirectTo: '/review/review-list'
      },
      {
        path: 'review-list',
        component: ReviewListComponent
      },
      {
        path: 'review-detail',
        component: ReviewDetailComponent
      }
    ]
  }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class ReviewRoutingModule {}
