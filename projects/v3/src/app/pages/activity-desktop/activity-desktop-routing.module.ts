import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SinglePageDeactivateGuard } from '@v3/app/guards/single-page-deactivate.guard';

import { ActivityDesktopPage } from './activity-desktop.page';

const routes: Routes = [
  {
    path: ':id',
    component: ActivityDesktopPage,
    canDeactivate: [SinglePageDeactivateGuard],
    data: { reuse: false }
  },
  {
    path: ':contextId/:id',
    component: ActivityDesktopPage,
    data: {
      action: 'Assessment'
    },
    canDeactivate: [SinglePageDeactivateGuard],
  },
  {
    path: ':contextId/:id/:assessmentId',
    component: ActivityDesktopPage,
    data: {
      action: 'Assessment'
    },
    canDeactivate: [SinglePageDeactivateGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActivityDesktopPageRoutingModule {}
