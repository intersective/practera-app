import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActivityMobilePage } from './activity-mobile.page';

const routes: Routes = [
  {
    path: ':id',
    component: ActivityMobilePage
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActivityMobilePageRoutingModule {}
