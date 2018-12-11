import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../auth/auth.guard';

import { TabsComponent } from './tabs.component';
import { ChatListComponent } from '../chat/chat-list/chat-list.component';

const routes: Routes = [
  {
    path: 'app',
    component: TabsComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: '/app/(home:home)',
        pathMatch: 'full'
      },
      {
        path: 'home',
        outlet: 'home',
        loadChildren: '../home/home.module#HomeModule',
      },
      {
        path: 'project',
        outlet: 'project',
        loadChildren: '../project/project.module#ProjectModule'
      },
      {
        path: 'activity',
        outlet: 'project',
        loadChildren: '../activity/activity.module#ActivityModule'
      },
      {
        path: 'reviews',
        outlet: 'reviews',
        loadChildren: '../reviews/reviews.module#ReviewsModule'
      },
      {
        path: 'chat',
        outlet: 'chat',
        component: ChatListComponent
      },
      {
        path: 'settings',
        outlet: 'settings',
        loadChildren: '../settings/settings.module#SettingsModule'
      }
    ]
  }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class TabsRoutingModule {}
