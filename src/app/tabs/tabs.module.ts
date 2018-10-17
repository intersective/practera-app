import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TabsRoutingModule } from './tabs.router.module';

import { TabsComponent } from './tabs.component';
import { SettingModule } from '../setting/setting.module';
import { HomeModule } from '../home/home.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabsRoutingModule,
    HomeModule,
    SettingModule
  ],
  declarations: [TabsComponent]
})
export class TabsModule {}
