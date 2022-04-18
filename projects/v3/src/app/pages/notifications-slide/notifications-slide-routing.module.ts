import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotificationsPage } from '../notifications/notifications.page';

import { NotificationsSlidePage } from './notifications-slide.page';

const routes: Routes = [
  {
    path: '',
    component: NotificationsSlidePage,
    children: [
      {
        path: '',
        component: NotificationsPage,
        outlet: 'notifications'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificationsSlidePageRoutingModule {}
