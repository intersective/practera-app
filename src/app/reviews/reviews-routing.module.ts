import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReviewsRoutingComponent } from './reviews-routing.component';
import { ReviewsComponent } from './reviews.component';

const routes: Routes = [
  {
    path: '',
    component: ReviewsRoutingComponent,
    children: [
      {
        path: '',
        component: ReviewsComponent
      },
      {
        path: ':submissionId',
        component: ReviewsComponent
      }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReviewsRoutingModule { }
