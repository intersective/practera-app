import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActivityDesktopPage } from './activity-desktop.page';

const routes: Routes = [
  {
    path: ':id',
    component: ActivityDesktopPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActivityDesktopPageRoutingModule {}
