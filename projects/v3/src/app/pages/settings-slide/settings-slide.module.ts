import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SettingsSlidePageRoutingModule } from './settings-slide-routing.module';

import { SettingsSlidePage } from './settings-slide.page';
import { SettingsPageModule } from '../settings/settings.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SettingsSlidePageRoutingModule,
    SettingsPageModule,
  ],
  declarations: [SettingsSlidePage],
  exports: [SettingsSlidePage]
})
export class SettingsSlidePageModule {}
