import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReviewsComponent }    from './reviews.component';

 const ReviewsRoutes: Routes = [
  { path: '',  component: ReviewsComponent }
 
];
 @NgModule({
  imports: [
    RouterModule.forChild(ReviewsRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class ReviewsRoutingModule { } 