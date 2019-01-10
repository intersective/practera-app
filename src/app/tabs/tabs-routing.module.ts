import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../auth/auth.guard';

import { TabsComponent } from './tabs.component';

const routes: Routes = [
  {
    path: 'app',
    component: TabsComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'home',
        children: [
          {
            path: '',
            loadChildren: '../home/home.module#HomeModule',
          }
        ]
      },
      {
        path: 'project',
        children: [
          {
            path: '',
            loadChildren: '../project/project.module#ProjectModule'
          }
        ]
      },
      {
        path: 'activity',
        children: [
          {
            path: '',
            loadChildren: '../activity/activity.module#ActivityModule'
          }
        ]
      },
      {
        path: 'reviews',
        children: [
          {
            path: '',
            loadChildren: '../reviews/reviews.module#ReviewsModule'
          }
        ]
      },
      {
        path: 'chat',
        children: [
          {
            path: '',
            loadChildren: '../chat/chat.module#ChatModule',
          }
        ]
      },
      {
        path: 'settings',
        children: [
          {
            path: '',
            loadChildren: '../settings/settings.module#SettingsModule'
          }
        ]
      }
    ]
  },
  {
    path: '',
    redirectTo: '/app/(home:home)',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class TabsRoutingModule {}
