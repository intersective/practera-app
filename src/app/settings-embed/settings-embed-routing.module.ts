import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SettingsEmbedRoutingComponent } from './settings-embed-routing.component';
import { SettingsEmbedComponent } from './settings-embed.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsEmbedRoutingComponent,
    children: [
      {
        path: '',
        component: SettingsEmbedComponent
      }
    ]
  }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class SettingsEmbedRoutingModule {}
