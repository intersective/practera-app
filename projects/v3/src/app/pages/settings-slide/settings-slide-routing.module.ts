import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingsSlidePage } from './settings-slide.page';

const routes: Routes = [
  {
    path: '',
    component: SettingsSlidePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsSlidePageRoutingModule {}
