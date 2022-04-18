import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotificationsSlidePageRoutingModule } from './notifications-slide-routing.module';

import { NotificationsSlidePage } from './notifications-slide.page';
import { NotificationsPageModule } from '../notifications/notifications.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotificationsSlidePageRoutingModule,
    NotificationsPageModule
  ],
  declarations: [NotificationsSlidePage]
})
export class NotificationsSlidePageModule {}
