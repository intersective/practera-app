import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ActivityListPageRoutingModule } from './activity-list-routing.module';

import { ActivityListPage } from './activity-list.page';
import { ActivityDetailPageModule } from '../activity-detail/activity-detail.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ActivityListPageRoutingModule,
    ActivityDetailPageModule,
  ],
  declarations: [ActivityListPage]
})
export class ActivityListPageModule {}
