import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsPage } from '../settings/settings.page';

import { SettingsSlidePage } from './settings-slide.page';

const routes: Routes = [
  {
    path: '',
    component: SettingsSlidePage,
    children: [
      {
        path: '',
        component: SettingsPage,
        outlet: 'setting'
      }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsSlidePageRoutingModule {}
