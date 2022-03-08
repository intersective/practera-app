import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActivityListPage } from './activity-list.page';

const routes: Routes = [
  {
    path: '',
    component: ActivityListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActivityListPageRoutingModule {}
