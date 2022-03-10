import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotificationsSlidePage } from './notifications-slide.page';

const routes: Routes = [
  {
    path: '',
    component: NotificationsSlidePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificationsSlidePageRoutingModule {}
