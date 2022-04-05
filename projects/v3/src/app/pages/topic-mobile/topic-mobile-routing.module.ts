import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TopicMobilePage } from './topic-mobile.page';

const routes: Routes = [
  {
    path: ':activityId/:id',
    component: TopicMobilePage
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TopicMobilePageRoutingModule {}
