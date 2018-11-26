import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TabsRoutingModule } from './tabs-routing.module';

import { TabsComponent } from './tabs.component';

import { HomeModule } from '../home/home.module';
import { ActivityModule } from '../activity/activity.module';
import { ProjectModule } from '../project/project.module';
import { ChatModule } from '../chat/chat.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabsRoutingModule,
    HomeModule,
    ActivityModule,
    ProjectModule,
    ChatModule
  ],
  declarations: [ TabsComponent ]
})
export class TabsModule {}
