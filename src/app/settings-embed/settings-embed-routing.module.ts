import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SettingsEmbedRoutingComponent } from './settings-embed-routing.component';
import { SettingsComponent } from '../settings/settings.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsEmbedRoutingComponent,
    children: [
      {
        path: '',
        component: SettingsComponent,
        data: {
          mode: 'embed'
        }
      }
    ]
  }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class SettingsEmbedRoutingModule {}
