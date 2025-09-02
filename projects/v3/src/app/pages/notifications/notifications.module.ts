import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotificationsPageRoutingModule } from './notifications-routing.module';

import { NotificationsPage } from './notifications.page';
import { ComponentsModule } from '@v3/app/components/components.module';
import { TooltipModule } from '@v3/app/directives/tooltip/tooltip.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotificationsPageRoutingModule,
    ComponentsModule,
    TooltipModule,
  ],
  declarations: [
    NotificationsPage,
  ]
})
export class NotificationsPageModule {}
