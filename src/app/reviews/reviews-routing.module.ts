import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReviewsComponent }    from './reviews.component';
import { ReviewsRoutingComponent } from './reviews-routing.components';

const reviewsRoutes: Routes = [
  { 
  	path: '', 
  	component: ReviewsRoutingComponent,
  	children: [
  	  {
  	    path: '',
  	    component: ReviewsComponent
  	  }
  	]
  }
];
 @NgModule({
  imports: [ RouterModule.forChild(reviewsRoutes) ],
  exports: [ RouterModule ]
})
export class ReviewsRoutingModule { } 