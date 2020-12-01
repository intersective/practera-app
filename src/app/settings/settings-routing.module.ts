import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserResolverService } from '@services/user-resolver.service';
import { SettingsRoutingComponent } from './settings-routing.component';
import { SettingsComponent } from './settings.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsRoutingComponent,
    children: [
      {
        path: '',
        component: SettingsComponent
      }
    ],
    resolve: {
      user: UserResolverService,
    },
  }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class SettingsRoutingModule {}
